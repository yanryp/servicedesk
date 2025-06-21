// Enhanced Ticket Routes with ITIL Service Catalog and KASDA Support
import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, AuthenticatedRequest } from '../middleware/authMiddleware';
import asyncHandler from '../utils/asyncHandler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const prisma = new PrismaClient();


// File upload configuration
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|csv|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only common file types are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Helper function to calculate SLA based on service type and business impact
const calculateSlaDueDate = (
  requestType: string, 
  businessImpact: string, 
  isKasdaTicket: boolean,
  departmentType: string
): Date => {
  const now = new Date();
  let hours = 24; // Default

  if (isKasdaTicket || departmentType === 'business') {
    // KASDA and business services have longer SLAs
    switch (businessImpact) {
      case 'critical':
        hours = 8; // 8 hours for critical government issues
        break;
      case 'high':
        hours = 24; // 1 business day
        break;
      case 'medium':
        hours = 48; // 2 business days
        break;
      case 'low':
        hours = 72; // 3 business days
        break;
    }
  } else {
    // Technical services have faster SLAs
    switch (businessImpact) {
      case 'critical':
        hours = 2;
        break;
      case 'high':
        hours = 4;
        break;
      case 'medium':
        hours = 8;
        break;
      case 'low':
        hours = 24;
        break;
    }
  }

  return new Date(now.getTime() + (hours * 60 * 60 * 1000));
};

// Determine target department based on service catalog
const determineTargetDepartment = async (serviceItemId: number) => {
  const serviceItem = await prisma.serviceItem.findUnique({
    where: { id: serviceItemId },
    include: {
      serviceCatalog: {
        include: {
          department: true
        }
      }
    }
  });

  return serviceItem?.serviceCatalog?.department;
};

