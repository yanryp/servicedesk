// backend/src/routes/autoAssignmentRoutes.ts
import express, { Request, Response, NextFunction } from 'express';
import prisma from '../db/prisma';
import { protect as authMiddleware } from '../middleware/authMiddleware';
import { AutoAssignmentService } from '../services/autoAssignmentService';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Utility to handle async route errors
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// GET /api/auto-assignment/rules - Get all auto-assignment rules
router.get('/rules', asyncHandler(async (req: Request, res: Response) => {
  const { departmentId, isActive } = req.query;

  const whereClause: any = {};
  if (departmentId) whereClause.departmentId = parseInt(departmentId as string);
  if (isActive !== undefined) whereClause.isActive = isActive === 'true';

  const rules = await prisma.autoAssignmentRule.findMany({
    where: whereClause,
    include: {
      template: {
        select: { id: true, name: true }
      },
      department: {
        select: { id: true, name: true }
      },
      _count: {
        select: { assignmentLogs: true }
      }
    },
    orderBy: { priority: 'desc' }
  });

  res.json({ rules });
}));

// POST /api/auto-assignment/rules - Create new auto-assignment rule
router.post('/rules', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as any;
  
  // Only admins can create assignment rules
  if (user.role !== 'admin') {
    return next(Object.assign(new Error('Only administrators can create auto-assignment rules'), { status: 403 }));
  }

  const {
    name,
    description,
    templateId,
    departmentId,
    priority_level,
    requiredSkill,
    assignmentStrategy,
    respectCapacity,
    maxWorkloadPercent,
    priority
  } = req.body;

  if (!name) {
    return next(Object.assign(new Error('Rule name is required'), { status: 400 }));
  }

  const rule = await prisma.autoAssignmentRule.create({
    data: {
      name,
      description,
      templateId: templateId ? parseInt(templateId) : null,
      departmentId: departmentId ? parseInt(departmentId) : null,
      priority_level,
      requiredSkill,
      assignmentStrategy: assignmentStrategy || 'skill_match',
      respectCapacity: respectCapacity !== false,
      maxWorkloadPercent: maxWorkloadPercent || 80,
      priority: priority || 0
    },
    include: {
      template: {
        select: { id: true, name: true }
      },
      department: {
        select: { id: true, name: true }
      }
    }
  });

  res.status(201).json({ 
    message: 'Auto-assignment rule created successfully',
    rule 
  });
}));

// PUT /api/auto-assignment/rules/:id - Update auto-assignment rule
router.put('/rules/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as any;
  
  if (user.role !== 'admin') {
    return next(Object.assign(new Error('Only administrators can update auto-assignment rules'), { status: 403 }));
  }

  const ruleId = parseInt(req.params.id);
  const {
    name,
    description,
    isActive,
    templateId,
    departmentId,
    priority_level,
    requiredSkill,
    assignmentStrategy,
    respectCapacity,
    maxWorkloadPercent,
    priority
  } = req.body;

  const rule = await prisma.autoAssignmentRule.update({
    where: { id: ruleId },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(isActive !== undefined && { isActive }),
      ...(templateId !== undefined && { templateId: templateId ? parseInt(templateId) : null }),
      ...(departmentId !== undefined && { departmentId: departmentId ? parseInt(departmentId) : null }),
      ...(priority_level !== undefined && { priority_level }),
      ...(requiredSkill !== undefined && { requiredSkill }),
      ...(assignmentStrategy && { assignmentStrategy }),
      ...(respectCapacity !== undefined && { respectCapacity }),
      ...(maxWorkloadPercent !== undefined && { maxWorkloadPercent }),
      ...(priority !== undefined && { priority })
    },
    include: {
      template: {
        select: { id: true, name: true }
      },
      department: {
        select: { id: true, name: true }
      }
    }
  });

  res.json({ 
    message: 'Auto-assignment rule updated successfully',
    rule 
  });
}));

// DELETE /api/auto-assignment/rules/:id - Delete auto-assignment rule
router.delete('/rules/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as any;
  
  if (user.role !== 'admin') {
    return next(Object.assign(new Error('Only administrators can delete auto-assignment rules'), { status: 403 }));
  }

  const ruleId = parseInt(req.params.id);

  await prisma.autoAssignmentRule.delete({
    where: { id: ruleId }
  });

  res.json({ message: 'Auto-assignment rule deleted successfully' });
}));

// POST /api/auto-assignment/assign/:ticketId - Manually trigger auto-assignment for a ticket
router.post('/assign/:ticketId', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as any;
  
  // Only managers, admins, and technicians can trigger assignment
  if (!['admin', 'manager', 'technician'].includes(user.role)) {
    return next(Object.assign(new Error('Insufficient permissions to assign tickets'), { status: 403 }));
  }

  const ticketId = parseInt(req.params.ticketId);
  const { templateId, departmentId, priority, requiredSkill } = req.body;

  // Get ticket details to build criteria
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      template: true,
      assignedTo: {
        select: { id: true, username: true, departmentId: true }
      }
    }
  });

  if (!ticket) {
    return next(Object.assign(new Error('Ticket not found'), { status: 404 }));
  }

  if (ticket.assignedToUserId) {
    return next(Object.assign(new Error('Ticket is already assigned'), { status: 400 }));
  }

  const criteria = {
    templateId: templateId || ticket.templateId,
    departmentId: departmentId || user.departmentId,
    priority: priority || ticket.priority,
    requiredSkill
  };

  const result = await AutoAssignmentService.assignTicket(ticketId, criteria, user.id);

  if (result.success) {
    res.json({
      message: 'Ticket assigned successfully',
      assignment: result
    });
  } else {
    res.status(400).json({
      message: 'Auto-assignment failed',
      reason: result.reason
    });
  }
}));

