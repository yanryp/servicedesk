// backend/src/routes/apiTokenRoutes.ts
import express, { Request, Response, NextFunction } from 'express';
import { protect as authMiddleware } from '../middleware/authMiddleware';
import { ApiTokenService } from '../services/apiTokenService';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Utility to handle async route errors
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// GET /api/tokens - Get user's tokens or all tokens (admin)
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { user } = req as any;

  let tokens;
  if (user.role === 'admin') {
    // Admins can see all tokens
    tokens = await ApiTokenService.getAllTokens();
  } else {
    // Users can only see their own tokens
    tokens = await ApiTokenService.getUserTokens(user.id);
  }

  res.json({ tokens });
}));

// POST /api/tokens - Create new API token
router.post('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as any;
  const { name, description, scopes, expiresAt } = req.body;

  if (!name || !scopes || !Array.isArray(scopes)) {
    return next(Object.assign(new Error('Name and scopes array are required'), { status: 400 }));
  }

  // Non-admin users have limited scope options
  if (user.role !== 'admin') {
    const allowedScopes = [
      'tickets:read',
      'tickets:write',
      'templates:read',
      'analytics:read'
    ];
    
    const invalidScopes = scopes.filter((scope: string) => !allowedScopes.includes(scope));
    if (invalidScopes.length > 0) {
      return next(Object.assign(
        new Error(`Invalid scopes for your role: ${invalidScopes.join(', ')}`), 
        { status: 403 }
      ));
    }
  }

  try {
    const { token, tokenRecord } = await ApiTokenService.createToken(
      {
        name,
        description,
        scopes,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined
      },
      user.id
    );

    res.status(201).json({
      message: 'API token created successfully',
      token, // Return the raw token only once
      tokenInfo: {
        id: tokenRecord.id,
        name: tokenRecord.name,
        description: tokenRecord.description,
        scopes: tokenRecord.scopes,
        expiresAt: tokenRecord.expiresAt,
        createdAt: tokenRecord.createdAt
      }
    });
  } catch (error) {
    return next(Object.assign(
      new Error(error instanceof Error ? error.message : 'Failed to create token'), 
      { status: 400 }
    ));
  }
}));

// PUT /api/tokens/:id/revoke - Revoke a token
router.put('/:id/revoke', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as any;
  const tokenId = parseInt(req.params.id);

  // Check if user owns the token or is admin
  if (user.role !== 'admin') {
    const userTokens = await ApiTokenService.getUserTokens(user.id);
    const ownsToken = userTokens.some(token => token.id === tokenId);
    
    if (!ownsToken) {
      return next(Object.assign(new Error('Token not found or access denied'), { status: 404 }));
    }
  }

  await ApiTokenService.revokeToken(tokenId, user.id);

  res.json({ message: 'Token revoked successfully' });
}));

// GET /api/tokens/:id/analytics - Get token usage analytics
router.get('/:id/analytics', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as any;
  const tokenId = parseInt(req.params.id);
  const days = parseInt(req.query.days as string) || 30;

  // Check if user owns the token or is admin
  if (user.role !== 'admin') {
    const userTokens = await ApiTokenService.getUserTokens(user.id);
    const ownsToken = userTokens.some(token => token.id === tokenId);
    
    if (!ownsToken) {
      return next(Object.assign(new Error('Token not found or access denied'), { status: 404 }));
    }
  }

  const analytics = await ApiTokenService.getTokenAnalytics(tokenId, days);

  res.json({ analytics });
}));

// GET /api/tokens/scopes - Get available scopes
router.get('/scopes', asyncHandler(async (req: Request, res: Response) => {
  const { user } = req as any;

  let availableScopes;
  
  if (user.role === 'admin') {
    availableScopes = [
      { scope: '*', description: 'Full access to all endpoints' },
      { scope: 'tickets:read', description: 'Read tickets and ticket data' },
      { scope: 'tickets:write', description: 'Create and update tickets' },
      { scope: 'tickets:delete', description: 'Delete tickets' },
      { scope: 'tickets:*', description: 'Full access to ticket operations' },
      { scope: 'users:read', description: 'Read user information' },
      { scope: 'users:write', description: 'Create and update users' },
      { scope: 'users:*', description: 'Full access to user operations' },
      { scope: 'departments:read', description: 'Read department information' },
      { scope: 'departments:*', description: 'Full access to department operations' },
      { scope: 'templates:read', description: 'Read template information' },
      { scope: 'templates:write', description: 'Create and update templates' },
      { scope: 'templates:*', description: 'Full access to template operations' },
      { scope: 'assignments:read', description: 'Read assignment information' },
      { scope: 'assignments:write', description: 'Create and manage assignments' },
      { scope: 'assignments:*', description: 'Full access to assignment operations' },
      { scope: 'analytics:read', description: 'Read analytics and reports' },
      { scope: 'admin:*', description: 'Administrative operations' }
    ];
  } else {
    availableScopes = [
      { scope: 'tickets:read', description: 'Read tickets and ticket data' },
      { scope: 'tickets:write', description: 'Create and update tickets' },
      { scope: 'templates:read', description: 'Read template information' },
      { scope: 'analytics:read', description: 'Read analytics and reports' }
    ];
  }

  res.json({ scopes: availableScopes });
}));

// POST /api/tokens/cleanup - Clean up expired tokens (admin only)
router.post('/cleanup', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as any;

  if (user.role !== 'admin') {
    return next(Object.assign(new Error('Only administrators can clean up expired tokens'), { status: 403 }));
  }

  const cleanedCount = await ApiTokenService.cleanupExpiredTokens();

  res.json({ 
    message: `Cleaned up ${cleanedCount} expired tokens`,
    cleanedCount 
  });
}));

export default router;