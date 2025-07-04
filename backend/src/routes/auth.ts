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
    username, name, email, password, role, departmentId,
    unitId, managerId 
  } = req.body;

  // Basic validation
  if (!username || !email || !password || !role) {
    return next(Object.assign(new Error('Username, email, password, and role are required.'), { status: 400 }));
  }

  const validRoles = ['admin', 'technician', 'requester', 'manager'];
  if (!validRoles.includes(role)) {
    return next(Object.assign(new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`), { status: 400 }));
  }

  // Validate assignment rules based on role
  if (role === 'requester' || role === 'manager') {
    if (!unitId) {
      return next(Object.assign(new Error(`${role === 'requester' ? 'Requesters' : 'Managers'} must be assigned to a branch unit.`), { status: 400 }));
    }
  }

  if (role === 'technician' || role === 'admin') {
    if (!departmentId && !unitId) {
      return next(Object.assign(new Error(`${role === 'technician' ? 'Technicians' : 'Admins'} must be assigned to either a department or a branch unit.`), { status: 400 }));
    }
  }

  // Verify department exists if provided
  if (departmentId) {
    const department = await prisma.department.findUnique({
      where: { id: parseInt(departmentId) }
    });

    if (!department) {
      return next(Object.assign(new Error('Invalid department ID.'), { status: 400 }));
    }
  }

  // Verify unit exists if provided
  if (unitId) {
    const unit = await prisma.unit.findUnique({
      where: { id: parseInt(unitId) }
    });

    if (!unit) {
      return next(Object.assign(new Error('Invalid unit ID.'), { status: 400 }));
    }
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

  // Prepare user data with automatic business rule application
  const userData: any = {
    username,
    name: name || null,
    email,
    passwordHash: hashedPassword,
    role: role as any
  };

  // Apply assignment rules
  if (departmentId) userData.departmentId = parseInt(departmentId);
  if (unitId) userData.unitId = parseInt(unitId);
  if (managerId) userData.managerId = parseInt(managerId);

  // Automatic business rule application based on role and assignment
  if (role === 'manager') {
    // Managers automatically get business reviewer privileges
    userData.isBusinessReviewer = true;
    userData.workloadCapacity = 20; // Default manager workload
  }

  if (role === 'technician') {
    // Set default technician attributes
    userData.workloadCapacity = 10; // Default technician workload
    userData.isAvailable = true;
    userData.experienceLevel = 'intermediate'; // Default experience level
    
    // Set primary skill based on department assignment
    if (departmentId) {
      const dept = await prisma.department.findUnique({ where: { id: parseInt(departmentId) } });
      if (dept?.name === 'Dukungan dan Layanan') {
        userData.primarySkill = 'banking_systems';
        userData.secondarySkills = 'KASDA, BSGDirect, Core Banking';
      } else if (dept?.name === 'Information Technology') {
        userData.primarySkill = 'network_infrastructure';
        userData.secondarySkills = 'Network Admin, Server Management, IT Support';
      }
    }
  }

  if (role === 'admin') {
    // Admins get full privileges
    userData.isBusinessReviewer = true;
    userData.workloadCapacity = 50; // Higher admin workload
    userData.primarySkill = 'system_administration';
  }

  // KASDA access determination: All branch-assigned users get KASDA access
  if (unitId) {
    userData.isKasdaUser = true;
  }

  // Create new user
  const newUser = await prisma.user.create({
    data: userData,
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      departmentId: true,
      unitId: true,
      isBusinessReviewer: true,
      isKasdaUser: true,
      primarySkill: true,
      experienceLevel: true,
      secondarySkills: true,
      workloadCapacity: true,
      createdAt: true,
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
          displayName: true,
          unitType: true
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

// GET /api/auth/branches - Get all BSG branches for user assignment (independent of department)
router.get('/branches', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('=== BRANCHES API CALLED ===');
    console.log('Request query params:', req.query);
    console.log('Request headers:', req.headers.authorization ? 'Has auth header' : 'No auth header');
    
    const branches = await prisma.unit.findMany({
      where: {
        isActive: true,
        OR: [
          { unitType: 'CABANG' },
          { unitType: 'CAPEM' }
        ]
      },
      select: {
        id: true,
        code: true,
        name: true,
        displayName: true,
        unitType: true,
        sortOrder: true,
        province: true,
        region: true,
        metadata: true
      },
      orderBy: [
        { unitType: 'asc' },
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
      take: 100 // Explicitly limit to 100 results, no offset
    });

    console.log(`=== BRANCHES QUERY RESULT: ${branches.length} results ===`);
    if (branches.length > 0) {
      console.log('Sample branches:', branches.slice(0, 3).map(b => ({ id: b.id, code: b.code, name: b.name, unitType: b.unitType })));
    } else {
      console.log('No branches found - investigating...');
      // Check if there are any units at all
      const allUnits = await prisma.unit.findMany({
        select: { id: true, code: true, unitType: true, isActive: true },
        take: 5
      });
      console.log('Sample of all units in database:', allUnits);
    }
    
    res.json(branches);
  } catch (error) {
    console.error('=== ERROR FETCHING BRANCHES ===', error);
    return next(Object.assign(new Error('Failed to fetch branches'), { status: 500 }));
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
