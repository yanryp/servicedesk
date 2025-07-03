import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, authorize, AuthenticatedRequest } from '../middleware/authMiddleware';
import asyncHandler from '../utils/asyncHandler';

const router = Router();
const prisma = new PrismaClient();

// Validation helpers
const validateDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

const validateRRule = (rrule: string): boolean => {
  // Basic validation for RRULE format
  // Full RRULE validation would require a proper parser
  return rrule.startsWith('FREQ=') && rrule.length > 5;
};

// @route   GET /api/holidays
// @desc    Get holiday calendar entries
// @access  Private (Admin/Manager)
router.get('/',
  protect,
  authorize('admin', 'manager'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { 
      departmentId, 
      unitId, 
      year, 
      month,
      startDate,
      endDate,
      includeRecurring = 'true'
    } = req.query;

    let whereClause: any = {
      isActive: true
    };

    if (departmentId) {
      whereClause.departmentId = parseInt(departmentId as string);
    }
    
    if (unitId) {
      whereClause.unitId = parseInt(unitId as string);
    }

    // Date filtering
    if (year && month) {
      const yearNum = parseInt(year as string);
      const monthNum = parseInt(month as string);
      const startOfMonth = new Date(yearNum, monthNum - 1, 1);
      const endOfMonth = new Date(yearNum, monthNum, 0);
      
      whereClause.date = {
        gte: startOfMonth,
        lte: endOfMonth
      };
    } else if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    } else if (year) {
      const yearNum = parseInt(year as string);
      whereClause.date = {
        gte: new Date(yearNum, 0, 1),
        lte: new Date(yearNum, 11, 31)
      };
    }

    // Exclude recurring holidays if requested
    if (includeRecurring === 'false') {
      whereClause.isRecurring = false;
    }

    const holidays = await prisma.holidayCalendar.findMany({
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
        { date: 'asc' },
        { name: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: holidays,
      pagination: {
        total: holidays.length,
        filters: {
          departmentId: departmentId || null,
          unitId: unitId || null,
          year: year || null,
          month: month || null,
          includeRecurring: includeRecurring === 'true'
        }
      }
    });
  })
);

// @route   GET /api/holidays/:id
// @desc    Get single holiday
// @access  Private (Admin/Manager)
router.get('/:id',
  protect,
  authorize('admin', 'manager'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const holiday = await prisma.holidayCalendar.findUnique({
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

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }

    res.json({
      success: true,
      data: holiday
    });
  })
);

// @route   POST /api/holidays
// @desc    Create holiday
// @access  Private (Admin only)
router.post('/',
  protect,
  authorize('admin'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      name,
      date,
      description,
      isRecurring = false,
      recurrenceRule,
      departmentId,
      unitId,
      isActive = true
    } = req.body;

    // Validation
    if (!name || !date) {
      return res.status(400).json({
        success: false,
        message: 'Name and date are required'
      });
    }

    if (!validateDate(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    if (isRecurring && recurrenceRule && !validateRRule(recurrenceRule)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recurrence rule format'
      });
    }

    if (isRecurring && !recurrenceRule) {
      return res.status(400).json({
        success: false,
        message: 'Recurrence rule is required for recurring holidays'
      });
    }

    // Validate that either departmentId, unitId, or both can be null (for global holidays)
    // Verify department or unit exists if provided
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

    // Check for duplicate holidays on the same date for same scope
    const existingHoliday = await prisma.holidayCalendar.findFirst({
      where: {
        date: new Date(date),
        departmentId: departmentId || null,
        unitId: unitId || null,
        isActive: true
      }
    });

    if (existingHoliday) {
      return res.status(409).json({
        success: false,
        message: 'A holiday already exists on this date for the specified scope'
      });
    }

    const holiday = await prisma.holidayCalendar.create({
      data: {
        name,
        date: new Date(date),
        description,
        isRecurring,
        recurrenceRule,
        departmentId,
        unitId,
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
      message: 'Holiday created successfully',
      data: holiday
    });
  })
);

// @route   PUT /api/holidays/:id
// @desc    Update holiday
// @access  Private (Admin only)
router.put('/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const {
      name,
      date,
      description,
      isRecurring,
      recurrenceRule,
      isActive
    } = req.body;

    // Check if holiday exists
    const existingHoliday = await prisma.holidayCalendar.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingHoliday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }

    // Validation
    if (date && !validateDate(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    const finalIsRecurring = isRecurring !== undefined ? isRecurring : existingHoliday.isRecurring;
    const finalRecurrenceRule = recurrenceRule !== undefined ? recurrenceRule : existingHoliday.recurrenceRule;

    if (finalIsRecurring && finalRecurrenceRule && !validateRRule(finalRecurrenceRule)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recurrence rule format'
      });
    }

    if (finalIsRecurring && !finalRecurrenceRule) {
      return res.status(400).json({
        success: false,
        message: 'Recurrence rule is required for recurring holidays'
      });
    }

    // Check for date conflicts if date is being changed
    if (date && new Date(date).getTime() !== existingHoliday.date.getTime()) {
      const conflictingHoliday = await prisma.holidayCalendar.findFirst({
        where: {
          date: new Date(date),
          departmentId: existingHoliday.departmentId,
          unitId: existingHoliday.unitId,
          isActive: true,
          id: { not: parseInt(id) }
        }
      });

      if (conflictingHoliday) {
        return res.status(409).json({
          success: false,
          message: 'A holiday already exists on this date for the specified scope'
        });
      }
    }

    const updatedHoliday = await prisma.holidayCalendar.update({
      where: { id: parseInt(id) },
      data: {
        name,
        date: date ? new Date(date) : undefined,
        description,
        isRecurring,
        recurrenceRule,
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
      message: 'Holiday updated successfully',
      data: updatedHoliday
    });
  })
);

