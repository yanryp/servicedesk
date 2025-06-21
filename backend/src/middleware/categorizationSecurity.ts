// Security middleware for ticket categorization
import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from './authMiddleware';

const prisma = new PrismaClient();

// Rate limiting for categorization endpoints
export const categorizationRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 600, // limit each IP to 600 requests per windowMs (60 requests/minute, ~1 per second)
  message: {
    success: false,
    message: 'Too many categorization requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for bulk operations
export const bulkCategorizationRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes  
  max: 60, // limit each IP to 60 bulk requests per windowMs (6 requests/minute)
  message: {
    success: false,
    message: 'Too many bulk categorization requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation for categorization fields
export const validateCategorization = [
  body('rootCause')
    .optional()
    .isIn(['human_error', 'system_error', 'external_factor', 'undetermined'])
    .withMessage('Invalid root cause type'),
  
  body('issueCategory')
    .optional()
    .isIn(['request', 'complaint', 'problem'])
    .withMessage('Invalid issue category type'),
  
  body('overrideReason')
    .optional()
    .trim()
    .escape()
    .isLength({ min: 10, max: 500 })
    .withMessage('Override reason must be between 10 and 500 characters'),
  
  body('force')
    .optional()
    .isBoolean()
    .withMessage('Force flag must be boolean'),

  // Sanitize and validate other fields
  body('reason')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters'),
];

// Validation for bulk categorization
export const validateBulkCategorization = [
  body('ticketIds')
    .isArray({ min: 1, max: 100 })
    .withMessage('Must provide 1-100 ticket IDs'),
  
  body('ticketIds.*')
    .isInt({ min: 1 })
    .withMessage('All ticket IDs must be positive integers'),
  
  body('rootCause')
    .isIn(['human_error', 'system_error', 'external_factor', 'undetermined'])
    .withMessage('Invalid root cause type'),
  
  body('issueCategory')
    .isIn(['request', 'complaint', 'problem'])
    .withMessage('Invalid issue category type'),
  
  body('reason')
    .trim()
    .escape()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
];

// Check if user can categorize tickets  
export const canCategorize = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  (async () => {
    try {
    const { user } = req;
    const ticketId = req.params.ticketId || req.body.ticketId;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get ticket details for access control
    if (ticketId) {
      const ticket = await prisma.ticket.findUnique({
        where: { id: parseInt(ticketId) },
        include: {
          serviceCatalog: {
            include: {
              department: true
            }
          }
        }
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
      }

      // Check if classification is locked
      if (ticket.isClassificationLocked && user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Ticket classification is locked and cannot be modified'
        });
      }

      // Role-based access control
      const canModify = (
        user.role === 'admin' ||
        user.role === 'manager' ||
        user.role === 'technician' ||
        ticket.createdByUserId === user.id ||
        (user.isBusinessReviewer && ticket.isKasdaTicket) ||
        (user.departmentId === ticket.serviceCatalog?.departmentId)
      );

      if (!canModify) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have permission to categorize this ticket.'
        });
      }

      // Store ticket in request for later use
      (req as any).ticket = ticket;
    }

      next();
    } catch (error) {
      console.error('Error in categorization access control:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during access control check'
      });
    }
  })();
};

// Validate categorization business rules
export const validateCategorizationRules = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  (async () => {
    try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { user } = req;
    const { rootCause, issueCategory, overrideReason } = req.body;
    const ticket = (req as any).ticket;

    // Business rules validation
    if (ticket) {
      // Check if technician is overriding user classification
      const isOverride = (
        (ticket.userRootCause && rootCause && ticket.userRootCause !== rootCause) ||
        (ticket.userIssueCategory && issueCategory && ticket.userIssueCategory !== issueCategory)
      );

      // Require override reason for technician overrides
      if (isOverride && user?.role === 'technician' && !overrideReason) {
        return res.status(400).json({
          success: false,
          message: 'Override reason is required when changing user classifications'
        });
      }

      // Prevent non-technicians from overriding without proper permissions
      if (isOverride && !['technician', 'manager', 'admin'].includes(user?.role || '')) {
        return res.status(403).json({
          success: false,
          message: 'Only technicians, managers, and admins can override classifications'
        });
      }
    }

      next();
    } catch (error) {
      console.error('Error in categorization rules validation:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during rules validation'
      });
    }
  })();
};

// Audit logging helper
export const logClassificationChange = async (
  ticketId: number,
  userId: number,
  fieldChanged: string,
  oldValue: string | null,
  newValue: string | null,
  reason: string | null,
  req: Request
) => {
  try {
    await prisma.ticketClassificationAudit.create({
      data: {
        ticketId,
        changedBy: userId,
        fieldChanged,
        oldValue,
        newValue,
        reason,
        ipAddress: req.ip || req.connection.remoteAddress || null,
        userAgent: req.get('User-Agent') || null,
        sessionId: (req as any).sessionID || null,
      }
    });
  } catch (error) {
    console.error('Error logging classification change:', error);
    // Don't fail the main operation if audit logging fails
  }
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent XSS
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // CSRF protection token header
  res.setHeader('X-CSRF-Token', 'required');
  
  next();
};

// IP whitelist for bulk operations (optional - can be configured)
export const bulkOperationIPWhitelist = (allowedIPs: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (allowedIPs.length === 0) {
      return next(); // Skip if no whitelist configured
    }

    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (!clientIP || !allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        success: false,
        message: 'IP address not authorized for bulk operations'
      });
    }
    
    next();
  };
};

export default {
  categorizationRateLimit,
  bulkCategorizationRateLimit,
  validateCategorization,
  validateBulkCategorization,
  canCategorize,
  validateCategorizationRules,
  logClassificationChange,
  securityHeaders,
  bulkOperationIPWhitelist
};