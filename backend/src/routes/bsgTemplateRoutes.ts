// BSG Template System API Routes
// Stage 5 Migration: This file contains active BSG template routes that are still in use
// These routes support BSGTemplateSelector and BSGDynamicFieldRenderer components
// Integration: BSG ticket creation now flows through enhancedTicketRoutes.ts via UnifiedTicketService
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

// @route   GET /api/bsg-templates/master-data/:dataType
// @desc    Get master data for BSG template dropdown fields
// @access  Private
router.get('/master-data/:dataType', protect, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { dataType } = req.params;

  try {
    // Try BSGMasterData first
    let masterData = await prisma.bSGMasterData.findMany({
      where: {
        dataType: dataType,
        isActive: true
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    // If no BSGMasterData, try MasterDataEntity as fallback
    if (masterData.length === 0) {
      const genericMasterData = await prisma.masterDataEntity.findMany({
        where: {
          type: dataType,
          isActive: true
        },
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ]
      });

      // Transform generic master data to BSG format
      masterData = genericMasterData.map(item => ({
        id: item.id,
        dataType: item.type,
        code: item.code,
        name: item.name,
        displayName: item.nameIndonesian || item.name,
        parentId: item.parentId,
        metadata: item.metadata,
        isActive: item.isActive,
        sortOrder: item.sortOrder,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));
    }

    // If no data found in BSGMasterData or MasterDataEntity, log a warning
    if (masterData.length === 0) {
      console.log(`⚠️  No master data found for type: ${dataType}`);
      console.log('   Please ensure master data has been properly migrated to BSGMasterData table');
      console.log('   Run: node scripts/migrate-branch-data.js (for branch data)');
    }

    // Handle unit/cabang/capem data type with departments included
    if ((dataType === 'unit' || dataType === 'cabang' || dataType === 'capem' || dataType === 'branch') && masterData.length === 0) {
      console.log(`🏢 Creating combined unit data for type: ${dataType}`);
      
      // Get departments from the departments table
      const departments = await prisma.department.findMany({
        orderBy: { name: 'asc' }
      });
      
      // Get existing branch data if any
      let branchData = await prisma.bSGMasterData.findMany({
        where: {
          OR: [
            { dataType: 'branch' },
            { dataType: 'cabang' },
            { dataType: 'capem' }
          ],
          isActive: true
        },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
      });
      
      // If no BSG branch data, try generic master data
      if (branchData.length === 0) {
        const genericBranchData = await prisma.masterDataEntity.findMany({
          where: {
            OR: [
              { type: 'branch' },
              { type: 'cabang' },
              { type: 'capem' }
            ],
            isActive: true
          },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
        });
        
        branchData = genericBranchData.map(item => ({
          id: item.id,
          dataType: item.type,
          code: item.code,
          name: item.name,
          displayName: item.nameIndonesian || item.name,
          parentId: item.parentId,
          metadata: item.metadata,
          isActive: item.isActive,
          sortOrder: item.sortOrder,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }));
      }
      
      const now = new Date();
      
      // Create combined unit data with departments first, then branches
      masterData = [
        // Add departments with "Dept:" prefix
        ...departments.map((dept, index) => ({
          id: dept.id + 10000, // Offset to avoid ID conflicts
          dataType: 'unit',
          code: `DEPT_${dept.id}`,
          name: dept.name,
          displayName: `Dept: ${dept.name}`,
          parentId: null,
          metadata: { type: 'department', originalId: dept.id },
          isActive: true,
          sortOrder: index + 1,
          createdAt: now,
          updatedAt: now
        })),
        // Add existing branch data without redundant prefix (branch names already contain "CABANG")
        ...branchData.map((branch, index) => ({
          id: branch.id,
          dataType: 'unit' as string,
          code: branch.code,
          name: branch.name,
          displayName: branch.displayName || branch.name,
          parentId: branch.parentId,
          metadata: { type: 'branch', originalId: branch.id, ...((branch.metadata as object) || {}) },
          isActive: branch.isActive,
          sortOrder: departments.length + index + 1,
          createdAt: branch.createdAt,
          updatedAt: branch.updatedAt
        }))
      ];
      
      console.log(`✅ Created ${masterData.length} unit options (${departments.length} departments + ${branchData.length} branches)`);
    }

    // If no data for olibs_menu, provide default menu options
    if (masterData.length === 0 && dataType === 'olibs_menu') {
      const now = new Date();
      masterData = [
        { id: 1, dataType: 'olibs_menu', code: 'INQUIRY', name: 'Inquiry', displayName: 'Inquiry', parentId: null, isActive: true, sortOrder: 1, createdAt: now, updatedAt: now, metadata: {} },
        { id: 2, dataType: 'olibs_menu', code: 'TRANSFER', name: 'Transfer', displayName: 'Transfer', parentId: null, isActive: true, sortOrder: 2, createdAt: now, updatedAt: now, metadata: {} },
        { id: 3, dataType: 'olibs_menu', code: 'PAYMENT', name: 'Payment', displayName: 'Payment', parentId: null, isActive: true, sortOrder: 3, createdAt: now, updatedAt: now, metadata: {} },
        { id: 4, dataType: 'olibs_menu', code: 'CLEARING', name: 'Clearing', displayName: 'Clearing', parentId: null, isActive: true, sortOrder: 4, createdAt: now, updatedAt: now, metadata: {} },
        { id: 5, dataType: 'olibs_menu', code: 'REPORTS', name: 'Reports', displayName: 'Reports', parentId: null, isActive: true, sortOrder: 5, createdAt: now, updatedAt: now, metadata: {} }
      ];
    }

    // Transform to format expected by frontend
    const formattedData = masterData.map(item => ({
      value: item.code || item.id.toString(),
      label: item.displayName || item.name,
      isDefault: item.sortOrder === 1,
      sortOrder: item.sortOrder || 0
    }));

    res.json({
      success: true,
      data: formattedData,
      meta: {
        dataType: dataType,
        count: formattedData.length,
        source: masterData.length > 0 ? (masterData[0].hasOwnProperty('dataType') ? 'BSGMasterData' : 'MasterDataEntity') : 'none'
      }
    });
  } catch (error) {
    console.error(`Error fetching master data for ${dataType}:`, error);
    res.status(500).json({
      success: false,
      message: `Error fetching master data for ${dataType}`,
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}));

export default router;