// @route   DELETE /api/holidays/:id
// @desc    Delete holiday
// @access  Private (Admin only)
router.delete('/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const existingHoliday = await prisma.holidayCalendar.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingHoliday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }

    await prisma.holidayCalendar.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Holiday deleted successfully'
    });
  })
);

// @route   POST /api/holidays/bulk
// @desc    Create multiple holidays (useful for importing national holidays)
// @access  Private (Admin only)
router.post('/bulk',
  protect,
  authorize('admin'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { holidays, departmentId, unitId } = req.body;

    if (!Array.isArray(holidays) || holidays.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Holidays array is required'
      });
    }

    // Validate each holiday entry
    for (const holiday of holidays) {
      if (!holiday.name || !holiday.date) {
        return res.status(400).json({
          success: false,
          message: 'Each holiday must have name and date'
        });
      }

      if (!validateDate(holiday.date)) {
        return res.status(400).json({
          success: false,
          message: `Invalid date format for holiday: ${holiday.name}`
        });
      }
    }

    const holidayData = holidays.map(holiday => ({
      name: holiday.name,
      date: new Date(holiday.date),
      description: holiday.description || null,
      isRecurring: holiday.isRecurring || false,
      recurrenceRule: holiday.recurrenceRule || null,
      departmentId: departmentId || null,
      unitId: unitId || null,
      isActive: holiday.isActive !== undefined ? holiday.isActive : true
    }));

    const createdHolidays = await prisma.holidayCalendar.createMany({
      data: holidayData,
      skipDuplicates: true
    });

    res.status(201).json({
      success: true,
      message: `Created ${createdHolidays.count} holidays`,
      data: { created: createdHolidays.count }
    });
  })
);

// @route   GET /api/holidays/check/:date
// @desc    Check if given date is a holiday
// @access  Private
router.get('/check/:date',
  protect,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { date } = req.params;
    const { departmentId, unitId } = req.query;

    try {
      const checkDate = new Date(date);

      // Check for holidays in order of specificity:
      // 1. Unit-specific holidays
      // 2. Department-specific holidays  
      // 3. Global holidays
      const holidays = await prisma.holidayCalendar.findMany({
        where: {
          date: checkDate,
          isActive: true,
          OR: [
            // Unit-specific
            {
              unitId: unitId ? parseInt(unitId as string) : null,
              departmentId: null
            },
            // Department-specific
            {
              departmentId: departmentId ? parseInt(departmentId as string) : null,
              unitId: null
            },
            // Global holidays
            {
              departmentId: null,
              unitId: null
            }
          ]
        },
        include: {
          department: {
            select: { id: true, name: true }
          },
          unit: {
            select: { id: true, name: true, code: true }
          }
        },
        orderBy: [
          { unitId: { sort: 'desc', nulls: 'last' } },
          { departmentId: { sort: 'desc', nulls: 'last' } }
        ]
      });

      const isHoliday = holidays.length > 0;

      res.json({
        success: true,
        data: {
          isHoliday,
          holidays: holidays,
          dateChecked: checkDate.toISOString().split('T')[0]
        }
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }
  })
);

// @route   GET /api/holidays/templates/indonesia
// @desc    Get Indonesian national holidays template for a given year
// @access  Private (Admin only)
router.get('/templates/indonesia/:year',
  protect,
  authorize('admin'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { year } = req.params;
    const yearNum = parseInt(year);

    if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2030) {
      return res.status(400).json({
        success: false,
        message: 'Year must be between 2020 and 2030'
      });
    }

    // Indonesian national holidays template
    // Note: Some dates vary each year (religious holidays), this is a basic template
    const indonesianHolidays = [
      {
        name: 'Tahun Baru',
        date: `${yearNum}-01-01`,
        description: 'New Year\'s Day',
        isRecurring: true,
        recurrenceRule: 'FREQ=YEARLY'
      },
      {
        name: 'Hari Kemerdekaan',
        date: `${yearNum}-08-17`,
        description: 'Independence Day',
        isRecurring: true,
        recurrenceRule: 'FREQ=YEARLY'
      },
      {
        name: 'Hari Buruh',
        date: `${yearNum}-05-01`,
        description: 'Labour Day',
        isRecurring: true,
        recurrenceRule: 'FREQ=YEARLY'
      },
      {
        name: 'Hari Pancasila',
        date: `${yearNum}-06-01`,
        description: 'Pancasila Day',
        isRecurring: true,
        recurrenceRule: 'FREQ=YEARLY'
      },
      {
        name: 'Hari Natal',
        date: `${yearNum}-12-25`,
        description: 'Christmas Day',
        isRecurring: true,
        recurrenceRule: 'FREQ=YEARLY'
      }
      // Note: Religious holidays (Idul Fitri, Idul Adha, etc.) have variable dates
      // and would need to be calculated or imported from an external source
    ];

    res.json({
      success: true,
      data: {
        year: yearNum,
        holidays: indonesianHolidays,
        note: 'This template includes fixed-date national holidays. Religious holidays with variable dates need to be added separately.'
      }
    });
  })
);

export default router;