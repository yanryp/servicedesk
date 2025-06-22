// BSG Template System API Routes
import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import prisma from '../db/prisma';
import { protect, AuthenticatedRequest } from '../middleware/authMiddleware';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

// @route   GET /api/bsg-templates/categories
// @desc    Get all BSG template categories
// @access  Private
router.get('/categories', protect, asyncHandler(async (req: AuthenticatedRequest, res) => {
  try {
    const categories = await prisma.bSGTemplateCategory.findMany({
      where: {
        isActive: true
      },
      include: {
        _count: {
          select: {
            templates: {
              where: {
                isActive: true
              }
            }
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      display_name: category.displayName,
      description: category.description,
      icon: category.icon,
      template_count: category._count.templates
    }));

    res.json({
      success: true,
      data: formattedCategories
    });
  } catch (error) {
    console.error('Error fetching BSG template categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching template categories'
    });
  }
}));

// @route   GET /api/bsg-templates/templates
// @desc    Get BSG templates by category with search
// @access  Private
router.get('/templates', protect, [
  query('categoryId').optional().isInt().withMessage('Category ID must be an integer'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative')
], asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { categoryId, search, limit = 20, offset = 0 } = req.query;

  try {
    const whereConditions: any = {
      isActive: true
    };

    if (categoryId) {
      whereConditions.categoryId = parseInt(categoryId as string);
    }

    if (search) {
      whereConditions.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const templates = await prisma.bSGTemplate.findMany({
      where: whereConditions,
      include: {
        category: {
          select: {
            name: true,
            displayName: true
          }
        }
      },
      orderBy: [
        { popularityScore: 'desc' },
        { usageCount: 'desc' },
        { templateNumber: 'asc' }
      ],
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const formattedTemplates = templates.map(template => ({
      id: template.id,
      template_number: template.templateNumber,
      name: template.name,
      display_name: template.displayName,
      description: template.description,
      popularity_score: template.popularityScore,
      usage_count: template.usageCount,
      category_name: template.category.name,
      category_display_name: template.category.displayName
    }));

    res.json({
      success: true,
      data: formattedTemplates,
      total: formattedTemplates.length
    });
  } catch (error) {
    console.error('Error fetching BSG templates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching templates'
    });
  }
}));

// @route   GET /api/bsg-templates/:templateId/fields
// @desc    Get template fields and their options
// @access  Private
router.get('/:templateId/fields', protect, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const templateId = parseInt(req.params.templateId);

  try {
    // Get template fields with their types and options
    const templateFields = await prisma.bSGTemplateField.findMany({
      where: {
        templateId: templateId
      },
      include: {
        fieldType: {
          select: {
            name: true,
            displayName: true,
            htmlInputType: true,
            validationPattern: true
          }
        },
        options: {
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { id: 'asc' }
      ]
    });

    // Format fields for frontend
    const formattedFields = templateFields.map(field => ({
      id: field.id,
      fieldName: field.fieldName,
      fieldLabel: field.fieldLabel,
      fieldDescription: field.fieldDescription,
      fieldType: field.fieldType.name,
      fieldTypeDisplay: field.fieldType.displayName,
      htmlInputType: field.fieldType.htmlInputType,
      isRequired: field.isRequired,
      maxLength: field.maxLength,
      sortOrder: field.sortOrder,
      placeholderText: field.placeholderText,
      helpText: field.helpText,
      validationRules: field.validationRules,
      options: field.options.map(option => ({
        value: option.optionValue,
        label: option.optionLabel,
        isDefault: option.isDefault,
        sortOrder: option.sortOrder
      }))
    }));

    res.json({
      success: true,
      data: formattedFields
    });
  } catch (error) {
    console.error('Error fetching template fields:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching template fields'
    });
  }
}));

export default router;