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

// Unified ticket creation interface
export interface UnifiedTicketCreation {
  // Core Fields (all systems)
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  
  // ITIL Service Catalog Fields (enhanced + service catalog)
  serviceItemId?: number;
  serviceTemplateId?: number;
  serviceCatalogId?: number;
  
  // Legacy Support Fields
  itemId?: number;
  templateId?: number;
  
  // BSG Template Support
  bsgTemplateId?: number;
  
  // Business Process Fields
  businessImpact?: 'low' | 'medium' | 'high' | 'critical';
  requestType?: 'incident' | 'service_request' | 'change' | 'problem';
  isKasdaTicket?: boolean;
  requiresBusinessApproval?: boolean;
  governmentEntityId?: number;
  
  // Categorization Fields
  userRootCause?: string;
  userIssueCategory?: string;
  
  // Custom Field Values (unified)
  customFieldValues?: Record<string, any>;
  
  // File attachments
  attachments?: Express.Multer.File[];
}

// Unified ticket creation service
export class UnifiedTicketService {
  
  static async detectTemplateInfo(data: UnifiedTicketCreation): Promise<{
    type: 'service_template' | 'bsg_template' | 'legacy_template' | 'none';
    templateId?: number;
    template?: any;
  }> {
    if (data.serviceTemplateId) {
      const template = await prisma.serviceTemplate.findUnique({
        where: { id: data.serviceTemplateId },
        include: { customFieldDefinitions: true }
      });
      return { type: 'service_template', templateId: data.serviceTemplateId, template };
    }
    
    if (data.bsgTemplateId || data.templateId) {
      const templateId = data.bsgTemplateId || data.templateId!;
      const template = await prisma.bSGTemplate.findUnique({
        where: { id: templateId },
        include: { 
          fields: {
            include: {
              fieldType: true,
              options: true
            }
          },
          category: true 
        }
      });
      return { type: 'bsg_template', templateId, template };
    }
    
    if (data.itemId) {
      // Legacy item support - map to service items if possible
      const serviceItem = await prisma.serviceItem.findUnique({
        where: { id: data.itemId },
        include: { templates: true }
      });
      if (serviceItem?.templates[0]) {
        return { type: 'legacy_template', templateId: serviceItem.templates[0].id, template: serviceItem.templates[0] };
      }
    }
    
    return { type: 'none' };
  }
  
