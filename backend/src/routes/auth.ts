// backend/src/routes/auth.ts
import express, { Request, Response, Router, NextFunction } from 'express';
// @ts-ignore
import bcrypt from 'bcrypt';
// @ts-ignore
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma';

const router: Router = express.Router();
const SALT_ROUNDS = 10; // For bcrypt hashing
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in .env file');
  process.exit(1); // Exit if JWT_SECRET is not set
}

// Utility to handle async route errors
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// POST /api/auth/register
router.post('/register', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { 
    username, email, password, role, departmentId, firstName, lastName, specialization,
    unitId, managerId, workloadCapacity, isBusinessReviewer, isKasdaUser 
  } = req.body;

  // Basic validation
  if (!username || !email || !password || !role || !departmentId) {
    return next(Object.assign(new Error('Username, email, password, role, and departmentId are required.'), { status: 400 }));
  }

  const validRoles = ['admin', 'technician', 'requester', 'manager'];
  if (!validRoles.includes(role)) {
    return next(Object.assign(new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`), { status: 400 }));
  }

  // Additional validation for technician specialization
  if (role === 'technician' && specialization) {
    if (!specialization.primarySkill || !specialization.experienceLevel) {
      return next(Object.assign(new Error('Primary skill and experience level are required for technicians.'), { status: 400 }));
    }
  }

  // Verify department exists
  const department = await prisma.department.findUnique({
    where: { id: parseInt(departmentId) }
  });

  if (!department) {
    return next(Object.assign(new Error('Invalid department ID.'), { status: 400 }));
  }

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username: username },
        { email: email }
      ]
    }
  });

  if (existingUser) {
    return next(Object.assign(new Error('Username or email already exists.'), { status: 409 }));
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Prepare user data
  const userData: any = {
    username,
    email,
    passwordHash: hashedPassword,
    role: role as any,
    departmentId: parseInt(departmentId)
  };

  // Add optional fields if provided
  if (unitId) userData.unitId = parseInt(unitId);
  if (managerId) userData.managerId = parseInt(managerId);
  if (workloadCapacity) userData.workloadCapacity = parseInt(workloadCapacity);
  if (typeof isBusinessReviewer === 'boolean') userData.isBusinessReviewer = isBusinessReviewer;
  if (typeof isKasdaUser === 'boolean') userData.isKasdaUser = isKasdaUser;

  // Add technician specialization fields if provided
  if (role === 'technician' && specialization) {
    userData.primarySkill = specialization.primarySkill;
    userData.experienceLevel = specialization.experienceLevel;
    userData.secondarySkills = specialization.secondarySkills;
  }

  // Create new user
  const newUser = await prisma.user.create({
    data: userData,
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      departmentId: true,
      primarySkill: true,
      experienceLevel: true,
      secondarySkills: true,
      createdAt: true,
      department: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  res.status(201).json({
    message: 'User registered successfully!',
    user: newUser,
  });
}));

// POST /api/auth/login
router.post('/login', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(Object.assign(new Error('Email and password are required.'), { status: 400 }));
  }

  // Find user by email with department and unit information
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      department: true,
      unit: true
    }
  });

  if (!user) {
    return next(Object.assign(new Error('Invalid credentials.'), { status: 401 })); // User not found
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return next(Object.assign(new Error('Invalid credentials.'), { status: 401 })); // Password incorrect
  }

  // Generate JWT with department and unit information
  const token = jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role, 
      email: user.email,
      departmentId: user.departmentId,
      unitId: user.unitId,
      isKasdaUser: user.isKasdaUser,
      isBusinessReviewer: user.isBusinessReviewer
    },
    JWT_SECRET,
    { expiresIn: '1h' } // Token expires in 1 hour
  );

  res.json({ 
    message: 'Login successful!',
    token,
    user: { 
      id: user.id, 
      username: user.username, 
      email: user.email, 
      role: user.role,
      departmentId: user.departmentId,
      unitId: user.unitId,
      isKasdaUser: user.isKasdaUser,
      isBusinessReviewer: user.isBusinessReviewer,
      department: user.department,
      unit: user.unit
    }
  });
}));

// GET /api/auth/units/:departmentId - Get units by department for user management
router.get('/units/:departmentId', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { departmentId } = req.params;

  if (!departmentId || isNaN(parseInt(departmentId))) {
    return next(Object.assign(new Error('Valid department ID is required'), { status: 400 }));
  }

  try {
    const units = await prisma.unit.findMany({
      where: {
        departmentId: parseInt(departmentId),
        isActive: true
      },
      select: {
        id: true,
        code: true,
        name: true,
        displayName: true,
        unitType: true,
        sortOrder: true
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    res.json(units);
  } catch (error) {
    console.error('Error fetching units:', error);
    return next(Object.assign(new Error('Failed to fetch units'), { status: 500 }));
  }
}));

// GET /api/auth/managers/:departmentId - Get potential managers by department for user management
router.get('/managers/:departmentId', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { departmentId } = req.params;

  if (!departmentId || isNaN(parseInt(departmentId))) {
    return next(Object.assign(new Error('Valid department ID is required'), { status: 400 }));
  }

  try {
    const managers = await prisma.user.findMany({
      where: {
        departmentId: parseInt(departmentId),
        role: {
          in: ['manager', 'admin']
        }
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        unit: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        }
      },
      orderBy: [
        { role: 'asc' }, // admins first, then managers
        { username: 'asc' }
      ]
    });

    res.json(managers);
  } catch (error) {
    console.error('Error fetching managers:', error);
    return next(Object.assign(new Error('Failed to fetch managers'), { status: 500 }));
  }
}));

// Basic error handling middleware (add to index.ts or a dedicated error handling module later)
// For now, this simple handler will catch errors passed by next()
router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error in auth route:", err.stack);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
});

export default router;
