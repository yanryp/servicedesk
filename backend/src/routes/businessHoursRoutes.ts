import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, authorize, AuthenticatedRequest } from '../middleware/authMiddleware';
import asyncHandler from '../utils/asyncHandler';

const router = Router();
const prisma = new PrismaClient();

// Validation helpers
const validateTimeFormat = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

const validateDayOfWeek = (day: number): boolean => {
  return Number.isInteger(day) && day >= 0 && day <= 6;
};

// @route   GET /api/business-hours
// @desc    Get business hours configurations
// @access  Private (Admin/Manager)
router.get('/',
  protect,
  authorize('admin', 'manager'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { departmentId, unitId } = req.query;

    const whereClause: any = {
      isActive: true
    };

    if (departmentId) {
      whereClause.departmentId = parseInt(departmentId as string);
    }
    
    if (unitId) {
      whereClause.unitId = parseInt(unitId as string);
    }

    const businessHours = await prisma.businessHoursConfig.findMany({
      where: whereClause,
      include: {
        department: {
          select: { id: true, name: true }
        },
        unit: {
          select: { id: true, name: true, code: true }
        }
      },
      orderBy: [
        { departmentId: 'asc' },
        { unitId: 'asc' },
        { dayOfWeek: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: businessHours
    });
  })
);

// @route   GET /api/business-hours/:id
// @desc    Get single business hours configuration
// @access  Private (Admin/Manager)
router.get('/:id',
  protect,
  authorize('admin', 'manager'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const businessHour = await prisma.businessHoursConfig.findUnique({
      where: { id: parseInt(id) },
      include: {
        department: {
          select: { id: true, name: true }
        },
        unit: {
          select: { id: true, name: true, code: true }
        }
      }
    });

    if (!businessHour) {
      return res.status(404).json({
        success: false,
        message: 'Business hours configuration not found'
      });
    }

    res.json({
      success: true,
      data: businessHour
    });
  })
);

// @route   POST /api/business-hours
// @desc    Create business hours configuration
// @access  Private (Admin only)
router.post('/',
  protect,
  authorize('admin'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      departmentId,
      unitId,
      dayOfWeek,
      startTime,
      endTime,
      timezone = 'Asia/Jakarta',
      isActive = true
    } = req.body;

    // Validation
    if (!validateDayOfWeek(dayOfWeek)) {
      return res.status(400).json({
        success: false,
        message: 'Day of week must be between 0 (Sunday) and 6 (Saturday)'
      });
    }

    if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'Time format must be HH:mm (24-hour format)'
      });
    }

    // Validate start time is before end time
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes >= endMinutes) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be before end time'
      });
    }

    // Validate that either departmentId or unitId is provided (not both or neither)
    if ((!departmentId && !unitId) || (departmentId && unitId)) {
      return res.status(400).json({
        success: false,
        message: 'Either departmentId or unitId must be provided, but not both'
      });
    }

    // Check for existing configuration for the same day
    const existingConfig = await prisma.businessHoursConfig.findFirst({
      where: {
        departmentId: departmentId || null,
        unitId: unitId || null,
        dayOfWeek,
        isActive: true
      }
    });

    if (existingConfig) {
      return res.status(409).json({
        success: false,
        message: 'Business hours configuration already exists for this day'
      });
    }

    // Verify department or unit exists
    if (departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId }
      });
      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }
    }

    if (unitId) {
      const unit = await prisma.unit.findUnique({
        where: { id: unitId }
      });
      if (!unit) {
        return res.status(404).json({
          success: false,
          message: 'Unit not found'
        });
      }
    }

    const businessHour = await prisma.businessHoursConfig.create({
      data: {
        departmentId,
        unitId,
        dayOfWeek,
        startTime,
        endTime,
        timezone,
        isActive
      },
      include: {
        department: {
          select: { id: true, name: true }
        },
        unit: {
          select: { id: true, name: true, code: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Business hours configuration created successfully',
      data: businessHour
    });
  })
);

