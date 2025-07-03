// src/routes/departmentRoutes.ts
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { protect, authorize, AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../db/prisma';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

// @route   GET /api/departments
// @desc    Get all departments
// @access  Private (Admin/Manager only)
router.get('/', 
  protect,
  authorize('admin', 'manager'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: {
            users: true,
            categories: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(departments);
  })
);

// @route   GET /api/departments/:id
// @desc    Get single department with details
// @access  Private (Admin/Manager only)
router.get('/:id',
  protect,
  authorize('admin', 'manager'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    
    const department = await prisma.department.findUnique({
      where: { id: parseInt(id) },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        },
        categories: {
          include: {
            subCategories: {
              include: {
                items: true
              }
            }
          }
        }
      }
    });

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json(department);
  })
);

// @route   POST /api/departments
// @desc    Create new department
// @access  Private (Admin only)
router.post('/',
  protect,
  authorize('admin'),
  [
    body('name', 'Department name is required').not().isEmpty().trim(),
    body('description').optional().trim()
  ],
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    // Check if department already exists
    const existingDept = await prisma.department.findUnique({
      where: { name }
    });

    if (existingDept) {
      return res.status(409).json({ message: 'Department with this name already exists' });
    }

    const department = await prisma.department.create({
      data: {
        name,
        description: description || null
      }
    });

    res.status(201).json({
      message: 'Department created successfully',
      department
    });
  })
);

// @route   PUT /api/departments/:id
// @desc    Update department
// @access  Private (Admin only)
router.put('/:id',
  protect,
  authorize('admin'),
  [
    body('name', 'Department name is required').not().isEmpty().trim(),
    body('description').optional().trim()
  ],
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, description } = req.body;

    // Check if department exists
    const existingDept = await prisma.department.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingDept) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if name conflicts with another department
    if (name !== existingDept.name) {
      const nameConflict = await prisma.department.findUnique({
        where: { name }
      });

      if (nameConflict) {
        return res.status(409).json({ message: 'Department with this name already exists' });
      }
    }

    const department = await prisma.department.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description: description || null
      }
    });

    res.json({
      message: 'Department updated successfully',
      department
    });
  })
);

// @route   DELETE /api/departments/:id
// @desc    Delete department
// @access  Private (Admin only)
router.delete('/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;

    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            users: true,
            categories: true
          }
        }
      }
    });

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if department has users or categories
    if (department._count.users > 0 || department._count.categories > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete department with assigned users or categories. Please reassign them first.' 
      });
    }

    await prisma.department.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Department deleted successfully' });
  })
);

// @route   GET /api/departments/:id/service-catalogs
// @desc    Get service catalogs managed by department
// @access  Private (Admin/Manager only)
router.get('/:id/service-catalogs',
  protect,
  authorize('admin', 'manager'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    
    const department = await prisma.department.findUnique({
      where: { id: parseInt(id) },
      include: {
        serviceCatalog: {
          where: { isActive: true },
          include: {
            serviceItems: {
              where: { isActive: true },
              include: {
                templates: {
                  where: { isVisible: true }
                }
              }
            }
          }
        }
      }
    });

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Transform service catalogs to include item counts
    const serviceCatalogs = department.serviceCatalog.map(catalog => ({
      id: catalog.id,
      name: catalog.name,
      description: catalog.description,
      itemCount: catalog.serviceItems.length,
      templateCount: catalog.serviceItems.reduce((total, item) => total + item.templates.length, 0)
    }));

    res.json(serviceCatalogs);
  })
);

// @route   GET /api/departments/:id/metrics
// @desc    Get department metrics (active tickets, resolution time)
// @access  Private (Admin/Manager only)
router.get('/:id/metrics',
  protect,
  authorize('admin', 'manager'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    
    // Get users in this department first
    const departmentUsers = await prisma.user.findMany({
      where: { departmentId: parseInt(id) },
      select: { id: true }
    });
    
    const userIds = departmentUsers.map(u => u.id);

    // Get active tickets assigned to users in this department
    const activeTickets = await prisma.ticket.count({
      where: {
        assignedToUserId: {
          in: userIds
        },
        status: {
          in: ['open', 'assigned', 'in_progress', 'pending_requester_response']
        }
      }
    });

    // Get resolved tickets for average resolution time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const resolvedTickets = await prisma.ticket.findMany({
      where: {
        assignedToUserId: {
          in: userIds
        },
        status: 'resolved',
        resolvedAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        createdAt: true,
        resolvedAt: true
      }
    });

    // Calculate average resolution time in hours
    let avgResolutionTime = 0;
    if (resolvedTickets.length > 0) {
      const totalResolutionTime = resolvedTickets.reduce((total, ticket) => {
        if (ticket.resolvedAt && ticket.createdAt) {
          const resolutionTime = ticket.resolvedAt.getTime() - ticket.createdAt.getTime();
          return total + resolutionTime;
        }
        return total;
      }, 0);
      
      avgResolutionTime = Math.round((totalResolutionTime / resolvedTickets.length) / (1000 * 60 * 60)); // Convert to hours
    }

    res.json({
      activeTickets,
      avgResolutionTime,
      resolvedTicketsLast30Days: resolvedTickets.length
    });
  })
);

// @route   PUT /api/departments/:id/assign-user/:userId
// @desc    Assign user to department
// @access  Private (Admin only)
router.put('/:id/assign-user/:userId',
  protect,
  authorize('admin'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id, userId } = req.params;

    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { id: parseInt(id) }
    });

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's department
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { departmentId: parseInt(id) },
      include: { department: true }
    });

    res.json({
      message: 'User assigned to department successfully',
      user: updatedUser
    });
  })
);

export default router;