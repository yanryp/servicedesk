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
  const { username, email, password, role } = req.body;

  // Basic validation
  if (!username || !email || !password || !role) {
    // Pass error to Express error handler
    return next(Object.assign(new Error('Username, email, password, and role are required.'), { status: 400 }));
  }

  const validRoles = ['admin', 'technician', 'requester', 'manager'];
  if (!validRoles.includes(role)) {
    return next(Object.assign(new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`), { status: 400 }));
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

  // Create new user
  const newUser = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash: hashedPassword,
      role: role as any // Type will be validated by Prisma
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true
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

  // Find user by email with department information
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      department: true
    }
  });

  if (!user) {
    return next(Object.assign(new Error('Invalid credentials.'), { status: 401 })); // User not found
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return next(Object.assign(new Error('Invalid credentials.'), { status: 401 })); // Password incorrect
  }

  // Generate JWT with department information
  const token = jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role, 
      email: user.email,
      departmentId: user.departmentId 
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
      department: user.department
    }
  });
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