  static async calculateUnifiedSLA(data: UnifiedTicketCreation, templateInfo: any): Promise<Date> {
    const businessImpact = data.businessImpact || 'medium';
    const isKasdaTicket = data.isKasdaTicket || false;
    
    let hours = 24; // default 24 hours
    
    if (isKasdaTicket) {
      // Business services have different SLA based on impact
      switch (businessImpact) {
        case 'critical':
          hours = 4;
          break;
        case 'high':
          hours = 8;
          break;
        case 'medium':
          hours = 24;
          break;
        case 'low':
          hours = 72;
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
    
    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() + hours);
    return dueDate;
  }
  
  static async determineApprovalRequirement(data: UnifiedTicketCreation, templateInfo: any, user: any): Promise<boolean> {
    // Only requesters need approval - technicians and admins bypass approval
    if (user.role !== 'requester') {
      return false;
    }
    
    // Explicit approval requirement (only applies to requesters)
    if (data.requiresBusinessApproval !== undefined) {
      return data.requiresBusinessApproval;
    }
    
    // All requester tickets need approval per user requirements
    // KASDA tickets from requesters require approval
    if (data.isKasdaTicket) {
      return true;
    }
    
    // High/Critical impact tickets from requesters require approval
    if (data.businessImpact === 'critical' || data.businessImpact === 'high') {
      return true;
    }
    
    // Template-based approval rules (only for requesters)
    if (templateInfo.template?.requiresApproval) {
      return true;
    }
    
    // Default: All requester tickets need approval
    return true;
  }
  
  static async createUnifiedTicket(data: UnifiedTicketCreation, user: any): Promise<any> {
    console.log('UnifiedTicketService.createUnifiedTicket - Starting with data:', {
      title: data.title,
      bsgTemplateId: data.bsgTemplateId,
      serviceItemId: data.serviceItemId,
      isKasdaTicket: data.isKasdaTicket
    });

    const templateInfo = await this.detectTemplateInfo(data);
    console.log('UnifiedTicketService - Template info detected:', {
      type: templateInfo.type,
      templateId: templateInfo.templateId,
      hasTemplate: !!templateInfo.template
    });

    const slaDueDate = await this.calculateUnifiedSLA(data, templateInfo);
    const requiresApproval = await this.determineApprovalRequirement(data, templateInfo, user);
    
    // Determine service item and catalog
    let serviceItemId = data.serviceItemId;
    let serviceCatalogId = data.serviceCatalogId;
    
    if (!serviceItemId && data.itemId) {
      // Map legacy item to service item
      const serviceItem = await prisma.serviceItem.findUnique({
        where: { id: data.itemId },
        include: { serviceCatalog: true }
      });
      if (serviceItem) {
        serviceItemId = serviceItem.id;
        serviceCatalogId = serviceItem.serviceCatalogId;
      }
    }
    
    if (serviceItemId && !serviceCatalogId) {
      const serviceItem = await prisma.serviceItem.findUnique({
        where: { id: serviceItemId },
        include: { serviceCatalog: true }
      });
      serviceCatalogId = serviceItem?.serviceCatalogId;
    }
    
    // Create ticket with unified data model
    const ticketData: any = {
      title: data.title,
      description: data.description,
      createdByUserId: user.id,
      requestType: data.requestType || 'incident',
      businessImpact: data.businessImpact || 'medium',
      isKasdaTicket: data.isKasdaTicket || false,
      requiresBusinessApproval: requiresApproval,
      status: requiresApproval ? 'pending_approval' : 'open',
      slaDueDate,
      // Categorization fields
      userRootCause: data.userRootCause,
      userIssueCategory: data.userIssueCategory,
      userCategorizedAt: (data.userRootCause || data.userIssueCategory) ? new Date() : null,
      userCategorizedIP: null, // Will be set by middleware
      // Set confirmed values if user provided categorization
      confirmedRootCause: data.userRootCause,
      confirmedIssueCategory: data.userIssueCategory
    };

    // Add optional foreign keys only if they exist
    if (serviceItemId) ticketData.serviceItemId = serviceItemId;
    if (templateInfo.templateId && templateInfo.type === 'service_template') {
      ticketData.serviceTemplateId = templateInfo.templateId;
    }
    if (serviceCatalogId) ticketData.serviceCatalogId = serviceCatalogId;
    if (data.governmentEntityId) ticketData.governmentEntityId = data.governmentEntityId;
    
    const ticket = await prisma.ticket.create({
      data: ticketData,
      include: {
        serviceCatalog: {
          include: {
            department: true
          }
        },
        serviceItem: true,
        governmentEntity: true,
        createdBy: {
          include: {
            department: true,
            manager: true
          }
        }
      }
    });
    
    // Handle custom field values
    if (data.customFieldValues && Object.keys(data.customFieldValues).length > 0) {
      await this.saveCustomFieldValues(ticket.id, data.customFieldValues, templateInfo);
    }
    
    // Handle file attachments
    if (data.attachments && data.attachments.length > 0) {
      await this.saveAttachments(ticket.id, data.attachments);
    }
    
    // Create business approval if required
    if (requiresApproval) {
      await this.createBusinessApproval(ticket);
    }
    
    return ticket;
  }
  
  static async saveCustomFieldValues(ticketId: number, customFieldValues: Record<string, any>, templateInfo: any): Promise<void> {
    if (templateInfo.type === 'bsg_template' && templateInfo.template) {
      // Save BSG template field values
      const bsgFieldValues = [];
      for (const [fieldName, value] of Object.entries(customFieldValues)) {
        const fieldDef = templateInfo.template.fields?.find((f: any) => f.fieldName === fieldName || f.fieldLabel === fieldName);
        if (fieldDef && value !== undefined && value !== null && value !== '') {
          bsgFieldValues.push({
            ticketId,
            fieldId: fieldDef.id,
            fieldValue: typeof value === 'object' ? JSON.stringify(value) : String(value)
          });
        }
      }
      
      if (bsgFieldValues.length > 0) {
        await prisma.bSGTicketFieldValue.createMany({
          data: bsgFieldValues
        });
      }
    } else if (templateInfo.type === 'service_template') {
      // Save service template field values
      const serviceFieldValues = [];
      for (const [fieldName, value] of Object.entries(customFieldValues)) {
        const fieldDef = templateInfo.template?.customFieldDefinitions?.find((f: any) => f.fieldName === fieldName);
        if (fieldDef) {
          serviceFieldValues.push({
            ticketId,
            fieldDefinitionId: fieldDef.id,
            value: typeof value === 'object' ? JSON.stringify(value) : String(value)
          });
        }
      }
      
      if (serviceFieldValues.length > 0) {
        await prisma.ticketServiceFieldValue.createMany({
          data: serviceFieldValues
        });
      }
    }
  }
  
  static async saveAttachments(ticketId: number, attachments: Express.Multer.File[]): Promise<void> {
    const attachmentData = attachments.map(file => ({
      ticketId,
      fileName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      fileType: file.mimetype
    }));
    
    await prisma.ticketAttachment.createMany({
      data: attachmentData
    });
  }
  
  static async createBusinessApproval(ticket: any): Promise<void> {
    console.log('UnifiedTicketService.createBusinessApproval - Finding unit-based manager for approval');
    
    // Get the ticket creator's unit information
    const ticketCreator = await prisma.user.findUnique({
      where: { id: ticket.createdByUserId },
      include: {
        unit: true,
        department: true
      }
    });
    
    if (!ticketCreator) {
      console.log('❌ Ticket creator not found for approval');
      return;
    }
    
    // Find managers from the same unit who can approve
    let availableManagers: any[] = [];
    
    if (ticketCreator.unitId) {
      // Find managers in the same unit
      availableManagers = await prisma.user.findMany({
        where: {
          unitId: ticketCreator.unitId,
          role: { in: ['manager', 'admin'] },
          isAvailable: true,
          isBusinessReviewer: true
        },
        orderBy: [
          { role: 'desc' }, // Prefer admins over managers
          { id: 'asc' }     // Consistent ordering
        ]
      });
      
      console.log(`Found ${availableManagers.length} unit managers for unit ${ticketCreator.unit?.name}`);
    }
    
    // Fallback to department managers if no unit managers found
    if (availableManagers.length === 0 && ticketCreator.departmentId) {
      availableManagers = await prisma.user.findMany({
        where: {
          departmentId: ticketCreator.departmentId,
          role: { in: ['manager', 'admin'] },
          isAvailable: true,
          isBusinessReviewer: true
        },
        orderBy: [
          { role: 'desc' },
          { id: 'asc' }
        ]
      });
      
      console.log(`Found ${availableManagers.length} department managers for ${ticketCreator.department?.name}`);
    }
    
    // Final fallback to any available business reviewer
    if (availableManagers.length === 0) {
      availableManagers = await prisma.user.findMany({
        where: {
          role: { in: ['manager', 'admin'] },
          isAvailable: true,
          isBusinessReviewer: true
        },
        orderBy: [
          { role: 'desc' },
          { id: 'asc' }
        ],
        take: 1
      });
      
      console.log(`Found ${availableManagers.length} fallback managers`);
    }
    
    if (availableManagers.length > 0) {
      const selectedManager = availableManagers[0];
      
      await prisma.businessApproval.create({
        data: {
          ticketId: ticket.id,
          businessReviewerId: selectedManager.id,
          approvalStatus: 'pending',
          businessComments: `Ticket #${ticket.id}: ${ticket.title} - Assigned to ${selectedManager.username} (${ticketCreator.unit?.name || ticketCreator.department?.name || 'No unit/dept'})`
        }
      });
      
      console.log(`✅ Business approval created with manager: ${selectedManager.username} (Unit: ${ticketCreator.unit?.name || 'N/A'})`);
    } else {
      console.log('❌ No available managers found for approval');
    }
  }
}

// Unified ticket creation endpoint (Stage 1 Migration)
router.post('/unified-create', protect, upload.array('attachments', 5), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user } = req;
    const unifiedData: UnifiedTicketCreation = {
      ...req.body,
      attachments: req.files as Express.Multer.File[]
    };