// Create new ticket with ITIL service catalog support
router.post('/create', protect, upload.array('attachments', 5), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user } = req;
    const {
      title,
      description,
      serviceItemId,
      serviceTemplateId,
      customFieldValues = {},
      businessImpact = 'medium',
      governmentEntityId,
      // Optional user categorization
      userRootCause,
      userIssueCategory
    } = req.body;

    // Validate required fields
    if (!title || !description || !serviceItemId) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and service item are required'
      });
    }

    // Get service information for routing and validation
    const serviceItem = await prisma.serviceItem.findUnique({
      where: { id: parseInt(serviceItemId) },
      include: {
        serviceCatalog: {
          include: {
            department: true
          }
        },
        templates: {
          where: { id: serviceTemplateId ? parseInt(serviceTemplateId) : undefined }
        }
      }
    });

    if (!serviceItem) {
      return res.status(404).json({
        success: false,
        message: 'Service item not found'
      });
    }

    // KASDA access validation  
    if (serviceItem.isKasdaRelated && !user?.isKasdaUser && !user?.isBusinessReviewer) {
      console.log('KASDA access denied - User:', user, 'Service Item KASDA related:', serviceItem.isKasdaRelated);
      return res.status(403).json({
        success: false,
        message: 'Access denied. KASDA services are restricted to authorized users.'
      });
    }

    // Calculate SLA
    const slaDueDate = calculateSlaDueDate(
      serviceItem.requestType,
      businessImpact,
      serviceItem.isKasdaRelated,
      serviceItem.serviceCatalog.department.departmentType
    );

    // Determine if business approval is required
    const requiresBusinessApproval = serviceItem.isKasdaRelated || 
      serviceItem.requiresGovApproval ||
      (serviceTemplateId && serviceItem.templates[0]?.requiresBusinessApproval);

    // Prepare categorization data
    const currentTime = new Date();
    const clientIP = req.ip || req.connection.remoteAddress;
    
    // Smart categorization suggestions based on service type
    let suggestedRootCause = userRootCause;
    let suggestedIssueCategory = userIssueCategory;
    
    // Auto-suggest if user didn't provide categorization
    if (!suggestedIssueCategory) {
      if (serviceItem.requestType === 'service_request') {
        suggestedIssueCategory = 'request';
      } else if (serviceItem.requestType === 'incident') {
        suggestedIssueCategory = 'problem';
      }
      
      // KASDA services are typically requests
      if (serviceItem.isKasdaRelated) {
        suggestedIssueCategory = 'request';
      }
    }
    
    // Auto-suggest root cause for certain services
    if (!suggestedRootCause && serviceItem.name.toLowerCase().includes('password')) {
      suggestedRootCause = 'human_error';
    }

    // Create the ticket
    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        createdByUserId: user!.id,
        serviceItemId: parseInt(serviceItemId),
        serviceTemplateId: serviceTemplateId ? parseInt(serviceTemplateId) : null,
        serviceCatalogId: serviceItem.serviceCatalogId,
        requestType: serviceItem.requestType,
        businessImpact,
        isKasdaTicket: serviceItem.isKasdaRelated,
        governmentEntityId: governmentEntityId ? parseInt(governmentEntityId) : null,
        requiresBusinessApproval,
        status: requiresBusinessApproval ? 'awaiting_approval' : 'open',
        slaDueDate,
        // Add categorization fields
        userRootCause: suggestedRootCause || null,
        userIssueCategory: suggestedIssueCategory || null,
        userCategorizedAt: (suggestedRootCause || suggestedIssueCategory) ? currentTime : null,
        userCategorizedIP: (suggestedRootCause || suggestedIssueCategory) ? clientIP : null,
        // Set confirmed values if user provided categorization
        confirmedRootCause: suggestedRootCause || null,
        confirmedIssueCategory: suggestedIssueCategory || null
      },
      include: {
        serviceCatalog: {
          include: {
            department: true
          }
        },
        serviceItem: true,
        governmentEntity: true
      }
    });

    // Handle file attachments
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const attachments = req.files.map((file: Express.Multer.File) => ({
        ticketId: ticket.id,
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        fileType: file.mimetype,
        uploadedByUserId: user!.id
      }));

      await prisma.ticketAttachment.createMany({
        data: attachments
      });
    }

    // Handle custom field values
    if (customFieldValues && Object.keys(customFieldValues).length > 0) {
      const fieldValues = Object.entries(customFieldValues).map(([fieldId, value]) => ({
        ticketId: ticket.id,
        fieldDefinitionId: parseInt(fieldId),
        value: String(value)
      }));

      await prisma.ticketServiceFieldValue.createMany({
        data: fieldValues,
        skipDuplicates: true
      });
    }

    // Create business approval record if required
    if (requiresBusinessApproval) {
      // Find a business reviewer from the target department
      const businessReviewer = await prisma.user.findFirst({
        where: {
          departmentId: serviceItem.serviceCatalog.department.id,
          isBusinessReviewer: true,
          role: { in: ['manager', 'admin'] }
        }
      });

      if (businessReviewer) {
        await prisma.businessApproval.create({
          data: {
            ticketId: ticket.id,
            businessReviewerId: businessReviewer.id,
            approvalStatus: 'pending'
          }
        });
      }
    }

    // Get full ticket details for response
    const fullTicket = await prisma.ticket.findUnique({
      where: { id: ticket.id },
      include: {
        serviceCatalog: {
          include: {
            department: true
          }
        },
        serviceItem: true,
        serviceTemplate: true,
        governmentEntity: true,
        businessApproval: {
          include: {
            businessReviewer: {
              select: {
                id: true,
                username: true,
                email: true,
                role: true
              }
            }
          }
        },
        attachments: true,
        serviceFieldValues: {
          include: {
            fieldDefinition: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: fullTicket,
      routing: {
        targetDepartment: serviceItem.serviceCatalog.department.name,
        requiresBusinessApproval,
        isKasdaTicket: serviceItem.isKasdaRelated,
        estimatedResolution: slaDueDate
      }
    });

  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ticket',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}));

// Get tickets with department-based filtering
router.get('/', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user } = req;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority, 
      requestType,
      isKasdaOnly,
      businessImpact,
      search 
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    let whereClause: any = {};

    // Role-based filtering
    if (user?.role === 'admin') {
      // Admins can see all tickets
    } else if (user?.role === 'manager' || user?.isBusinessReviewer) {
      // Managers can see tickets from their department
      if (user.departmentId) {
        whereClause.OR = [
          { createdByUserId: user.id },
          { 
            serviceCatalog: {
              departmentId: user.departmentId
            }
          }
        ];
      }
    } else if (user?.role === 'technician') {
      // Technicians see tickets assigned to their department
      if (user.departmentId) {
        whereClause.serviceCatalog = {
          departmentId: user.departmentId
        };
      }
    } else {
      // Requesters see only their own tickets
      whereClause.createdByUserId = user?.id;
    }

    // Apply filters
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (requestType) whereClause.requestType = requestType;
    if (businessImpact) whereClause.businessImpact = businessImpact;
    if (isKasdaOnly === 'true') whereClause.isKasdaTicket = true;

    // Search functionality
    if (search) {
      whereClause.OR = [
        ...(whereClause.OR || []),
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // KASDA user filtering
    if (user?.isKasdaUser) {
      whereClause.OR = [
        { createdByUserId: user.id },
        { isKasdaTicket: true }
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        serviceCatalog: {
          include: {
            department: true
          }
        },
        serviceItem: true,
        governmentEntity: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        },
        businessApproval: {
          include: {
            businessReviewer: {
              select: {
                id: true,
                username: true,
                email: true,
                role: true
              }
            }
          }
        },
        attachments: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    });

    const totalTickets = await prisma.ticket.count({ where: whereClause });
    const totalPages = Math.ceil(totalTickets / take);

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          currentPage: parseInt(page as string),
          totalPages,
          totalTickets,
          hasNextPage: parseInt(page as string) < totalPages,
          hasPrevPage: parseInt(page as string) > 1
        }
      },
      userContext: {
        role: user?.role,
        isKasdaUser: user?.isKasdaUser,
        isBusinessReviewer: user?.isBusinessReviewer,
        departmentId: user?.departmentId
      }
    });

  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets'
    });
  }
}));

