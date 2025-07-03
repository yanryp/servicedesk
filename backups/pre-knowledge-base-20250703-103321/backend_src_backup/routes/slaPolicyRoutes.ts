import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, authorize, AuthenticatedRequest } from '../middleware/authMiddleware';
import asyncHandler from '../utils/asyncHandler';
import { slaCalculator, calculateSLADueDate, isCurrentlyInBusinessHours } from '../utils/slaCalculator';

const router = Router();
const prisma = new PrismaClient();

// @route   GET /api/sla-policies
// @desc    Get all SLA policies
// @access  Private (Admin/Manager)
router.get('/',
  protect,
  authorize('admin', 'manager'),
  asyncHandler(async (req, res) => {
    const policies = await prisma.slaPolicy.findMany({
      include: {
        serviceCatalog: {
          select: { name: true }
        },
        serviceItem: {
          select: { name: true }
        },
        department: {
          select: { name: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json(policies);
  })
);

// @route   GET /api/sla-policies/:id
// @desc    Get single SLA policy
// @access  Private (Admin/Manager)
router.get('/:id',
  protect,
  authorize('admin', 'manager'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const policy = await prisma.slaPolicy.findUnique({
      where: { id: parseInt(id) },
      include: {
        serviceCatalog: {
          select: { name: true }
        },
        serviceItem: {
          select: { name: true }
        },
        department: {
          select: { name: true }
        }
      }
    });

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'SLA policy not found'
      });
    }

    res.status(200).json(policy);
  })
);

// @route   POST /api/sla-policies
// @desc    Create new SLA policy
// @access  Private (Admin only)
router.post('/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const {
      name,
      description,
      serviceCatalogId,
      serviceItemId,
      departmentId,
      priority,
      responseTimeMinutes,
      resolutionTimeMinutes,
      businessHoursOnly = true,
      escalationMatrix,
      notificationRules,
      isActive = true
    } = req.body;

    // Validate required fields
    if (!name || !responseTimeMinutes || !resolutionTimeMinutes) {
      return res.status(400).json({
        success: false,
        message: 'Name, response time, and resolution time are required'
      });
    }

    // Validate time values
    if (responseTimeMinutes <= 0 || resolutionTimeMinutes <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Response and resolution times must be positive numbers'
      });
    }

    if (responseTimeMinutes >= resolutionTimeMinutes) {
      return res.status(400).json({
        success: false,
        message: 'Resolution time must be greater than response time'
      });
    }

    // Check for conflicts with existing policies
    const existingPolicy = await prisma.slaPolicy.findFirst({
      where: {
        name,
        isActive: true
      }
    });

    if (existingPolicy) {
      return res.status(409).json({
        success: false,
        message: 'An active SLA policy with this name already exists'
      });
    }

    const policy = await prisma.slaPolicy.create({
      data: {
        name,
        description,
        serviceCatalogId,
        serviceItemId,
        departmentId,
        priority,
        responseTimeMinutes,
        resolutionTimeMinutes,
        businessHoursOnly,
        escalationMatrix,
        notificationRules,
        isActive
      },
      include: {
        serviceCatalog: {
          select: { name: true }
        },
        serviceItem: {
          select: { name: true }
        },
        department: {
          select: { name: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'SLA policy created successfully',
      data: policy
    });
  })
);

// @route   PUT /api/sla-policies/:id
// @desc    Update SLA policy
// @access  Private (Admin only)
router.put('/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      name,
      description,
      serviceCatalogId,
      serviceItemId,
      departmentId,
      priority,
      responseTimeMinutes,
      resolutionTimeMinutes,
      businessHoursOnly,
      escalationMatrix,
      notificationRules,
      isActive
    } = req.body;

    // Check if policy exists
    const existingPolicy = await prisma.slaPolicy.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingPolicy) {
      return res.status(404).json({
        success: false,
        message: 'SLA policy not found'
      });
    }

    // Validate time values if provided
    if (responseTimeMinutes !== undefined && responseTimeMinutes <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Response time must be a positive number'
      });
    }

    if (resolutionTimeMinutes !== undefined && resolutionTimeMinutes <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Resolution time must be a positive number'
      });
    }

    const finalResponseTime = responseTimeMinutes ?? existingPolicy.responseTimeMinutes;
    const finalResolutionTime = resolutionTimeMinutes ?? existingPolicy.resolutionTimeMinutes;

    if (finalResponseTime >= finalResolutionTime) {
      return res.status(400).json({
        success: false,
        message: 'Resolution time must be greater than response time'
      });
    }

    // Check for naming conflicts (excluding current policy)
    if (name && name !== existingPolicy.name) {
      const nameConflict = await prisma.slaPolicy.findFirst({
        where: {
          name,
          isActive: true,
          id: { not: parseInt(id) }
        }
      });

      if (nameConflict) {
        return res.status(409).json({
          success: false,
          message: 'An active SLA policy with this name already exists'
        });
      }
    }

    const policy = await prisma.slaPolicy.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        serviceCatalogId,
        serviceItemId,
        departmentId,
        priority,
        responseTimeMinutes,
        resolutionTimeMinutes,
        businessHoursOnly,
        escalationMatrix,
        notificationRules,
        isActive
      },
      include: {
        serviceCatalog: {
          select: { name: true }
        },
        serviceItem: {
          select: { name: true }
        },
        department: {
          select: { name: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'SLA policy updated successfully',
      data: policy
    });
  })
);