    console.log('Creating unified ticket with data:', { 
      title: unifiedData.title, 
      type: unifiedData.serviceItemId ? 'service_catalog' : unifiedData.templateId ? 'bsg_template' : 'legacy'
    });

    const ticket = await UnifiedTicketService.createUnifiedTicket(unifiedData, user);

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: ticket
    });

  } catch (error) {
    console.error('Error creating unified ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ticket',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}));

// Legacy compatibility endpoint (maps to unified creation)
router.post('/legacy-create', protect, upload.array('attachments', 5), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user } = req;
    
    // Map legacy request format to unified format
    const unifiedData: UnifiedTicketCreation = {
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
      itemId: req.body.itemId,
      templateId: req.body.templateId,
      customFieldValues: req.body.customFieldValues,
      attachments: req.files as Express.Multer.File[]
    };

    console.log('Creating legacy-format ticket via unified service');

    const ticket = await UnifiedTicketService.createUnifiedTicket(unifiedData, user);

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: ticket
    });

  } catch (error) {
    console.error('Error creating legacy ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ticket',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}));

// Create new ticket with ITIL service catalog support (using unified service)
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

    // Note: Removed KASDA access restrictions - all branch users can create any ticket type
    // Routing will be determined by ticket content, not user type

    // Calculate SLA
    const slaDueDate = calculateSlaDueDate(
      serviceItem.requestType,
      businessImpact,
      serviceItem.isKasdaRelated,
      serviceItem.serviceCatalog.department.departmentType
    );

    // Determine if business approval is required
    // Only requesters need approval - technicians and admins bypass approval
    const requiresBusinessApproval = user!.role === 'requester' && (
      serviceItem.isKasdaRelated || 
      serviceItem.requiresGovApproval ||
      (serviceTemplateId && serviceItem.templates[0]?.requiresBusinessApproval) ||
      true  // All requester tickets need approval per user requirements
    );

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
        status: requiresBusinessApproval ? 'pending_approval' : 'open',
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
      templateCategory,
      skill,
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

    // Template category filtering - search through service items and BSG templates
    if (templateCategory) {
      whereClause.OR = [
        ...(whereClause.OR || []),
        {
          serviceItem: {
            name: { contains: templateCategory as string, mode: 'insensitive' }
          }
        },
        {
          serviceItem: {
            description: { contains: templateCategory as string, mode: 'insensitive' }
          }
        }
      ];
    }

    // Skill-based filtering - filter by assigned technician's skill
    if (skill && user?.role === 'technician') {
      whereClause.assignedTo = {
        primarySkill: { contains: skill as string, mode: 'insensitive' }
      };
    }

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