// POST /api/auto-assignment/manual/:ticketId - Manual assignment
router.post('/manual/:ticketId', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as any;
  
  if (!['admin', 'manager', 'technician'].includes(user.role)) {
    return next(Object.assign(new Error('Insufficient permissions to assign tickets'), { status: 403 }));
  }

  const ticketId = parseInt(req.params.ticketId);
  const { assignedToUserId, reason } = req.body;

  if (!assignedToUserId) {
    return next(Object.assign(new Error('Assigned user ID is required'), { status: 400 }));
  }

  // Verify the assignee is a technician
  const assignee = await prisma.user.findUnique({
    where: { id: parseInt(assignedToUserId) }
  });

  if (!assignee || assignee.role !== 'technician') {
    return next(Object.assign(new Error('Invalid assignee - must be a technician'), { status: 400 }));
  }

  const result = await AutoAssignmentService.manualAssignment(
    ticketId,
    parseInt(assignedToUserId),
    user.id,
    reason
  );

  if (result.success) {
    res.json({
      message: 'Ticket assigned manually',
      assignment: result
    });
  } else {
    res.status(400).json({
      message: 'Manual assignment failed',
      reason: result.reason
    });
  }
}));

// GET /api/auto-assignment/technicians - Get available technicians
router.get('/technicians', asyncHandler(async (req: Request, res: Response) => {
  const { departmentId, skill, availableOnly } = req.query;

  const whereClause: any = {
    role: 'technician'
  };

  if (departmentId) whereClause.departmentId = parseInt(departmentId as string);
  if (availableOnly === 'true') whereClause.isAvailable = true;
  if (skill) {
    whereClause.OR = [
      { primarySkill: skill },
      { secondarySkills: { contains: skill as string } }
    ];
  }

  const technicians = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      username: true,
      email: true,
      primarySkill: true,
      experienceLevel: true,
      secondarySkills: true,
      isAvailable: true,
      currentWorkload: true,
      workloadCapacity: true,
      department: {
        select: { id: true, name: true }
      }
    },
    orderBy: [
      { isAvailable: 'desc' },
      { currentWorkload: 'asc' },
      { experienceLevel: 'desc' }
    ]
  });

  res.json({ technicians });
}));

// PUT /api/auto-assignment/technicians/:id/availability - Update technician availability
router.put('/technicians/:id/availability', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as any;
  const technicianId = parseInt(req.params.id);
  const { isAvailable } = req.body;

  // Technicians can update their own availability, admins/managers can update anyone's
  if (user.role === 'technician' && user.id !== technicianId) {
    return next(Object.assign(new Error('Technicians can only update their own availability'), { status: 403 }));
  } else if (!['admin', 'manager', 'technician'].includes(user.role)) {
    return next(Object.assign(new Error('Insufficient permissions'), { status: 403 }));
  }

  const updatedTechnician = await AutoAssignmentService.updateTechnicianAvailability(
    technicianId,
    isAvailable
  );

  res.json({
    message: 'Technician availability updated',
    technician: {
      id: updatedTechnician.id,
      username: updatedTechnician.username,
      isAvailable: updatedTechnician.isAvailable
    }
  });
}));

// GET /api/auto-assignment/analytics - Get assignment analytics
router.get('/analytics', asyncHandler(async (req: Request, res: Response) => {
  const { departmentId, startDate, endDate } = req.query;

  const analytics = await AutoAssignmentService.getAssignmentAnalytics(
    departmentId ? parseInt(departmentId as string) : undefined,
    startDate ? new Date(startDate as string) : undefined,
    endDate ? new Date(endDate as string) : undefined
  );

  res.json({ analytics });
}));

// GET /api/auto-assignment/logs - Get assignment logs
router.get('/logs', asyncHandler(async (req: Request, res: Response) => {
  const { ticketId, assignedToUserId, limit = 50, offset = 0 } = req.query;

  const whereClause: any = {};
  if (ticketId) whereClause.ticketId = parseInt(ticketId as string);
  if (assignedToUserId) whereClause.assignedToUserId = parseInt(assignedToUserId as string);

  const logs = await prisma.ticketAssignmentLog.findMany({
    where: whereClause,
    include: {
      ticket: {
        select: { id: true, title: true, priority: true, status: true }
      },
      assignedToUser: {
        select: { id: true, username: true, email: true }
      },
      assignmentRule: {
        select: { id: true, name: true, assignmentStrategy: true }
      },
      assignedByUser: {
        select: { id: true, username: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit as string),
    skip: parseInt(offset as string)
  });

  res.json({ logs });
}));

export default router;