// @route   DELETE /api/sla-policies/:id
// @desc    Delete SLA policy
// @access  Private (Admin only)
router.delete('/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if policy exists
    const existingPolicy = await prisma.slaPolicy.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingPolicy) {
      return res.status(404).json({
        success: false,
        message: 'SLA policy not found'
      });
    }

    // Check if policy is in use by any active tickets
    const ticketsUsingPolicy = await prisma.ticket.count({
      where: {
        // We'll need to implement SLA policy assignment logic in tickets
        // For now, we'll allow deletion
        status: { notIn: ['closed', 'cancelled'] }
      }
    });

    // Soft delete by deactivating instead of hard delete if in use
    if (ticketsUsingPolicy > 0) {
      await prisma.slaPolicy.update({
        where: { id: parseInt(id) },
        data: { isActive: false }
      });

      return res.status(200).json({
        success: true,
        message: 'SLA policy deactivated (in use by active tickets)'
      });
    }

    // Hard delete if not in use
    await prisma.slaPolicy.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'SLA policy deleted successfully'
    });
  })
);

// @route   GET /api/sla-policies/applicable/:ticketId
// @desc    Get applicable SLA policy for a ticket
// @access  Private
router.get('/applicable/:ticketId',
  protect,
  asyncHandler(async (req, res) => {
    const { ticketId } = req.params;

    // Get ticket details
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(ticketId) },
      include: {
        createdBy: {
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

    // Find most specific applicable SLA policy
    // Priority order: Service Item > Service Catalog > Department > Priority > Global
    const policies = await prisma.slaPolicy.findMany({
      where: {
        isActive: true,
        OR: [
          // Exact service item match
          {
            serviceItemId: ticket.serviceItemId,
            priority: ticket.priority
          },
          {
            serviceItemId: ticket.serviceItemId,
            priority: null
          },
          // Department match
          {
            departmentId: ticket.createdBy.departmentId,
            serviceCatalogId: null,
            priority: ticket.priority
          },
          {
            departmentId: ticket.createdBy.departmentId,
            serviceCatalogId: null,
            priority: null
          },
          // Priority-only match
          {
            departmentId: null,
            serviceCatalogId: null,
            serviceItemId: null,
            priority: ticket.priority
          },
          // Global policy
          {
            departmentId: null,
            serviceCatalogId: null,
            serviceItemId: null,
            priority: null
          }
        ]
      },
      orderBy: [
        { serviceItemId: { sort: 'desc', nulls: 'last' } },
        { serviceCatalogId: { sort: 'desc', nulls: 'last' } },
        { departmentId: { sort: 'desc', nulls: 'last' } },
        { priority: { sort: 'desc', nulls: 'last' } },
        { createdAt: 'desc' }
      ],
      take: 1,
      include: {
        serviceCatalog: {
          select: { name: true }
        },
        serviceItem: {
          select: { name: true }
        },
        department: {
          select: { name: true }
        }
      }
    });

    const applicablePolicy = policies[0] || null;

    res.status(200).json({
      success: true,
      data: {
        ticket: {
          id: ticket.id,
          title: ticket.title,
          priority: ticket.priority,
          serviceItemId: ticket.serviceItemId,
          department: ticket.createdBy.department?.name
        },
        slaPolicy: applicablePolicy
      }
    });
  })
);

// @route   POST /api/sla-policies/calculate
// @desc    Calculate SLA due date for given parameters
// @access  Private
router.post('/calculate',
  protect,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const {
      startDate,
      slaMinutes,
      departmentId,
      unitId,
      businessHoursOnly = true
    } = req.body;

    if (!startDate || !slaMinutes) {
      return res.status(400).json({
        success: false,
        message: 'Start date and SLA minutes are required'
      });
    }

    try {
      const startDateTime = new Date(startDate);
      const slaResult = await calculateSLADueDate(startDateTime, slaMinutes, {
        departmentId,
        unitId,
        businessHoursOnly
      });

      res.json({
        success: true,
        data: {
          startDate: startDateTime,
          slaMinutes,
          calculation: slaResult,
          options: {
            departmentId,
            unitId,
            businessHoursOnly
          }
        }
      });

    } catch (error) {
      console.error('SLA calculation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate SLA due date',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  })
);

// @route   GET /api/sla-policies/business-hours-status
// @desc    Check if current time is within business hours
// @access  Private
router.get('/business-hours-status',
  protect,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { departmentId, unitId, checkDate } = req.query;

    try {
      const dateToCheck = checkDate ? new Date(checkDate as string) : new Date();
      
      const isBusinessHours = await isCurrentlyInBusinessHours(dateToCheck, {
        departmentId: departmentId ? parseInt(departmentId as string) : undefined,
        unitId: unitId ? parseInt(unitId as string) : undefined
      });

      const nextBusinessStart = await slaCalculator.getNextBusinessHourStart(dateToCheck, {
        departmentId: departmentId ? parseInt(departmentId as string) : undefined,
        unitId: unitId ? parseInt(unitId as string) : undefined
      });

      res.json({
        success: true,
        data: {
          checkDate: dateToCheck,
          isBusinessHours,
          nextBusinessHourStart: nextBusinessStart,
          options: {
            departmentId: departmentId ? parseInt(departmentId as string) : undefined,
            unitId: unitId ? parseInt(unitId as string) : undefined
          }
        }
      });

    } catch (error) {
      console.error('Business hours status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check business hours status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  })
);

// @route   POST /api/sla-policies/calculate-remaining
// @desc    Calculate remaining SLA time for a ticket
// @access  Private
router.post('/calculate-remaining',
  protect,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { ticketId, currentDate } = req.body;

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: 'Ticket ID is required'
      });
    }

    try {
      // Get ticket with SLA policy
      const ticket = await prisma.ticket.findUnique({
        where: { id: parseInt(ticketId) },
        include: {
          createdBy: {
            include: {
              department: true,
              unit: true
            }
          },
          serviceItem: {
            include: {
              serviceCatalog: true
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

      // Find applicable SLA policy
      const slaPolicy = await prisma.slaPolicy.findFirst({
        where: {
          isActive: true,
          OR: [
            {
              serviceItemId: ticket.serviceItemId,
              priority: ticket.priority
            },
            {
              serviceItemId: ticket.serviceItemId,
              priority: null
            },
            {
              departmentId: ticket.createdBy.departmentId,
              serviceCatalogId: ticket.serviceCatalogId,
              priority: ticket.priority
            },
            {
              departmentId: ticket.createdBy.departmentId,
              serviceCatalogId: null,
              priority: null
            },
            {
              departmentId: null,
              serviceCatalogId: null,
              serviceItemId: null,
              priority: ticket.priority
            },
            {
              departmentId: null,
              serviceCatalogId: null,
              serviceItemId: null,
              priority: null
            }
          ]
        },
        orderBy: [
          { serviceItemId: { sort: 'desc', nulls: 'last' } },
          { serviceCatalogId: { sort: 'desc', nulls: 'last' } },
          { departmentId: { sort: 'desc', nulls: 'last' } },
          { priority: { sort: 'desc', nulls: 'last' } }
        ]
      });

      if (!slaPolicy) {
        return res.status(404).json({
          success: false,
          message: 'No applicable SLA policy found for this ticket'
        });
      }

      const checkDateTime = currentDate ? new Date(currentDate) : new Date();
      
      // Calculate SLA due date from ticket creation
      const slaResult = await calculateSLADueDate(ticket.createdAt, slaPolicy.resolutionTimeMinutes, {
        departmentId: ticket.createdBy.departmentId || undefined,
        unitId: ticket.createdBy.unitId || undefined,
        businessHoursOnly: slaPolicy.businessHoursOnly
      });

      // Calculate remaining time
      const remainingMinutes = Math.max(0, (slaResult.dueDate.getTime() - checkDateTime.getTime()) / (60 * 1000));

      res.json({
        success: true,
        data: {
          ticket: {
            id: ticket.id,
            title: ticket.title,
            priority: ticket.priority,
            createdAt: ticket.createdAt,
            status: ticket.status
          },
          slaPolicy: {
            id: slaPolicy.id,
            name: slaPolicy.name,
            resolutionTimeMinutes: slaPolicy.resolutionTimeMinutes,
            businessHoursOnly: slaPolicy.businessHoursOnly
          },
          slaCalculation: slaResult,
          remainingTime: {
            minutes: remainingMinutes,
            hours: Math.floor(remainingMinutes / 60),
            isOverdue: remainingMinutes <= 0
          },
          checkDate: checkDateTime
        }
      });

    } catch (error) {
      console.error('SLA remaining calculation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate remaining SLA time',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  })
);

export default router;