// Get tickets pending approval for managers (enhanced version with template info)
router.get('/pending-approvals', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req;

  if (user?.role !== 'manager' && user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Manager role required.'
    });
  }

  try {
    console.log('Fetching unit-based pending approvals for user:', user.id, user.username, 'unit:', user.unitId);

    // NEW: Query BusinessApproval table for tickets assigned to this manager
    const businessApprovals = await prisma.businessApproval.findMany({
      where: {
        businessReviewerId: user.id,
        approvalStatus: 'pending'
      },
      include: {
        ticket: {
          include: {
            createdBy: {
              include: {
                department: {
                  select: {
                    id: true,
                    name: true
                  }
                },
                unit: {
                  select: {
                    id: true,
                    name: true,
                    unitType: true
                  }
                }
              }
            },
            assignedTo: {
              include: {
                department: {
                  select: {
                    id: true,
                    name: true
                  }
                },
                unit: {
                  select: {
                    id: true,
                    name: true,
                    unitType: true
                  }
                }
              }
            },
            serviceCatalog: {
              select: {
                name: true,
                department: {
                  select: {
                    name: true
                  }
                }
              }
            },
            serviceItem: {
              select: {
                name: true,
                description: true
              }
            },
            template: {
              select: {
                name: true
              }
            },
            customFieldValues: {
              include: {
                fieldDefinition: {
                  select: {
                    fieldName: true,
                    fieldLabel: true
                  }
                }
              }
            }
          }
        },
        businessReviewer: {
          include: {
            unit: {
              select: {
                id: true,
                name: true,
                unitType: true
              }
            },
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Extract tickets from business approvals and add approval context
    const pendingTickets = businessApprovals.map(approval => ({
      ...approval.ticket,
      businessApprovalId: approval.id,
      approvalStatus: approval.approvalStatus,
      businessComments: approval.businessComments,
      approvalCreatedAt: approval.createdAt,
      businessReviewer: approval.businessReviewer
    }));

    console.log(`Found ${pendingTickets.length} unit-based pending approvals for manager ${user.username}`);
    console.log('Approvals details:', pendingTickets.map(t => ({
      ticketId: t.id,
      title: t.title,
      createdBy: t.createdBy?.username,
      createdByUnit: t.createdBy?.unit?.name,
      approvalId: t.businessApprovalId
    })));

    res.json(pendingTickets);

  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending approvals'
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

// BSG-specific ticket creation endpoint
router.post('/bsg-tickets', protect, upload.array('attachments', 5), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user } = req;
    const {
      templateId,
      templateNumber,
      title,
      description,
      priority = 'medium',
      customFields = {}
    } = req.body;

    // Validate required fields
    if (!templateId || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Template ID, title, and description are required'
      });
    }

    // Get BSG template information
    const bsgTemplate = await prisma.bSGTemplate.findUnique({
      where: { id: parseInt(templateId) },
      include: {
        category: true,
        fields: {
          include: {
            fieldType: true,
            options: true
          }
        }
      }
    });

    if (!bsgTemplate) {
      return res.status(404).json({
        success: false,
        message: 'BSG template not found'
      });
    }

    // Department routing logic for BSG tickets - based on template category, not user type
    let targetDepartmentId = user!.departmentId; // Default to user's department
    
    // Define template category to department mapping
    const KASDA_BSGDIRECT_CATEGORIES = [
      'KASDA', 'BSGDirect', 'KLAIM', 'Government Banking'
    ];
    
    const IT_CATEGORIES = [
      'OLIBS', 'ATM', 'Core Banking', 'BSGTouch', 'SMS Banking', 'BSG QRIS'
    ];
    
    // Determine if this is a KASDA/BSGDirect ticket based on template category
    const templateCategory = bsgTemplate.category.name;
    const isKasdaOrBsgDirectTicket = KASDA_BSGDIRECT_CATEGORIES.some(cat => 
      templateCategory.includes(cat)
    );
    
    if (isKasdaOrBsgDirectTicket) {
      // Route KASDA/BSGDirect tickets to "Dukungan dan Layanan" department
      const dukunganDepartment = await prisma.department.findFirst({
        where: { name: 'Dukungan dan Layanan' }
      });
      if (dukunganDepartment) {
        targetDepartmentId = dukunganDepartment.id;
      }
    } else if (IT_CATEGORIES.some(cat => templateCategory.includes(cat))) {
      // Route technical banking tickets to "Information Technology" department
      const itDepartment = await prisma.department.findFirst({
        where: { name: 'Information Technology' }
      });
      if (itDepartment) {
        targetDepartmentId = itDepartment.id;
      }
    }
    // Otherwise, keep user's default department

    // Calculate SLA based on template category and priority
    const now = new Date();
    let slaDurationHours = 24; // Default 24 hours

    switch (priority) {
      case 'urgent':
        slaDurationHours = 4;
        break;
      case 'high':
        slaDurationHours = 8;
        break;
      case 'medium':
        slaDurationHours = 24;
        break;
      case 'low':
        slaDurationHours = 48;
        break;
    }

    // Banking systems might need faster response
    if (bsgTemplate.category.name.includes('OLIBS') || bsgTemplate.category.name.includes('KLAIM')) {
      slaDurationHours = Math.max(2, slaDurationHours / 2); // Faster for critical banking systems
    }

    const slaDueDate = new Date(now.getTime() + (slaDurationHours * 60 * 60 * 1000));

    // Determine if manager approval is required
    // All requester tickets need approval per user requirements
    const requiresApproval = user!.role === 'requester';

    // Create the BSG ticket with proper field mappings
    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority,
        status: requiresApproval ? 'pending_approval' : 'open',
        createdByUserId: user!.id,
        slaDueDate: slaDueDate,
        // BSG-specific fields
        templateId: parseInt(templateId),
        requestType: 'service_request', // BSG tickets are service requests
        businessImpact: priority === 'urgent' ? 'high' : priority === 'high' ? 'medium' : 'low',
        // Mark as KASDA ticket based on template content, not user type
        isKasdaTicket: isKasdaOrBsgDirectTicket,
        // Set basic categorization for BSG tickets
        userIssueCategory: 'request',
        userRootCause: bsgTemplate.category.name.toLowerCase().includes('password') ? 'human_error' : 'system_error',
        userCategorizedAt: new Date(),
        userCategorizedIP: req.ip || req.connection.remoteAddress || '127.0.0.1',
        confirmedIssueCategory: 'request',
        confirmedRootCause: bsgTemplate.category.name.toLowerCase().includes('password') ? 'human_error' : 'system_error'
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

    // Handle BSG custom field values
    if (customFields && Object.keys(customFields).length > 0) {
      try {
        const parsedCustomFields = typeof customFields === 'string' ? JSON.parse(customFields) : customFields;
        
        // Get the BSG template fields to map field names to IDs
        const templateFields = await prisma.bSGTemplateField.findMany({
          where: { templateId: parseInt(templateId) }
        });
        
        // Create field name to ID mapping
        const fieldNameToIdMap: Record<string, number> = {};
        templateFields.forEach(field => {
          fieldNameToIdMap[field.fieldName] = field.id;
        });
        
        // Create BSG field values for this ticket
        const bsgFieldValues = Object.entries(parsedCustomFields)
          .filter(([fieldName]) => fieldNameToIdMap[fieldName]) // Only include fields that exist
          .map(([fieldName, value]) => ({
            ticketId: ticket.id,
            fieldId: fieldNameToIdMap[fieldName],
            fieldValue: String(value)
          }));

        if (bsgFieldValues.length > 0) {
          await prisma.bSGTicketFieldValue.createMany({
            data: bsgFieldValues,
            skipDuplicates: true
          });
        }
      } catch (error) {
        console.error('Error saving BSG custom fields:', error);
        // Don't fail the ticket creation if custom fields fail
      }
    }

    // Create approval record if required (simplified for now)
    if (requiresApproval) {
      // For now, just log that approval is required
      // TODO: Implement proper approval workflow
      console.log(`BSG Ticket ${ticket.id} requires manager approval`);
    }

    // Auto-assignment logic for BSG tickets
    if (!requiresApproval && targetDepartmentId) {
      // Find available technician in target department with BSG skills
      const availableTechnician = await prisma.user.findFirst({
        where: {
          departmentId: targetDepartmentId,
          role: 'technician',
          isAvailable: true,
          // Look for technicians with relevant skills
          OR: [
            { primarySkill: { contains: bsgTemplate.category.name, mode: 'insensitive' } },
            { secondarySkills: { contains: bsgTemplate.category.name, mode: 'insensitive' } },
            { primarySkill: 'core_banking' },
            { primarySkill: 'banking_systems' }
          ]
        },
        orderBy: { currentWorkload: 'asc' } // Assign to least busy technician
      });

      if (availableTechnician) {
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            assignedToUserId: availableTechnician.id,
            status: 'assigned'
          }
        });

        // Update technician workload
        await prisma.user.update({
          where: { id: availableTechnician.id },
          data: {
            currentWorkload: { increment: 1 }
          }
        });
      }
    }

    // Get full ticket details for response
    const fullTicket = await prisma.ticket.findUnique({
      where: { id: ticket.id },
      include: {
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
        attachments: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'BSG ticket created successfully',
      data: fullTicket,
      routing: {
        templateCategory: bsgTemplate.category.name,
        targetDepartment: targetDepartmentId,
        requiresApproval,
        isKasdaTicket: isKasdaOrBsgDirectTicket,
        estimatedResolution: slaDueDate,
        autoAssigned: !!fullTicket?.assignedToUserId,
        routingReason: isKasdaOrBsgDirectTicket ? 
          'KASDA/BSGDirect content - routed to Dukungan dan Layanan' : 
          'Technical banking content - routed to IT or user department'
      }
    });

  } catch (error) {
    console.error('Error creating BSG ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create BSG ticket',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}));

