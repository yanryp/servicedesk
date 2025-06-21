// src/routes/masterDataRoutes.ts
import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';
import { protect, AuthenticatedRequest } from '../middleware/authMiddleware';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();
const prisma = new PrismaClient();

// Rate limiting for master data endpoints
const masterDataRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 200, // Allow more requests for dropdown population
  message: {
    success: false,
    message: 'Too many master data requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
router.use(masterDataRateLimit);

/**
 * @route   GET /api/master-data/:type
 * @desc    Get master data entities by type
 * @access  Protected
 */
router.get('/:type', protect, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { type } = req.params;
  const { parent, search, department, active = 'true' } = req.query;

  // Build filter conditions
  const whereConditions: any = {
    type: type,
    ...(active === 'true' && { isActive: true })
  };

  // Add parent filter if specified
  if (parent) {
    whereConditions.parentId = parseInt(parent as string);
  }

  // Add department filter if specified
  if (department) {
    whereConditions.departmentId = parseInt(department as string);
  }

  // Add search filter if specified
  if (search) {
    whereConditions.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { nameIndonesian: { contains: search as string, mode: 'insensitive' } },
      { code: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  try {
    const entities = await prisma.masterDataEntity.findMany({
      where: whereConditions,
      include: {
        parent: {
          select: { id: true, name: true, code: true }
        },
        children: {
          select: { id: true, name: true, nameIndonesian: true, code: true },
          where: { isActive: true }
        },
        department: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: entities,
      meta: {
        count: entities.length,
        type: type,
        filters: { parent, search, department, active }
      }
    });
  } catch (error) {
    console.error('Master data fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch master data',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}));

/**
 * @route   GET /api/master-data/:type/hierarchy
 * @desc    Get hierarchical master data (for tree-like structures)
 * @access  Protected
 */
router.get('/:type/hierarchy', protect, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { type } = req.params;
  const { department } = req.query;

  try {
    // Get root level entities (no parent)
    const rootEntities = await prisma.masterDataEntity.findMany({
      where: {
        type: type,
        parentId: null,
        isActive: true,
        ...(department && { departmentId: parseInt(department as string) })
      },
      include: {
        children: {
          where: { isActive: true },
          include: {
            children: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' }
            }
          },
          orderBy: { sortOrder: 'asc' }
        },
        department: {
          select: { id: true, name: true }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({
      success: true,
      data: rootEntities,
      meta: {
        count: rootEntities.length,
        type: type,
        structure: 'hierarchical'
      }
    });
  } catch (error) {
    console.error('Hierarchical master data fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hierarchical master data',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}));

/**
 * @route   POST /api/master-data/:type
 * @desc    Create new master data entity
 * @access  Protected (Admin/Manager)
 */
router.post('/:type', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { type } = req.params;
  const { 
    code, 
    name, 
    nameIndonesian, 
    description, 
    metadata, 
    parentId, 
    departmentId, 
    sortOrder 
  } = req.body;

  // Check authorization
  if (!['admin', 'manager'].includes(req.user?.role || '')) {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Manager role required.'
    });
    return;
  }

  try {
    // Check for duplicate code within type
    const existingEntity = await prisma.masterDataEntity.findFirst({
      where: {
        type: type,
        code: code
      }
    });

    if (existingEntity) {
      res.status(400).json({
        success: false,
        message: `Master data entity with code '${code}' already exists for type '${type}'`
      });
      return;
    }

    const newEntity = await prisma.masterDataEntity.create({
      data: {
        type,
        code,
        name,
        nameIndonesian,
        description,
        metadata,
        parentId: parentId ? parseInt(parentId) : null,
        departmentId: departmentId ? parseInt(departmentId) : null,
        sortOrder: sortOrder || 0
      },
      include: {
        parent: {
          select: { id: true, name: true, code: true }
        },
        department: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: newEntity,
      message: `Master data entity created successfully`
    });
  } catch (error) {
    console.error('Master data creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create master data entity',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}));

/**
 * @route   PUT /api/master-data/:type/:id
 * @desc    Update master data entity
 * @access  Protected (Admin/Manager)
 */
router.put('/:type/:id', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { type, id } = req.params;
  const updateData = req.body;

  // Check authorization
  if (!['admin', 'manager'].includes(req.user?.role || '')) {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Manager role required.'
    });
    return;
  }

  try {
    const updatedEntity = await prisma.masterDataEntity.update({
      where: {
        id: parseInt(id),
        type: type
      },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        parent: {
          select: { id: true, name: true, code: true }
        },
        department: {
          select: { id: true, name: true }
        }
      }
    });

    res.json({
      success: true,
      data: updatedEntity,
      message: 'Master data entity updated successfully'
    });
  } catch (error) {
    console.error('Master data update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update master data entity',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}));

/**
 * @route   DELETE /api/master-data/:type/:id
 * @desc    Delete (deactivate) master data entity
 * @access  Protected (Admin)
 */
router.delete('/:type/:id', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { type, id } = req.params;

  // Check authorization
  if (req.user?.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
    return;
  }

  try {
    // Soft delete by setting isActive to false
    const deactivatedEntity = await prisma.masterDataEntity.update({
      where: {
        id: parseInt(id),
        type: type
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: deactivatedEntity,
      message: 'Master data entity deactivated successfully'
    });
  } catch (error) {
    console.error('Master data deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate master data entity',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}));

/**
 * @route   POST /api/master-data/:type/bulk-import
 * @desc    Bulk import master data entities
 * @access  Protected (Admin)
 */
router.post('/:type/bulk-import', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { type } = req.params;
  const { entities } = req.body;

  // Check authorization
  if (req.user?.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
    return;
  }

  if (!Array.isArray(entities) || entities.length === 0) {
    res.status(400).json({
      success: false,
      message: 'Entities array is required and must not be empty'
    });
    return;
  }

  try {
    const results = [];
    const errors = [];

    for (const entity of entities) {
      try {
        const newEntity = await prisma.masterDataEntity.create({
          data: {
            type,
            ...entity,
            parentId: entity.parentId ? parseInt(entity.parentId) : null,
            departmentId: entity.departmentId ? parseInt(entity.departmentId) : null,
            sortOrder: entity.sortOrder || 0
          }
        });
        results.push(newEntity);
      } catch (error: any) {
        errors.push({
          entity: entity,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        created: results,
        errors: errors,
        summary: {
          total: entities.length,
          created: results.length,
          failed: errors.length
        }
      },
      message: `Bulk import completed. ${results.length} entities created, ${errors.length} failed.`
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk import',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}));

export default router;