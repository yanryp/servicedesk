// src/routes/fieldTypeRoutes.ts
import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';
import { protect, AuthenticatedRequest } from '../middleware/authMiddleware';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();
const prisma = new PrismaClient();

// Rate limiting for field type endpoints
const fieldTypeRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many field type requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(fieldTypeRateLimit);

/**
 * @route   GET /api/field-types
 * @desc    Get all field type definitions
 * @access  Protected
 */
router.get('/', protect, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { category, active = 'true' } = req.query;

  try {
    const whereConditions: any = {};

    if (active === 'true') {
      whereConditions.isActive = true;
    }

    if (category) {
      whereConditions.category = category;
    }

    const fieldTypes = await prisma.fieldTypeDefinition.findMany({
      where: whereConditions,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    // Group by category for better frontend consumption
    const groupedByCategory = fieldTypes.reduce((acc, fieldType) => {
      const category = fieldType.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(fieldType);
      return acc;
    }, {} as Record<string, typeof fieldTypes>);

    res.json({
      success: true,
      data: {
        all: fieldTypes,
        byCategory: groupedByCategory
      },
      meta: {
        count: fieldTypes.length,
        categories: Object.keys(groupedByCategory)
      }
    });
  } catch (error) {
    console.error('Field types fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch field types',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}));

/**
 * @route   GET /api/field-types/:name
 * @desc    Get specific field type definition by name
 * @access  Protected
 */
router.get('/:name', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name } = req.params;

  try {
    const fieldType = await prisma.fieldTypeDefinition.findUnique({
      where: { name }
    });

    if (!fieldType) {
      res.status(404).json({
        success: false,
        message: `Field type '${name}' not found`
      });
      return;
    }

    res.json({
      success: true,
      data: fieldType
    });
  } catch (error) {
    console.error('Field type fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch field type',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}));

/**
 * @route   POST /api/field-types
 * @desc    Create new field type definition
 * @access  Protected (Admin only)
 */
router.post('/', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const {
    name,
    displayName,
    displayNameId,
    category,
    description,
    validationRules,
    formattingRules,
    uiConfig
  } = req.body;

  // Check authorization
  if (req.user?.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
    return;
  }

  try {
    const fieldType = await prisma.fieldTypeDefinition.create({
      data: {
        name,
        displayName,
        displayNameId,
        category,
        description,
        validationRules,
        formattingRules,
        uiConfig
      }
    });

    res.status(201).json({
      success: true,
      data: fieldType,
      message: 'Field type created successfully'
    });
  } catch (error: any) {
    console.error('Field type creation error:', error);
    
    if (error.code === 'P2002') {
      res.status(400).json({
        success: false,
        message: `Field type '${name}' already exists`
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create field type',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}));

/**
 * @route   PUT /api/field-types/:name
 * @desc    Update field type definition
 * @access  Protected (Admin only)
 */
router.put('/:name', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name } = req.params;
  const updateData = req.body;

  // Check authorization
  if (req.user?.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
    return;
  }

  try {
    const updatedFieldType = await prisma.fieldTypeDefinition.update({
      where: { name },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: updatedFieldType,
      message: 'Field type updated successfully'
    });
  } catch (error: any) {
    console.error('Field type update error:', error);

    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: `Field type '${name}' not found`
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update field type',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}));

/**
 * @route   DELETE /api/field-types/:name
 * @desc    Deactivate field type definition
 * @access  Protected (Admin only)
 */
router.delete('/:name', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name } = req.params;

  // Check authorization
  if (req.user?.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
    return;
  }

  try {
    const deactivatedFieldType = await prisma.fieldTypeDefinition.update({
      where: { name },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: deactivatedFieldType,
      message: 'Field type deactivated successfully'
    });
  } catch (error: any) {
    console.error('Field type deletion error:', error);

    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: `Field type '${name}' not found`
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to deactivate field type',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}));

export default router;