// Simple manager approval endpoints (Stage 3 Migration)
router.post('/:ticketId/approve', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user } = req;
    const { ticketId } = req.params;
    const { comments } = req.body;

    // Get ticket with business approval info
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(ticketId) },
      include: {
        createdBy: {
          include: {
            department: true,
            unit: true
          }
        },
        businessApproval: {
          include: {
            businessReviewer: {
              include: {
                unit: true,
                department: true
              }
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

    // NEW: Check authorization using BusinessApproval table
    const canApprove = user?.role === 'admin' || 
      (user?.role === 'manager' && 
       user?.isBusinessReviewer === true &&
       ticket.businessApproval?.businessReviewerId === user?.id &&
       ticket.businessApproval?.approvalStatus === 'pending');

    if (!canApprove) {
      const reason = !ticket.businessApproval 
        ? 'No business approval found for this ticket'
        : ticket.businessApproval.businessReviewerId !== user?.id
        ? 'You are not assigned to approve this ticket'
        : ticket.businessApproval.approvalStatus !== 'pending'
        ? `Ticket approval is already ${ticket.businessApproval.approvalStatus}`
        : 'Insufficient permissions for approval';
        
      return res.status(403).json({
        success: false,
        message: `Access denied. ${reason}`
      });
    }

    // Update both ticket and business approval in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update business approval status
      await tx.businessApproval.update({
        where: { id: ticket.businessApproval!.id },
        data: {
          approvalStatus: 'approved',
          approvedAt: new Date(),
          businessComments: comments || ticket.businessApproval!.businessComments
        }
      });

      // Update ticket status to new (ready for assignment)
      const updatedTicket = await tx.ticket.update({
        where: { id: parseInt(ticketId) },
        data: {
          status: 'open', // Changed from 'pending_approval' to 'open' (ready for technician assignment)
          managerComments: comments || null,
          updatedAt: new Date()
        },
        include: {
          createdBy: {
            include: {
              department: true,
              unit: true
            }
          },
          businessApproval: {
            include: {
              businessReviewer: {
                include: {
                  unit: true,
                  department: true
                }
              }
            }
          },
          serviceCatalog: {
            include: {
              department: true
            }
          },
          serviceItem: true
        }
      });

      return updatedTicket;
    });

    console.log(`Manager ${user?.username} approved ticket #${ticketId} via unit-based approval`);
    console.log(`  Approved by: ${user?.username} (${ticket.businessApproval?.businessReviewer?.unit?.name})`);
    console.log(`  Requested by: ${ticket.createdBy?.username} (${ticket.createdBy?.unit?.name})`);

    res.json({
      success: true,
      message: 'Ticket approved successfully via unit-based approval system',
      data: result
    });

  } catch (error) {
    console.error('Error approving ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve ticket',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}));