// Get pending business approvals (for business reviewers)
router.get('/pending-business-approvals', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user } = req;

    if (!user?.isBusinessReviewer) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only business reviewers can view pending approvals.'
      });
    }

    const pendingApprovals = await prisma.businessApproval.findMany({
      where: {
        approvalStatus: 'pending',
        businessReviewerId: user.id
      },
      include: {
        ticket: {
          include: {
            serviceCatalog: {
              include: {
                department: true
              }
            },
            serviceItem: true,
            governmentEntity: true,
            createdBy: {
              select: {
                id: true,
                username: true,
                email: true,
                role: true
              }
            },
            serviceFieldValues: {
              include: {
                fieldDefinition: true
              }
            },
            attachments: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      data: pendingApprovals
    });

  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending approvals'
    });
  }
}));

// Business approval action (approve/reject)
router.post('/business-approval/:ticketId', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user } = req;
    const { ticketId } = req.params;
    const { action, comments, govDocsVerified = false } = req.body;

    if (!user?.isBusinessReviewer) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only business reviewers can approve tickets.'
      });
    }

    if (!['approve', 'reject', 'review_required'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be approve, reject, or review_required.'
      });
    }

    const businessApproval = await prisma.businessApproval.findUnique({
      where: { ticketId: parseInt(ticketId) },
      include: {
        ticket: {
          include: {
            serviceItem: true,
            governmentEntity: true
          }
        }
      }
    });

    if (!businessApproval) {
      return res.status(404).json({
        success: false,
        message: 'Business approval record not found'
      });
    }

    if (businessApproval.businessReviewerId !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not assigned to review this ticket.'
      });
    }

    // Update business approval
    const updatedApproval = await prisma.businessApproval.update({
      where: { ticketId: parseInt(ticketId) },
      data: {
        approvalStatus: action,
        businessComments: comments,
        govDocsVerified,
        approvedAt: action === 'approve' ? new Date() : null
      }
    });

    // Update ticket status based on approval action
    let newTicketStatus = businessApproval.ticket.status;
    if (action === 'approve') {
      newTicketStatus = 'open'; // Ready for technical assignment
    } else if (action === 'reject') {
      newTicketStatus = 'rejected';
    } else if (action === 'review_required') {
      newTicketStatus = 'awaiting_changes';
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: parseInt(ticketId) },
      data: {
        status: newTicketStatus,
        businessComments: comments
      },
      include: {
        serviceCatalog: {
          include: {
            department: true
          }
        },
        serviceItem: true,
        governmentEntity: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: `Ticket ${action}d successfully`,
      data: {
        ticket: updatedTicket,
        approval: updatedApproval
      }
    });

  } catch (error) {
    console.error('Error processing business approval:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process business approval',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}));

// Get ticket details with full context
router.get('/:ticketId', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { user } = req;

    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(ticketId) },
      include: {
        serviceCatalog: {
          include: {
            department: true
          }
        },
        serviceItem: true,
        serviceTemplate: {
          include: {
            customFieldDefinitions: {
              orderBy: { sortOrder: 'asc' }
            }
          }
        },
        governmentEntity: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        },
        businessApproval: {
          include: {
            businessReviewer: {
              select: {
                id: true,
                username: true,
                email: true,
                role: true
              }
            }
          }
        },
        attachments: true,
        serviceFieldValues: {
          include: {
            fieldDefinition: true
          },
          orderBy: {
            fieldDefinition: {
              sortOrder: 'asc'
            }
          }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check access permissions
    const canView = user?.role === 'admin' ||
      ticket.createdByUserId === user?.id ||
      (user?.departmentId === ticket.serviceCatalog?.departmentId) ||
      (user?.isBusinessReviewer && ticket.isKasdaTicket) ||
      ticket.assignedToUserId === user?.id;

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this ticket.'
      });
    }

    res.json({
      success: true,
      data: ticket
    });

  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket'
    });
  }
}));

export default router;