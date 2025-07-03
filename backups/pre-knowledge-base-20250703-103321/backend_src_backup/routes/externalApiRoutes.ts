// backend/src/routes/externalApiRoutes.ts - Simplified External API
import express, { Request, Response, NextFunction } from 'express';
import prisma from '../db/prisma';

const router = express.Router();

// Simple API key authentication for demo
const simpleApiAuth = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== 'demo-bsg-api-key-12345') {
    res.status(401).json({ 
      error: 'Invalid API key',
      message: 'Please provide a valid API key in the X-API-Key header' 
    });
    return;
  }
  next();
};

router.use(simpleApiAuth);

// Utility to handle async route errors
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// GET /external-api/health - API health check
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: [
      'ticket_management',
      'user_management',
      'auto_assignment',
      'api_tokens'
    ]
  });
});

// GET /external-api/tickets - Get tickets
router.get('/tickets', asyncHandler(async (req: Request, res: Response) => {
  const { status, priority, limit = 50, offset = 0 } = req.query;

  const whereClause: any = {};
  if (status) whereClause.status = status;
  if (priority) whereClause.priority = priority;

  const tickets = await prisma.ticket.findMany({
    where: whereClause,
    include: {
      createdBy: {
        select: { id: true, username: true, email: true }
      },
      assignedTo: {
        select: { id: true, username: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit as string),
    skip: parseInt(offset as string)
  });

  res.json({ 
    success: true,
    data: tickets,
    count: tickets.length
  });
}));

// GET /external-api/tickets/:id - Get specific ticket
router.get('/tickets/:id', asyncHandler(async (req: Request, res: Response) => {
  const ticketId = parseInt(req.params.id);

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      createdBy: {
        select: { id: true, username: true, email: true }
      },
      assignedTo: {
        select: { id: true, username: true, email: true }
      }
    }
  });

  if (!ticket) {
    return res.status(404).json({ 
      success: false,
      error: 'Ticket not found' 
    });
  }

  res.json({ 
    success: true,
    data: ticket 
  });
}));

// POST /external-api/tickets - Create new ticket
router.post('/tickets', asyncHandler(async (req: Request, res: Response) => {
  const {
    title,
    description,
    priority = 'medium',
    createdByUserId
  } = req.body;

  if (!title || !description || !createdByUserId) {
    return res.status(400).json({
      success: false,
      error: 'Title, description, and createdByUserId are required'
    });
  }

  const ticket = await prisma.ticket.create({
    data: {
      title,
      description,
      priority,
      status: 'open',
      createdByUserId: parseInt(createdByUserId)
    },
    include: {
      createdBy: {
        select: { id: true, username: true, email: true }
      }
    }
  });

  res.status(201).json({
    success: true,
    message: 'Ticket created successfully',
    data: ticket
  });
}));

// GET /external-api/users - Get users
router.get('/users', asyncHandler(async (req: Request, res: Response) => {
  const { role, departmentId } = req.query;

  const whereClause: any = {};
  if (role) whereClause.role = role;
  if (departmentId) whereClause.departmentId = parseInt(departmentId as string);

  const users = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      primarySkill: true,
      experienceLevel: true,
      isAvailable: true,
      currentWorkload: true,
      workloadCapacity: true,
      department: {
        select: { id: true, name: true }
      }
    }
  });

  res.json({ 
    success: true,
    data: users,
    count: users.length
  });
}));

// GET /external-api/departments - Get departments
router.get('/departments', asyncHandler(async (req: Request, res: Response) => {
  const departments = await prisma.department.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      departmentType: true
    }
  });

  res.json({ 
    success: true,
    data: departments,
    count: departments.length
  });
}));

// Error handling middleware
router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('External API error:', error);
  
  const status = error.status || 500;
  const message = error.message || 'Internal server error';
  
  res.status(status).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
});

export default router;