router.post('/:ticketId/reject', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user } = req;
    const { ticketId } = req.params;
    const { comments } = req.body;

    // Comments are required for rejection
    if (!comments || !comments.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comments are required when rejecting a ticket'
      });
    }

    // Get ticket with creator and manager info
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(ticketId) },
      include: {
        createdBy: {
          include: {
            department: true,
            manager: true
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

    // Check authorization - manager can reject tickets from their department subordinates
    const canReject = user?.role === 'admin' || 
      (user?.role === 'manager' && 
       user?.id === ticket.createdBy?.managerId &&
       user?.departmentId === ticket.createdBy?.departmentId);

    if (!canReject) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only reject tickets from your department subordinates.'
      });
    }

    // Update ticket status to rejected
    const updatedTicket = await prisma.ticket.update({
      where: { id: parseInt(ticketId) },
      data: {
        status: 'rejected',
        managerComments: comments,
        updatedAt: new Date()
      },
      include: {
        createdBy: {
          include: {
            department: true,
            manager: true
          }
        },
        serviceCatalog: {
          include: {
            department: true
          }
        },
        serviceItem: true
      }
    });

    console.log(`Manager ${user?.username} rejected ticket #${ticketId}: ${comments}`);

    res.json({
      success: true,
      message: 'Ticket rejected successfully',
      data: updatedTicket
    });

  } catch (error) {
    console.error('Error rejecting ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject ticket',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}));

