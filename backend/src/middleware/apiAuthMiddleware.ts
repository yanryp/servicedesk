// backend/src/middleware/apiAuthMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { ApiTokenService } from '../services/apiTokenService';

interface AuthenticatedRequest extends Request {
  apiToken?: any;
  tokenScopes?: string[];
}

/**
 * Middleware for API token authentication
 * Supports both Bearer tokens and API key headers
 */
export const apiAuthMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    
    // Check Authorization header for Bearer token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
    
    // Check for API key in headers
    const apiKeyHeader = req.headers['x-api-key'] as string;
    if (!token && apiKeyHeader) {
      token = apiKeyHeader;
    }

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide a valid API token via Authorization header (Bearer token) or X-API-Key header'
      });
    }

    // Validate the token
    const validationResult = await ApiTokenService.validateToken(token);
    
    if (!validationResult.isValid || !validationResult.token) {
      return res.status(401).json({
        error: 'Invalid token',
        message: validationResult.reason || 'Token validation failed'
      });
    }

    // Attach token info to request
    req.apiToken = validationResult.token;
    req.tokenScopes = validationResult.scopes || [];

    // Log the API usage (async, don't wait)
    const startTime = Date.now();
    
    // Override res.end to capture response details
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      const responseTime = Date.now() - startTime;
      
      // Log usage asynchronously
      ApiTokenService.logUsage(
        req.apiToken.id,
        req.path,
        req.method,
        res.statusCode,
        req.ip || req.connection.remoteAddress,
        req.headers['user-agent'],
        responseTime
      ).catch(error => {
        console.error('Failed to log API usage:', error);
      });
      
      // Call original end method
      originalEnd.call(this, chunk, encoding);
    };

    next();
  } catch (error) {
    console.error('API authentication error:', error);
    return res.status(500).json({
      error: 'Authentication failed',
      message: 'Internal server error during authentication'
    });
  }
};

/**
 * Middleware factory for scope-based authorization
 * Usage: requireScope('tickets:read')
 */
export const requireScope = (requiredScope: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const tokenScopes = req.tokenScopes || [];
    
    if (!ApiTokenService.hasScope(tokenScopes, requiredScope)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This operation requires the '${requiredScope}' scope`,
        availableScopes: tokenScopes
      });
    }
    
    next();
  };
};

/**
 * Middleware to check multiple scopes (any one of them)
 * Usage: requireAnyScope(['tickets:read', 'tickets:write'])
 */
export const requireAnyScope = (requiredScopes: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const tokenScopes = req.tokenScopes || [];
    
    const hasAnyScope = requiredScopes.some(scope => 
      ApiTokenService.hasScope(tokenScopes, scope)
    );
    
    if (!hasAnyScope) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This operation requires one of the following scopes: ${requiredScopes.join(', ')}`,
        availableScopes: tokenScopes
      });
    }
    
    next();
  };
};

/**
 * Middleware to check all scopes (must have all)
 * Usage: requireAllScopes(['tickets:read', 'users:read'])
 */
export const requireAllScopes = (requiredScopes: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const tokenScopes = req.tokenScopes || [];
    
    const hasAllScopes = requiredScopes.every(scope => 
      ApiTokenService.hasScope(tokenScopes, scope)
    );
    
    if (!hasAllScopes) {
      const missingScopes = requiredScopes.filter(scope => 
        !ApiTokenService.hasScope(tokenScopes, scope)
      );
      
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This operation requires all of the following scopes: ${requiredScopes.join(', ')}`,
        missingScopes,
        availableScopes: tokenScopes
      });
    }
    
    next();
  };
};

/**
 * Rate limiting middleware for API endpoints
 * Simple in-memory rate limiter (for production, use Redis)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (maxRequests: number = 100, windowMs: number = 60000) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const tokenId = req.apiToken?.id?.toString();
    if (!tokenId) return next();

    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean up old entries
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
    
    const current = rateLimitStore.get(tokenId);
    
    if (!current || current.resetTime < now) {
      // New window
      rateLimitStore.set(tokenId, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (current.count >= maxRequests) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Maximum ${maxRequests} requests per ${windowMs / 1000} seconds`,
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      });
    }
    
    current.count++;
    next();
  };
};

export default apiAuthMiddleware;