// @route   PUT /api/business-hours/:id
// @desc    Update business hours configuration
// @access  Private (Admin only)
router.put('/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const {
      dayOfWeek,
      startTime,
      endTime,
      timezone,
      isActive
    } = req.body;

    // Check if configuration exists
    const existingConfig = await prisma.businessHoursConfig.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingConfig) {
      return res.status(404).json({
        success: false,
        message: 'Business hours configuration not found'
      });
    }

    // Validation (only validate provided fields)
    if (dayOfWeek !== undefined && !validateDayOfWeek(dayOfWeek)) {
      return res.status(400).json({
        success: false,
        message: 'Day of week must be between 0 (Sunday) and 6 (Saturday)'
      });
    }

    if (startTime && !validateTimeFormat(startTime)) {
      return res.status(400).json({
        success: false,
        message: 'Start time format must be HH:mm (24-hour format)'
      });
    }

    if (endTime && !validateTimeFormat(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'End time format must be HH:mm (24-hour format)'
      });
    }

    // Validate time order
    const finalStartTime = startTime || existingConfig.startTime;
    const finalEndTime = endTime || existingConfig.endTime;
    
    const [startHour, startMin] = finalStartTime.split(':').map(Number);
    const [endHour, endMin] = finalEndTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes >= endMinutes) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be before end time'
      });
    }

    // Check for conflicts if dayOfWeek is being changed
    if (dayOfWeek !== undefined && dayOfWeek !== existingConfig.dayOfWeek) {
      const conflictingConfig = await prisma.businessHoursConfig.findFirst({
        where: {
          departmentId: existingConfig.departmentId,
          unitId: existingConfig.unitId,
          dayOfWeek,
          isActive: true,
          id: { not: parseInt(id) }
        }
      });

      if (conflictingConfig) {
        return res.status(409).json({
          success: false,
          message: 'Business hours configuration already exists for this day'
        });
      }
    }

    const updatedConfig = await prisma.businessHoursConfig.update({
      where: { id: parseInt(id) },
      data: {
        dayOfWeek,
        startTime,
        endTime,
        timezone,
        isActive
      },
      include: {
        department: {
          select: { id: true, name: true }
        },
        unit: {
          select: { id: true, name: true, code: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Business hours configuration updated successfully',
      data: updatedConfig
    });
  })
);

// @route   DELETE /api/business-hours/:id
// @desc    Delete business hours configuration
// @access  Private (Admin only)
router.delete('/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const existingConfig = await prisma.businessHoursConfig.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingConfig) {
      return res.status(404).json({
        success: false,
        message: 'Business hours configuration not found'
      });
    }

    await prisma.businessHoursConfig.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Business hours configuration deleted successfully'
    });
  })
);

// @route   POST /api/business-hours/bulk
// @desc    Create business hours for all days of week
// @access  Private (Admin only)
router.post('/bulk',
  protect,
  authorize('admin'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      departmentId,
      unitId,
      weekdayStart = '09:00',
      weekdayEnd = '17:00',
      saturdayStart = '09:00',
      saturdayEnd = '12:00',
      sundayStart = null,
      sundayEnd = null,
      timezone = 'Asia/Jakarta'
    } = req.body;

    // Validate that either departmentId or unitId is provided
    if ((!departmentId && !unitId) || (departmentId && unitId)) {
      return res.status(400).json({
        success: false,
        message: 'Either departmentId or unitId must be provided, but not both'
      });
    }

    const businessHoursData = [];

    // Monday to Friday (1-5)
    for (let day = 1; day <= 5; day++) {
      businessHoursData.push({
        departmentId,
        unitId,
        dayOfWeek: day,
        startTime: weekdayStart,
        endTime: weekdayEnd,
        timezone,
        isActive: true
      });
    }

    // Saturday (6)
    if (saturdayStart && saturdayEnd) {
      businessHoursData.push({
        departmentId,
        unitId,
        dayOfWeek: 6,
        startTime: saturdayStart,
        endTime: saturdayEnd,
        timezone,
        isActive: true
      });
    }

    // Sunday (0)
    if (sundayStart && sundayEnd) {
      businessHoursData.push({
        departmentId,
        unitId,
        dayOfWeek: 0,
        startTime: sundayStart,
        endTime: sundayEnd,
        timezone,
        isActive: true
      });
    }

    const createdConfigs = await prisma.businessHoursConfig.createMany({
      data: businessHoursData,
      skipDuplicates: true
    });

    res.status(201).json({
      success: true,
      message: `Created ${createdConfigs.count} business hours configurations`,
      data: { created: createdConfigs.count }
    });
  })
);

// @route   GET /api/business-hours/check/:datetime
// @desc    Check if given datetime is within business hours
// @access  Private
router.get('/check/:datetime',
  protect,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { datetime } = req.params;
    const { departmentId, unitId } = req.query;

    try {
      const checkDate = new Date(datetime);
      const dayOfWeek = checkDate.getDay();
      const timeString = checkDate.toTimeString().substr(0, 5); // HH:mm format

      const businessHours = await prisma.businessHoursConfig.findFirst({
        where: {
          departmentId: departmentId ? parseInt(departmentId as string) : null,
          unitId: unitId ? parseInt(unitId as string) : null,
          dayOfWeek,
          isActive: true
        }
      });

      if (!businessHours) {
        return res.json({
          success: true,
          data: {
            isBusinessHours: false,
            reason: 'No business hours configured for this day',
            dayOfWeek,
            timeChecked: timeString
          }
        });
      }

      const isWithinHours = timeString >= businessHours.startTime && timeString <= businessHours.endTime;

      res.json({
        success: true,
        data: {
          isBusinessHours: isWithinHours,
          businessHours: {
            startTime: businessHours.startTime,
            endTime: businessHours.endTime,
            dayOfWeek: businessHours.dayOfWeek
          },
          timeChecked: timeString
        }
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Invalid datetime format'
      });
    }
  })
);

export default router;