// Download attachment by ID (unified endpoint)
router.get('/attachments/:attachmentId/download', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { attachmentId } = req.params;
    const { user } = req;

    // Find the attachment and its associated ticket
    const attachment = await prisma.ticketAttachment.findUnique({
      where: { id: parseInt(attachmentId) },
      include: {
        ticket: {
          include: {
            serviceCatalog: {
              include: {
                department: true
              }
            },
            createdBy: {
              select: {
                id: true,
                username: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    });

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    // Check access permissions
    const canAccess = user?.role === 'admin' ||
      attachment.ticket.createdByUserId === user?.id ||
      (user?.departmentId === attachment.ticket.serviceCatalog?.departmentId) ||
      (user?.isBusinessReviewer && attachment.ticket.isKasdaTicket) ||
      attachment.ticket.assignedToUserId === user?.id;

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to download this attachment.'
      });
    }

    // Check if file exists
    const filePath = path.resolve(attachment.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    console.log(`User ${user?.username} downloading attachment: ${attachment.fileName}`);

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.fileName}"`);
    res.setHeader('Content-Type', attachment.fileType || 'application/octet-stream');
    res.setHeader('Content-Length', attachment.fileSize);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error downloading attachment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download attachment',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}));

// Update ticket status with ITIL workflow support
router.patch('/:ticketId/status', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { status, comments } = req.body;
    const { user } = req;

    console.log(`Updating ticket ${ticketId} status to ${status} by user ${user?.id} (${user?.role})`);

    // Validate status
    const validStatuses = ['assigned', 'in_progress', 'pending', 'resolved', 'closed', 'rejected', 'cancelled', 'duplicate'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Find the ticket with necessary relations
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(ticketId) },
      include: {
        createdBy: {
          include: {
            department: true,
            manager: true
          }
        },
        assignedTo: {
          include: {
            department: true
          }
        },
        serviceCatalog: {
          include: {
            department: true
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

    // Authorization checks
    const isOwner = ticket.createdByUserId === user?.id;
    const isAssigned = ticket.assignedToUserId === user?.id;
    const isAdmin = user?.role === 'admin';
    const isTechnician = user?.role === 'technician';
    const isManager = user?.role === 'manager';

    // Only technicians, admins, and assigned users can update status
    if (!isAdmin && !isTechnician && !isAssigned && !isManager) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this ticket status'
      });
    }

    // ITIL workflow validation
    const currentStatus = ticket.status;
    const isValidTransition = validateStatusTransition(currentStatus, status);
    
    if (!isValidTransition) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${currentStatus} to ${status}`
      });
    }

    // Update ticket status and record the change
    const updatedTicket = await prisma.ticket.update({
      where: { id: parseInt(ticketId) },
      data: {
        status,
        updatedAt: new Date(),
        // Update resolved timestamp
        ...(status === 'resolved' && { resolvedAt: new Date() })
      },
      include: {
        createdBy: {
          include: {
            department: true,
            manager: true
          }
        },
        assignedTo: {
          include: {
            department: true
          }
        },
        attachments: true,
        serviceCatalog: {
          include: {
            department: true
          }
        },
        serviceItem: true
      }
    });

    // Add a status change comment if comments were provided or for certain transitions
    if (comments || ['resolved', 'closed', 'pending', 'cancelled', 'duplicate'].includes(status)) {
      const statusChangeComment = comments || `Status changed to ${status.replace('_', ' ')}`;
      
      await prisma.ticketComment.create({
        data: {
          ticketId: parseInt(ticketId),
          authorId: user!.id,
          content: statusChangeComment,
          isInternal: false, // Status changes are usually public
          commentType: 'status_change'
        }
      });
    }

    // Log the status change for audit trail
    console.log(`Ticket ${ticketId} status updated from ${currentStatus} to ${status} by ${user?.username}`);

    res.json({
      success: true,
      message: `Ticket status updated to ${status.replace('_', ' ')}`,
      data: updatedTicket
    });

  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket status',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
}));

// ITIL workflow validation function
function validateStatusTransition(currentStatus: string, newStatus: string): boolean {
  const validTransitions: Record<string, string[]> = {
    'pending_approval': ['approved', 'rejected'],
    'approved': ['assigned', 'in_progress', 'cancelled'], // Can cancel after approval
    'assigned': ['in_progress', 'pending', 'cancelled', 'duplicate'], // Can cancel or mark duplicate
    'open': ['assigned', 'in_progress', 'pending', 'cancelled', 'duplicate'],
    'in_progress': ['pending', 'resolved', 'closed', 'assigned', 'cancelled', 'duplicate'], // Can skip resolved for simple tickets
    'pending': ['in_progress', 'assigned', 'cancelled'],
    'resolved': ['closed', 'in_progress'], // Allow reopening if resolution doesn't work
    'closed': ['in_progress'], // Admin can reopen
    'rejected': ['pending_approval'], // Can be resubmitted
    'cancelled': [], // Final state
    'duplicate': [] // Final state
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
}

// Get available approvers for a unit
router.get('/unit/:unitId/approvers', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const unitId = parseInt(req.params.unitId);
    
    if (!unitId) {
      return res.status(400).json({
        success: false,
        message: 'Unit ID is required'
      });
    }
    
    // Find managers in the specified unit
    const unitManagers = await prisma.user.findMany({
      where: {
        unitId: unitId,
        role: { in: ['manager', 'admin'] },
        isAvailable: true,
        isBusinessReviewer: true
      },
      include: {
        unit: true,
        department: true
      },
      orderBy: [
        { role: 'desc' },
        { username: 'asc' }
      ]
    });
    
    // Get unit information
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        department: true,
        parent: true
      }
    });
    
    res.json({
      success: true,
      data: {
        unit: unit,
        approvers: unitManagers.map(manager => ({
          id: manager.id,
          username: manager.username,
          email: manager.email,
          role: manager.role,
          department: manager.department?.name,
          unit: manager.unit?.name,
          isAvailable: manager.isAvailable
        }))
      }
    });
    
  } catch (error) {
    console.error('Error fetching unit approvers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unit approvers'
    });
  }
}));

// Get all units for dropdown selection
router.get('/units', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const units = await prisma.unit.findMany({
      where: {
        isActive: true
      },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        parent: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: [
        { unitType: 'asc' },
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });
    
    res.json({
      success: true,
      data: units
    });
    
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch units'
    });
  }
}));

export default router;