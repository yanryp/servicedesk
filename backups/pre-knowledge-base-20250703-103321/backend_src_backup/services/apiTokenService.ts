// backend/src/services/apiTokenService.ts
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import prisma from '../db/prisma';

export interface CreateTokenRequest {
  name: string;
  description?: string;
  scopes: string[];
  expiresAt?: Date;
}

export interface TokenValidationResult {
  isValid: boolean;
  token?: any;
  scopes?: string[];
  reason?: string;
}

export class ApiTokenService {
  private static readonly TOKEN_LENGTH = 64;
  private static readonly TOKEN_PREFIX = 'bsg_';

  /**
   * Create a new API token
   */
  static async createToken(
    request: CreateTokenRequest,
    createdByUserId: number
  ): Promise<{ token: string; tokenRecord: any }> {
    // Generate a secure random token
    const rawToken = this.generateToken();
    const tokenHash = await bcrypt.hash(rawToken, 10);

    // Validate scopes
    const validScopes = this.getValidScopes();
    const invalidScopes = request.scopes.filter(scope => !validScopes.includes(scope));
    
    if (invalidScopes.length > 0) {
      throw new Error(`Invalid scopes: ${invalidScopes.join(', ')}`);
    }

    // Create token record
    const tokenRecord = await prisma.apiToken.create({
      data: {
        name: request.name,
        description: request.description,
        tokenHash,
        scopes: request.scopes,
        expiresAt: request.expiresAt,
        createdByUserId
      },
      include: {
        createdBy: {
          select: { id: true, username: true, email: true }
        }
      }
    });

    return { token: rawToken, tokenRecord };
  }

  /**
   * Validate an API token
   */
  static async validateToken(token: string): Promise<TokenValidationResult> {
    if (!token || !token.startsWith(this.TOKEN_PREFIX)) {
      return { isValid: false, reason: 'Invalid token format' };
    }

    // Remove prefix and find token
    const tokenWithoutPrefix = token.substring(this.TOKEN_PREFIX.length);
    
    const tokenRecords = await prisma.apiToken.findMany({
      where: { isActive: true },
      include: {
        createdBy: {
          select: { id: true, username: true }
        }
      }
    });

    for (const tokenRecord of tokenRecords) {
      try {
        const isMatch = await bcrypt.compare(tokenWithoutPrefix, tokenRecord.tokenHash);
        
        if (isMatch) {
          // Check if token is expired
          if (tokenRecord.expiresAt && new Date() > tokenRecord.expiresAt) {
            return { isValid: false, reason: 'Token has expired' };
          }

          // Update last used timestamp
          await this.updateLastUsed(tokenRecord.id);

          return {
            isValid: true,
            token: tokenRecord,
            scopes: tokenRecord.scopes
          };
        }
      } catch (error) {
        console.error('Token validation error:', error);
        continue;
      }
    }

    return { isValid: false, reason: 'Token not found or invalid' };
  }

  /**
   * Check if token has required scope
   */
  static hasScope(tokenScopes: string[], requiredScope: string): boolean {
    // Check for exact match or wildcard
    return tokenScopes.includes(requiredScope) || 
           tokenScopes.includes('*') ||
           tokenScopes.some(scope => {
             // Support pattern matching like 'tickets:*'
             if (scope.endsWith(':*')) {
               const prefix = scope.slice(0, -2);
               return requiredScope.startsWith(prefix + ':');
             }
             return false;
           });
  }

  /**
   * Revoke a token
   */
  static async revokeToken(tokenId: number, revokedByUserId: number): Promise<void> {
    await prisma.apiToken.update({
      where: { id: tokenId },
      data: { isActive: false }
    });
  }

  /**
   * List tokens for a user
   */
  static async getUserTokens(userId: number) {
    return await prisma.apiToken.findMany({
      where: { createdByUserId: userId },
      select: {
        id: true,
        name: true,
        description: true,
        scopes: true,
        isActive: true,
        expiresAt: true,
        lastUsedAt: true,
        usageCount: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get all tokens (admin only)
   */
  static async getAllTokens() {
    return await prisma.apiToken.findMany({
      include: {
        createdBy: {
          select: { id: true, username: true, email: true }
        },
        _count: {
          select: { usageLogs: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Log token usage
   */
  static async logUsage(
    tokenId: number,
    endpoint: string,
    method: string,
    statusCode: number,
    ipAddress?: string,
    userAgent?: string,
    responseTime?: number
  ): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Log the usage
        await tx.apiTokenUsageLog.create({
          data: {
            tokenId,
            endpoint,
            method,
            statusCode,
            ipAddress,
            userAgent,
            responseTime
          }
        });

        // Update usage count
        await tx.apiToken.update({
          where: { id: tokenId },
          data: {
            usageCount: { increment: 1 }
          }
        });
      });
    } catch (error) {
      console.error('Failed to log API token usage:', error);
      // Don't throw - logging failure shouldn't break the API call
    }
  }

  /**
   * Get usage analytics for a token
   */
  static async getTokenAnalytics(tokenId: number, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [usageLogs, totalUsage, recentUsage] = await Promise.all([
      prisma.apiTokenUsageLog.findMany({
        where: {
          tokenId,
          createdAt: { gte: startDate }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      }),
      prisma.apiTokenUsageLog.count({
        where: { tokenId }
      }),
      prisma.apiTokenUsageLog.count({
        where: {
          tokenId,
          createdAt: { gte: startDate }
        }
      })
    ]);

    // Calculate success rate
    const successfulRequests = usageLogs.filter(log => log.statusCode < 400).length;
    const successRate = usageLogs.length > 0 ? (successfulRequests / usageLogs.length) * 100 : 0;

    // Calculate average response time
    const responseTimes = usageLogs.filter(log => log.responseTime).map(log => log.responseTime!);
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    return {
      totalUsage,
      recentUsage,
      successRate: Math.round(successRate * 100) / 100,
      avgResponseTime: Math.round(avgResponseTime),
      recentLogs: usageLogs
    };
  }

  /**
   * Generate a secure token
   */
  private static generateToken(): string {
    const randomBytes = crypto.randomBytes(this.TOKEN_LENGTH);
    return this.TOKEN_PREFIX + randomBytes.toString('hex');
  }

  /**
   * Update last used timestamp
   */
  private static async updateLastUsed(tokenId: number): Promise<void> {
    await prisma.apiToken.update({
      where: { id: tokenId },
      data: { lastUsedAt: new Date() }
    });
  }

  /**
   * Get valid scopes
   */
  private static getValidScopes(): string[] {
    return [
      // Wildcard
      '*',
      
      // Ticket operations
      'tickets:read',
      'tickets:write',
      'tickets:delete',
      'tickets:*',
      
      // User operations
      'users:read',
      'users:write',
      'users:*',
      
      // Department operations
      'departments:read',
      'departments:*',
      
      // Template operations
      'templates:read',
      'templates:write',
      'templates:*',
      
      // Assignment operations
      'assignments:read',
      'assignments:write',
      'assignments:*',
      
      // Analytics
      'analytics:read',
      
      // Admin operations
      'admin:*'
    ];
  }

  /**
   * Clean up expired tokens
   */
  static async cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.apiToken.updateMany({
      where: {
        isActive: true,
        expiresAt: {
          lt: new Date()
        }
      },
      data: {
        isActive: false
      }
    });

    return result.count;
  }
}

export default ApiTokenService;