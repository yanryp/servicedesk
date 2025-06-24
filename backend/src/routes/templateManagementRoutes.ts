// src/routes/templateManagementRoutes.ts
// Stage 5 Migration: This file contains active template management routes for administration
// These routes support template category and management functionality
// Integration: Templates created here can be used via enhancedTicketRoutes.ts UnifiedTicketService
import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';
import { protect, AuthenticatedRequest } from '../middleware/authMiddleware';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();
const prisma = new PrismaClient();

// Rate limiting for template management endpoints
const templateManagementRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 150,
  message: {
    success: false,
    message: 'Too many template management requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(templateManagementRateLimit);

/**
 * @route   GET /api/template-management/categories
 * @desc    Get template categories with hierarchy
 * @access  Protected
 */
router.get('/categories', protect, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { department, language = 'en' } = req.query;

  try {
    const whereConditions: any = {
      isActive: true,
      parentId: null // Get root categories
    };

    if (department) {
      whereConditions.OR = [
        { departmentId: parseInt(department as string) },
        { departmentId: null } // Include global categories
      ];
    }

    const categories = await prisma.templateCategory.findMany({
      where: whereConditions,
      include: {
        children: {
          where: { isActive: true },
          include: {
            children: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' }
            },
            templates: {
              where: { isActive: true },
              select: { id: true, name: true, nameIndonesian: true, estimatedTime: true, popularityScore: true }
            }
          },
          orderBy: { sortOrder: 'asc' }
        },
        templates: {
          where: { isActive: true },
          select: { id: true, name: true, nameIndonesian: true, estimatedTime: true, popularityScore: true }
        },
        department: {
          select: { id: true, name: true }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    // Localize category names based on language preference
    const localizedCategories = categories.map(category => ({
      ...category,
      displayName: language === 'id' ? category.nameIndonesian : category.name,
      children: category.children.map(child => ({
        ...child,
        displayName: language === 'id' ? child.nameIndonesian : child.name,
        children: child.children.map(grandchild => ({
          ...grandchild,
          displayName: language === 'id' ? grandchild.nameIndonesian : grandchild.name
        }))
      }))
    }));

    res.json({
      success: true,
      data: localizedCategories,
      meta: {
        count: categories.length,
        language: language,
        department: department
      }
    });
  } catch (error) {
    console.error('Template categories fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch template categories',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}));

/**
 * @route   GET /api/template-management/search
 * @desc    Search templates with advanced filtering
 * @access  Protected
 */
router.get('/search', protect, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { 
    query, 
    category, 
    department, 
    complexity, 
    tags, 
    language = 'en',
    limit = '20',
    offset = '0'
  } = req.query;

  try {
    const whereConditions: any = {
      isActive: true,
      isPublic: true
    };

    // Text search
    if (query) {
      whereConditions.OR = [
        { name: { contains: query as string, mode: 'insensitive' } },
        { nameIndonesian: { contains: query as string, mode: 'insensitive' } },
        { description: { contains: query as string, mode: 'insensitive' } },
        { searchKeywords: { contains: query as string, mode: 'insensitive' } },
        { searchKeywordsId: { contains: query as string, mode: 'insensitive' } }
      ];
    }

    // Category filter
    if (category) {
      whereConditions.categoryId = parseInt(category as string);
    }

    // Department filter
    if (department) {
      whereConditions.OR = [
        { departmentId: parseInt(department as string) },
        { departmentId: null } // Include global templates
      ];
    }

    // Complexity filter
    if (complexity) {
      whereConditions.complexity = complexity;
    }

    // Tags filter
    if (tags) {
      const tagArray = (tags as string).split(',');
      whereConditions.tags = {
        hasSome: tagArray
      };
    }

    const templates = await prisma.templateMetadata.findMany({
      where: whereConditions,
      include: {
        category: {
          select: { id: true, name: true, nameIndonesian: true }
        },
        department: {
          select: { id: true, name: true }
        },
        creator: {
          select: { id: true, username: true }
        },
        template: {
          select: { id: true, name: true }
        },
        serviceTemplate: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { popularityScore: 'desc' },
        { usageCount: 'desc' },
        { name: 'asc' }
      ],
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    // Get total count for pagination
    const totalCount = await prisma.templateMetadata.count({
      where: whereConditions
    });

    // Localize template names
    const localizedTemplates = templates.map(template => ({
      ...template,
      displayName: language === 'id' ? template.nameIndonesian : template.name,
      category: {
        ...template.category,
        displayName: language === 'id' ? template.category?.nameIndonesian : template.category?.name
      }
    }));

    res.json({
      success: true,
      data: localizedTemplates,
      meta: {
        count: templates.length,
        totalCount: totalCount,
        hasMore: (parseInt(offset as string) + templates.length) < totalCount,
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          totalPages: Math.ceil(totalCount / parseInt(limit as string))
        },
        filters: { query, category, department, complexity, tags, language }
      }
    });
  } catch (error) {
    console.error('Template search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search templates',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}));

/**
 * @route   GET /api/template-management/popular
 * @desc    Get popular templates based on usage
 * @access  Protected
 */
router.get('/popular', protect, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { department, language = 'en', limit = '10' } = req.query;

  try {
    const whereConditions: any = {
      isActive: true,
      isPublic: true
    };

    if (department) {
      whereConditions.OR = [
        { departmentId: parseInt(department as string) },
        { departmentId: null }
      ];
    }

    const popularTemplates = await prisma.templateMetadata.findMany({
      where: whereConditions,
      include: {
        category: {
          select: { id: true, name: true, nameIndonesian: true }
        },
        department: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { popularityScore: 'desc' },
        { usageCount: 'desc' }
      ],
      take: parseInt(limit as string)
    });

    const localizedTemplates = popularTemplates.map(template => ({
      ...template,
      displayName: language === 'id' ? template.nameIndonesian : template.name,
      category: {
        ...template.category,
        displayName: language === 'id' ? template.category?.nameIndonesian : template.category?.name
      }
    }));

    res.json({
      success: true,
      data: localizedTemplates,
      meta: {
        count: popularTemplates.length,
        type: 'popular',
        language: language
      }
    });
  } catch (error) {
    console.error('Popular templates fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular templates',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}));

/**
 * @route   GET /api/template-management/recent/:userId
 * @desc    Get recently used templates for a user
 * @access  Protected
 */
router.get('/recent/:userId', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { userId } = req.params;
  const { language = 'en', limit = '5' } = req.query;

  // Check authorization - users can only access their own recent templates
  if (req.user?.id !== parseInt(userId) && !['admin', 'manager'].includes(req.user?.role || '')) {
    res.status(403).json({
      success: false,
      message: 'Access denied. You can only view your own recent templates.'
    });
    return;
  }

  try {
    // Get recent template usage logs
    const recentUsage = await prisma.templateUsageLog.findMany({
      where: {
        userId: parseInt(userId),
        usageType: 'create' // Only count actual usage, not just views
      },
      include: {
        template: {
          include: {
            metadata: {
              include: {
                category: {
                  select: { id: true, name: true, nameIndonesian: true }
                }
              }
            }
          }
        },
        serviceTemplate: {
          include: {
            metadata: {
              include: {
                category: {
                  select: { id: true, name: true, nameIndonesian: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string)
    });

    // Extract unique templates (avoid duplicates)
    const uniqueTemplates = [];
    const seenTemplateIds = new Set();

    for (const usage of recentUsage) {
      const templateData = usage.template?.metadata || usage.serviceTemplate?.metadata;
      if (templateData && !seenTemplateIds.has(templateData.id)) {
        seenTemplateIds.add(templateData.id);
        uniqueTemplates.push({
          ...templateData,
          displayName: language === 'id' ? templateData.nameIndonesian : templateData.name,
          lastUsed: usage.createdAt,
          category: {
            ...templateData.category,
            displayName: language === 'id' ? templateData.category?.nameIndonesian : templateData.category?.name
          }
        });
      }
    }

    res.json({
      success: true,
      data: uniqueTemplates,
      meta: {
        count: uniqueTemplates.length,
        userId: parseInt(userId),
        type: 'recent',
        language: language
      }
    });
  } catch (error) {
    console.error('Recent templates fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent templates',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}));

/**
 * @route   POST /api/template-management/usage-log
 * @desc    Log template usage for analytics
 * @access  Protected
 */
router.post('/usage-log', protect, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const {
    templateId,
    serviceTemplateId,
    usageType,
    ticketId,
    completionTime
  } = req.body;

  try {
    const usageLog = await prisma.templateUsageLog.create({
      data: {
        templateId: templateId ? parseInt(templateId) : null,
        serviceTemplateId: serviceTemplateId ? parseInt(serviceTemplateId) : null,
        userId: req.user!.id,
        departmentId: req.user!.departmentId,
        ticketId: ticketId ? parseInt(ticketId) : null,
        usageType,
        completionTime,
        sessionId: (req.ip || 'unknown') + '-' + Date.now(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    // Update template popularity score asynchronously
    if (usageType === 'create') {
      // Increment usage count and update popularity score
      const templateMetadataId = templateId || serviceTemplateId;
      if (templateMetadataId) {
        await prisma.templateMetadata.update({
          where: {
            ...(templateId && { templateId: parseInt(templateId) }),
            ...(serviceTemplateId && { serviceTemplateId: parseInt(serviceTemplateId) })
          },
          data: {
            usageCount: { increment: 1 },
            popularityScore: { increment: 1.0 }
          }
        });
      }
    }

    res.status(201).json({
      success: true,
      data: usageLog,
      message: 'Usage logged successfully'
    });
  } catch (error) {
    console.error('Usage logging error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log template usage',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}));

export default router;