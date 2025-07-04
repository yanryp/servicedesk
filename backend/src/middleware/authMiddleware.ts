// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in the environment variables.');
  process.exit(1);
}

// Extend Express Request type to include 'user' property
export interface AuthenticatedRequest extends Request {
  user?: { 
    id: number; 
    role: string; 
    email: string; 
    departmentId?: number;
    username?: string;
    isKasdaUser?: boolean;
    isBusinessReviewer?: boolean;
  }; // Define the structure of your decoded user payload
}

export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      // @ts-ignore - Bypassing a persistent TS error for jwt.verify until types are fully resolved
      const decoded = jwt.verify(token, JWT_SECRET) as { 
        id: number; 
        role: string; 
        email: string; 
        departmentId?: number;
        username?: string;
        isKasdaUser?: boolean;
        isBusinessReviewer?: boolean;
        iat: number; 
        exp: number; 
      };

      console.log('Decoded Token:', decoded); // Add logging

      // Attach user to the request object
      req.user = { 
        id: decoded.id, 
        role: decoded.role, 
        email: decoded.email, 
        departmentId: decoded.departmentId,
        username: decoded.username,
        isKasdaUser: decoded.isKasdaUser,
        isBusinessReviewer: decoded.isBusinessReviewer
      };

      next();
    } catch (error: any) {
      console.error('Token verification failed:', error);
      res.status(401).json({ 
        message: 'Not authorized, token failed.',
        error: error.message || 'No additional error information.'
      });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }
};

// Optional: Middleware to restrict access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return; // End execution for this path
    }
    if (!req.user || !req.user.role) {
      res.status(401).json({ message: 'User role not found in token' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
      return; // End execution for this path
    }
    next(); // If authorized, pass to the next handler
  };
};
