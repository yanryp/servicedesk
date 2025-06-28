// Service Catalog Administration Routes - Simplified Version  
// Provides CRUD operations for ServiceCatalog viewing and basic management
import express, { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, AuthenticatedRequest } from '../middleware/authMiddleware';
import asyncHandler from '../utils/asyncHandler';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();
const prisma = new PrismaClient();

// Rate limiting for admin endpoints
const adminRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // More restrictive for admin operations
  message: {
    success: false,
    message: 'Too many admin requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(adminRateLimit);

// Authorization middleware - only admin and manager roles
const requireAdminAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const user = req.user;
  
  if (!user || !['admin', 'manager'].includes(user.role)) {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Manager role required.'
    });
    return;
  }
  
  next();
};

// ===== SERVICE CATALOG MANAGEMENT =====

/**
 * @route   GET /api/service-catalog-admin/catalogs
 * @desc    Get all service catalogs with statistics
 * @access  Admin/Manager
 */
router.get('/catalogs', protect, requireAdminAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const catalogs = await prisma.serviceCatalog.findMany({
      include: {
        department: {
          select: { id: true, name: true }
        },
        serviceItems: {
          include: {
            customFieldDefinitions: true,
            templates: {
              include: {
                customFieldDefinitions: true
              }
            }
          }
        }
      },
      orderBy: [
        { name: 'asc' }
      ]
    });

    // Add statistics to each catalog - using ServiceTemplate custom fields (the working system)
    const catalogsWithStats = catalogs.map(catalog => {
      // Count custom fields from ServiceTemplates (where they actually exist)
      const totalTemplateFields = catalog.serviceItems.reduce((sum: number, item: any) => {
        return sum + (item.templates?.reduce((templateSum: number, template: any) => 
          templateSum + (template.customFieldDefinitions?.length || 0), 0) || 0);
      }, 0);
      
      const templatesWithFields = catalog.serviceItems.reduce((sum: number, item: any) => {
        return sum + (item.templates?.filter((template: any) => 
          (template.customFieldDefinitions?.length || 0) > 0).length || 0);
      }, 0);
      
      const totalTemplates = catalog.serviceItems.reduce((sum: number, item: any) => 
        sum + (item.templates?.length || 0), 0);
      
      console.log(`✅ Catalog ${catalog.name}: ${totalTemplateFields} fields in ${templatesWithFields} templates`);
      
      return {
        ...catalog,
        statistics: {
          serviceItemCount: catalog.serviceItems.length,
          templateCount: totalTemplates,
          customFieldCount: totalTemplateFields,
          templatesWithFields: templatesWithFields
        }
      };
    });

    res.json({
      success: true,
      data: catalogsWithStats,
      meta: {
        totalCatalogs: catalogs.length,
        totalServiceItems: catalogs.reduce((sum: number, c: any) => sum + c.serviceItems.length, 0),
        totalCustomFields: catalogsWithStats.reduce((sum: number, c: any) => sum + c.statistics.customFieldCount, 0),
        totalTemplates: catalogsWithStats.reduce((sum: number, c: any) => sum + c.statistics.templateCount, 0),
        templatesWithFields: catalogsWithStats.reduce((sum: number, c: any) => sum + c.statistics.templatesWithFields, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching service catalogs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service catalogs'
    });
  }
}));

/**
 * @route   GET /api/service-catalog-admin/catalogs/:catalogId/items
 * @desc    Get all service items in a catalog
 * @access  Admin/Manager
 */
router.get('/catalogs/:catalogId/items', protect, requireAdminAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { catalogId } = req.params;

    const serviceItems = await prisma.serviceItem.findMany({
      where: { serviceCatalogId: parseInt(catalogId) },
      include: {
        serviceCatalog: {
          select: { id: true, name: true }
        },
        customFieldDefinitions: true,
        templates: true // Keep for backward compatibility
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    // Add statistics to each service item - focus on custom fields
    const itemsWithStats = serviceItems.map(item => ({
      ...item,
      statistics: {
        customFieldCount: item.customFieldDefinitions.length,
        hasCustomFields: item.customFieldDefinitions.length > 0,
        templateCount: item.templates.length, // Legacy data for reference
        totalFields: item.customFieldDefinitions.length
      }
    }));

    res.json({
      success: true,
      data: itemsWithStats,
      meta: {
        catalogId: parseInt(catalogId),
        totalItems: serviceItems.length,
        totalTemplates: serviceItems.reduce((sum: number, item: any) => sum + item.templates.length, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching service items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service items'
    });
  }
}));

/**
 * @route   GET /api/service-catalog-admin/items/:itemId/templates
 * @desc    Get all templates in a service item
 * @access  Admin/Manager
 */
router.get('/items/:itemId/templates', protect, requireAdminAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId } = req.params;

    const templates = await prisma.serviceTemplate.findMany({
      where: { serviceItemId: parseInt(itemId) },
      include: {
        serviceItem: {
          include: {
            serviceCatalog: {
              select: { id: true, name: true }
            }
          }
        },
        customFieldDefinitions: {
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: templates,
      meta: {
        serviceItemId: parseInt(itemId),
        totalTemplates: templates.length,
        visibleTemplates: templates.filter(t => t.isVisible).length,
        totalFields: templates.reduce((sum: number, template: any) => sum + template.customFieldDefinitions.length, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching service templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service templates'
    });
  }
}));

/**
 * @route   GET /api/service-catalog-admin/templates/:templateId/fields
 * @desc    Get all custom field definitions for a template
 * @access  Admin/Manager
 */
router.get('/templates/:templateId/fields', protect, requireAdminAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { templateId } = req.params;

    const fields = await prisma.serviceFieldDefinition.findMany({
      where: { serviceTemplateId: parseInt(templateId) },
      include: {
        serviceTemplate: {
          select: { id: true, name: true }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({
      success: true,
      data: fields,
      meta: {
        templateId: parseInt(templateId),
        totalFields: fields.length,
        requiredFields: fields.filter(f => f.isRequired).length
      }
    });
  } catch (error) {
    console.error('Error fetching custom field definitions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch custom field definitions'
    });
  }
}));

/**
 * @route   GET /api/service-catalog-admin/overview
 * @desc    Get comprehensive overview and statistics
 * @access  Admin/Manager
 */
router.get('/overview', protect, requireAdminAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get counts
    const [catalogCount, serviceItemCount, templateCount, visibleTemplateCount, fieldCount] = await Promise.all([
      prisma.serviceCatalog.count({ where: { isActive: true } }),
      prisma.serviceItem.count({ where: { isActive: true } }),
      prisma.serviceTemplate.count(),
      prisma.serviceTemplate.count({ where: { isVisible: true } }),
      prisma.serviceFieldDefinition.count()
    ]);

    // Get department breakdown
    const departmentStats = await prisma.serviceCatalog.groupBy({
      by: ['departmentId'],
      _count: {
        id: true
      },
      where: { isActive: true }
    });

    // Get template visibility breakdown
    const templateStats = await prisma.serviceTemplate.groupBy({
      by: ['isVisible'],
      _count: {
        id: true
      }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalCatalogs: catalogCount,
          totalServiceItems: serviceItemCount,
          totalTemplates: templateCount,
          visibleTemplates: visibleTemplateCount,
          totalFields: fieldCount
        },
        departmentStats,
        templateStats
      }
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overview data'
    });
  }
}));

// ===== SERVICE CATALOG CRUD OPERATIONS =====

/**
 * @route   POST /api/service-catalog-admin/catalogs
 * @desc    Create a new service catalog
 * @access  Admin/Manager
 */
router.post('/catalogs', protect, requireAdminAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, departmentId, isActive = true } = req.body;

    // Basic validation
    if (!name || name.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Service catalog name is required'
      });
      return;
    }

    // Check for duplicate names
    const existingCatalog = await prisma.serviceCatalog.findFirst({
      where: { 
        name: name.trim(),
        departmentId: departmentId || null
      }
    });

    if (existingCatalog) {
      res.status(400).json({
        success: false,
        message: 'A service catalog with this name already exists in the specified department'
      });
      return;
    }

    // Validate department - required field
    if (!departmentId) {
      res.status(400).json({
        success: false,
        message: 'Department ID is required'
      });
      return;
    }

    const department = await prisma.department.findUnique({
      where: { id: parseInt(departmentId) }
    });

    if (!department) {
      res.status(400).json({
        success: false,
        message: 'Invalid department ID'
      });
      return;
    }

    // Create the service catalog
    const newCatalog = await prisma.serviceCatalog.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        departmentId: parseInt(departmentId),
        isActive: Boolean(isActive)
      },
      include: {
        department: {
          select: { id: true, name: true }
        },
        serviceItems: true
      }
    });

    // Add statistics
    const catalogWithStats = {
      ...newCatalog,
      statistics: {
        serviceItemCount: newCatalog.serviceItems.length,
        templateCount: 0,
        visibleTemplateCount: 0
      }
    };

    res.status(201).json({
      success: true,
      data: catalogWithStats,
      message: 'Service catalog created successfully'
    });
  } catch (error) {
    console.error('Error creating service catalog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service catalog'
    });
  }
}));

/**
 * @route   PUT /api/service-catalog-admin/catalogs/:catalogId
 * @desc    Update a service catalog
 * @access  Admin/Manager
 */
router.put('/catalogs/:catalogId', protect, requireAdminAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { catalogId } = req.params;
    const { name, description, departmentId, isActive } = req.body;

    // Basic validation - only validate name if it's provided (partial updates allowed)
    if (name !== undefined && (!name || name.trim().length === 0)) {
      res.status(400).json({
        success: false,
        message: 'Service catalog name cannot be empty'
      });
      return;
    }

    // Check if catalog exists
    const existingCatalog = await prisma.serviceCatalog.findUnique({
      where: { id: parseInt(catalogId) }
    });

    if (!existingCatalog) {
      res.status(404).json({
        success: false,
        message: 'Service catalog not found'
      });
      return;
    }

    // Check for duplicate names only if name is being updated
    if (name !== undefined) {
      const duplicateCatalog = await prisma.serviceCatalog.findFirst({
        where: { 
          name: name.trim(),
          departmentId: departmentId || existingCatalog.departmentId,
          id: { not: parseInt(catalogId) }
        }
      });

      if (duplicateCatalog) {
        res.status(400).json({
          success: false,
          message: 'A service catalog with this name already exists in the specified department'
        });
        return;
      }
    }

    // Validate department if provided
    if (departmentId !== undefined && !departmentId) {
      res.status(400).json({
        success: false,
        message: 'Department ID is required'
      });
      return;
    }

    // Validate department if departmentId is being updated
    if (departmentId !== undefined) {
      const department = await prisma.department.findUnique({
        where: { id: parseInt(departmentId) }
      });

      if (!department) {
        res.status(400).json({
          success: false,
          message: 'Invalid department ID'
        });
        return;
      }
    }

    // Build update data object with only provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (departmentId !== undefined) updateData.departmentId = parseInt(departmentId);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    // Update the service catalog
    const updatedCatalog = await prisma.serviceCatalog.update({
      where: { id: parseInt(catalogId) },
      data: updateData,
      include: {
        department: {
          select: { id: true, name: true }
        },
        serviceItems: true
      }
    });

    // Add statistics
    const catalogWithStats = {
      ...updatedCatalog,
      statistics: {
        serviceItemCount: updatedCatalog.serviceItems.length,
        templateCount: 0, // Will be calculated when ServiceItem templates are available
        visibleTemplateCount: 0
      }
    };

    res.json({
      success: true,
      data: catalogWithStats,
      message: 'Service catalog updated successfully'
    });
  } catch (error) {
    console.error('Error updating service catalog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service catalog',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * @route   DELETE /api/service-catalog-admin/catalogs/:catalogId
 * @desc    Delete a service catalog
 * @access  Admin/Manager
 */
router.delete('/catalogs/:catalogId', protect, requireAdminAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { catalogId } = req.params;

    // Check if catalog exists
    const existingCatalog = await prisma.serviceCatalog.findUnique({
      where: { id: parseInt(catalogId) }
    });

    if (!existingCatalog) {
      res.status(404).json({
        success: false,
        message: 'Service catalog not found'
      });
      return;
    }

    // Get service items count
    const serviceItemsCount = await prisma.serviceItem.count({
      where: { serviceCatalogId: parseInt(catalogId) }
    });

    // Check if catalog has service items
    if (serviceItemsCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete service catalog "${existingCatalog.name}". It contains ${serviceItemsCount} service item(s). Please delete or move all service items first.`
      });
      return;
    }

    // Delete the service catalog
    await prisma.serviceCatalog.delete({
      where: { id: parseInt(catalogId) }
    });

    res.json({
      success: true,
      message: `Service catalog "${existingCatalog.name}" deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting service catalog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service catalog'
    });
  }
}));

// ===== SERVICE ITEM CRUD OPERATIONS =====

/**
 * @route   POST /api/service-catalog-admin/catalogs/:catalogId/items
 * @desc    Create a new service item in a catalog
 * @access  Admin/Manager
 */
router.post('/catalogs/:catalogId/items', protect, requireAdminAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { catalogId } = req.params;
    const { name, description, requestType = 'service_request', isKasdaRelated = false, requiresGovApproval = false, isActive = true, sortOrder = 0 } = req.body;

    // Basic validation
    if (!name || name.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Service item name is required'
      });
      return;
    }

    // Check if catalog exists
    const catalog = await prisma.serviceCatalog.findUnique({
      where: { id: parseInt(catalogId) }
    });

    if (!catalog) {
      res.status(404).json({
        success: false,
        message: 'Service catalog not found'
      });
      return;
    }

    // Check for duplicate names within the catalog
    const existingItem = await prisma.serviceItem.findFirst({
      where: { 
        serviceCatalogId: parseInt(catalogId),
        name: name.trim()
      }
    });

    if (existingItem) {
      res.status(400).json({
        success: false,
        message: 'A service item with this name already exists in this catalog'
      });
      return;
    }

    // Create the service item
    const newItem = await prisma.serviceItem.create({
      data: {
        serviceCatalogId: parseInt(catalogId),
        name: name.trim(),
        description: description?.trim() || null,
        requestType: requestType,
        isKasdaRelated: Boolean(isKasdaRelated),
        requiresGovApproval: Boolean(requiresGovApproval),
        isActive: Boolean(isActive),
        sortOrder: parseInt(sortOrder) || 0
      },
      include: {
        serviceCatalog: {
          select: { id: true, name: true }
        },
        templates: true
      }
    });

    // Add statistics
    const itemWithStats = {
      ...newItem,
      statistics: {
        templateCount: newItem.templates.length,
        visibleTemplateCount: newItem.templates.filter(t => t.isVisible).length,
        totalFields: 0
      }
    };

    res.status(201).json({
      success: true,
      data: itemWithStats,
      message: 'Service item created successfully'
    });
  } catch (error) {
    console.error('Error creating service item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service item'
    });
  }
}));

/**
 * @route   PUT /api/service-catalog-admin/items/:itemId
 * @desc    Update a service item
 * @access  Admin/Manager
 */
router.put('/items/:itemId', protect, requireAdminAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    const { name, description, requestType, isKasdaRelated, requiresGovApproval, isActive, sortOrder } = req.body;

    // Basic validation - only validate name if it's provided (partial updates allowed)
    if (name !== undefined && (!name || name.trim().length === 0)) {
      res.status(400).json({
        success: false,
        message: 'Service item name cannot be empty'
      });
      return;
    }

    // Check if item exists
    const existingItem = await prisma.serviceItem.findUnique({
      where: { id: parseInt(itemId) }
    });

    if (!existingItem) {
      res.status(404).json({
        success: false,
        message: 'Service item not found'
      });
      return;
    }

    // Check for duplicate names only if name is being updated
    if (name !== undefined) {
      const duplicateItem = await prisma.serviceItem.findFirst({
        where: { 
          serviceCatalogId: existingItem.serviceCatalogId,
          name: name.trim(),
          id: { not: parseInt(itemId) }
        }
      });

      if (duplicateItem) {
        res.status(400).json({
          success: false,
          message: 'A service item with this name already exists in this catalog'
        });
        return;
      }
    }

    // Update the service item
    // Build update data object with only provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name?.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (requestType !== undefined) updateData.requestType = requestType;
    if (isKasdaRelated !== undefined) updateData.isKasdaRelated = Boolean(isKasdaRelated);
    if (requiresGovApproval !== undefined) updateData.requiresGovApproval = Boolean(requiresGovApproval);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder.toString());

    const updatedItem = await prisma.serviceItem.update({
      where: { id: parseInt(itemId) },
      data: updateData,
      include: {
        serviceCatalog: {
          select: { id: true, name: true }
        },
        templates: true
      }
    });

    // Add statistics
    const itemWithStats = {
      ...updatedItem,
      statistics: {
        templateCount: updatedItem.templates.length,
        visibleTemplateCount: updatedItem.templates.filter(t => t.isVisible).length,
        totalFields: 0
      }
    };

    res.json({
      success: true,
      data: itemWithStats,
      message: 'Service item updated successfully'
    });
  } catch (error) {
    console.error('Error updating service item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * @route   DELETE /api/service-catalog-admin/items/:itemId
 * @desc    Delete a service item
 * @access  Admin/Manager
 */
router.delete('/items/:itemId', protect, requireAdminAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId } = req.params;

    // Check if item exists
    const existingItem = await prisma.serviceItem.findUnique({
      where: { id: parseInt(itemId) }
    });

    if (!existingItem) {
      res.status(404).json({
        success: false,
        message: 'Service item not found'
      });
      return;
    }

    // Get templates count
    const templatesCount = await prisma.serviceTemplate.count({
      where: { serviceItemId: parseInt(itemId) }
    });

    // Check if item has templates
    if (templatesCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete service item "${existingItem.name}". It contains ${templatesCount} template(s). Please delete all templates first.`
      });
      return;
    }

    // Delete the service item
    await prisma.serviceItem.delete({
      where: { id: parseInt(itemId) }
    });

    res.json({
      success: true,
      message: `Service item "${existingItem.name}" deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting service item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service item'
    });
  }
}));

// ===== SERVICE TEMPLATE CRUD OPERATIONS =====

/**
 * @route   POST /api/service-catalog-admin/items/:itemId/templates
 * @desc    Create a new service template in a service item
 * @access  Admin/Manager
 */
router.post('/items/:itemId/templates', protect, requireAdminAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    const { 
      name, 
      description, 
      templateType = 'standard', 
      isKasdaTemplate = false, 
      requiresBusinessApproval = false, 
      isVisible = true, 
      sortOrder = 0,
      estimatedResolutionTime,
      defaultRootCause,
      defaultIssueType
    } = req.body;

    // Basic validation
    if (!name || name.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Service template name is required'
      });
      return;
    }

    // Check if service item exists
    const serviceItem = await prisma.serviceItem.findUnique({
      where: { id: parseInt(itemId) }
    });

    if (!serviceItem) {
      res.status(404).json({
        success: false,
        message: 'Service item not found'
      });
      return;
    }

    // Check for duplicate names within the service item
    const existingTemplate = await prisma.serviceTemplate.findFirst({
      where: { 
        serviceItemId: parseInt(itemId),
        name: name.trim()
      }
    });

    if (existingTemplate) {
      res.status(400).json({
        success: false,
        message: 'A service template with this name already exists in this service item'
      });
      return;
    }

    // Create the service template
    const newTemplate = await prisma.serviceTemplate.create({
      data: {
        serviceItemId: parseInt(itemId),
        name: name.trim(),
        description: description?.trim() || null,
        templateType: templateType,
        isKasdaTemplate: Boolean(isKasdaTemplate),
        requiresBusinessApproval: Boolean(requiresBusinessApproval),
        isVisible: Boolean(isVisible),
        sortOrder: parseInt(sortOrder) || 0,
        estimatedResolutionTime: estimatedResolutionTime ? parseInt(estimatedResolutionTime) : null,
        defaultRootCause: defaultRootCause || null,
        defaultIssueType: defaultIssueType || null
      },
      include: {
        serviceItem: {
          include: {
            serviceCatalog: {
              select: { id: true, name: true }
            }
          }
        },
        customFieldDefinitions: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: newTemplate,
      message: 'Service template created successfully'
    });
  } catch (error) {
    console.error('Error creating service template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service template'
    });
  }
}));

/**
 * @route   PUT /api/service-catalog-admin/templates/:templateId
 * @desc    Update a service template
 * @access  Admin/Manager
 */
router.put('/templates/:templateId', protect, requireAdminAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { templateId } = req.params;
    const { 
      name, 
      description, 
      templateType, 
      isKasdaTemplate, 
      requiresBusinessApproval, 
      isVisible, 
      sortOrder,
      estimatedResolutionTime,
      defaultRootCause,
      defaultIssueType
    } = req.body;

    // Basic validation
    if (!name || name.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Service template name is required'
      });
      return;
    }

    // Check if template exists
    const existingTemplate = await prisma.serviceTemplate.findUnique({
      where: { id: parseInt(templateId) }
    });

    if (!existingTemplate) {
      res.status(404).json({
        success: false,
        message: 'Service template not found'
      });
      return;
    }

    // Check for duplicate names within the service item (excluding current template)
    const duplicateTemplate = await prisma.serviceTemplate.findFirst({
      where: { 
        serviceItemId: existingTemplate.serviceItemId,
        name: name.trim(),
        id: { not: parseInt(templateId) }
      }
    });

    if (duplicateTemplate) {
      res.status(400).json({
        success: false,
        message: 'A service template with this name already exists in this service item'
      });
      return;
    }

    // Update the service template
    const updatedTemplate = await prisma.serviceTemplate.update({
      where: { id: parseInt(templateId) },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        templateType: templateType || existingTemplate.templateType,
        isKasdaTemplate: isKasdaTemplate !== undefined ? Boolean(isKasdaTemplate) : existingTemplate.isKasdaTemplate,
        requiresBusinessApproval: requiresBusinessApproval !== undefined ? Boolean(requiresBusinessApproval) : existingTemplate.requiresBusinessApproval,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : existingTemplate.isVisible,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : existingTemplate.sortOrder,
        estimatedResolutionTime: estimatedResolutionTime !== undefined ? (estimatedResolutionTime ? parseInt(estimatedResolutionTime) : null) : existingTemplate.estimatedResolutionTime,
        defaultRootCause: defaultRootCause !== undefined ? defaultRootCause : existingTemplate.defaultRootCause,
        defaultIssueType: defaultIssueType !== undefined ? defaultIssueType : existingTemplate.defaultIssueType
      },
      include: {
        serviceItem: {
          include: {
            serviceCatalog: {
              select: { id: true, name: true }
            }
          }
        },
        customFieldDefinitions: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    res.json({
      success: true,
      data: updatedTemplate,
      message: 'Service template updated successfully'
    });
  } catch (error) {
    console.error('Error updating service template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service template'
    });
  }
}));

/**
 * @route   DELETE /api/service-catalog-admin/templates/:templateId
 * @desc    Delete a service template
 * @access  Admin/Manager
 */
router.delete('/templates/:templateId', protect, requireAdminAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { templateId } = req.params;

    // Check if template exists
    const existingTemplate = await prisma.serviceTemplate.findUnique({
      where: { id: parseInt(templateId) }
    });

    if (!existingTemplate) {
      res.status(404).json({
        success: false,
        message: 'Service template not found'
      });
      return;
    }

    // Get custom field definitions count
    const fieldsCount = await prisma.serviceFieldDefinition.count({
      where: { serviceTemplateId: parseInt(templateId) }
    });

    // Check if template has custom fields
    if (fieldsCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete service template "${existingTemplate.name}". It contains ${fieldsCount} custom field(s). Please delete all custom fields first.`
      });
      return;
    }

    // Delete the service template
    await prisma.serviceTemplate.delete({
      where: { id: parseInt(templateId) }
    });

    res.json({
      success: true,
      message: `Service template "${existingTemplate.name}" deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting service template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service template'
    });
  }
}));

// ===== CUSTOM FIELD DEFINITION CRUD OPERATIONS =====

/**
 * @route   POST /api/service-catalog-admin/templates/:templateId/fields
 * @desc    Create a new custom field definition in a service template
 * @access  Admin/Manager
 */
router.post('/templates/:templateId/fields', protect, requireAdminAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { templateId } = req.params;
    const { 
      fieldName,
      fieldLabel,
      fieldType,
      isRequired = false,
      isVisible = true,
      sortOrder = 0,
      defaultValue,
      options,
      validationRules,
      placeholder,
      isKasdaSpecific = false
    } = req.body;

    // Basic validation
    if (!fieldName || fieldName.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Field name is required'
      });
      return;
    }

    if (!fieldLabel || fieldLabel.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Field label is required'
      });
      return;
    }

    if (!fieldType || fieldType.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Field type is required'
      });
      return;
    }

    // Check if service template exists
    const serviceTemplate = await prisma.serviceTemplate.findUnique({
      where: { id: parseInt(templateId) }
    });

    if (!serviceTemplate) {
      res.status(404).json({
        success: false,
        message: 'Service template not found'
      });
      return;
    }

    // Check for duplicate field names within the template
    const existingField = await prisma.serviceFieldDefinition.findFirst({
      where: { 
        serviceTemplateId: parseInt(templateId),
        fieldName: fieldName.trim()
      }
    });

    if (existingField) {
      res.status(400).json({
        success: false,
        message: 'A field with this name already exists in this template'
      });
      return;
    }

    // Create the custom field definition
    const newField = await prisma.serviceFieldDefinition.create({
      data: {
        serviceTemplateId: parseInt(templateId),
        fieldName: fieldName.trim(),
        fieldLabel: fieldLabel.trim(),
        fieldType: fieldType,
        isRequired: Boolean(isRequired),
        isVisible: Boolean(isVisible),
        sortOrder: parseInt(sortOrder) || 0,
        defaultValue: defaultValue || null,
        options: options || null,
        validationRules: validationRules || null,
        placeholder: placeholder?.trim() || null,
        isKasdaSpecific: Boolean(isKasdaSpecific)
      },
      include: {
        serviceTemplate: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: newField,
      message: 'Custom field definition created successfully'
    });
  } catch (error) {
    console.error('Error creating custom field definition:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create custom field definition'
    });
  }
}));

/**
 * @route   PUT /api/service-catalog-admin/fields/:fieldId
 * @desc    Update a custom field definition
 * @access  Admin/Manager
 */
router.put('/fields/:fieldId', protect, requireAdminAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fieldId } = req.params;
    const { 
      fieldName,
      fieldLabel,
      fieldType,
      isRequired,
      isVisible,
      sortOrder,
      defaultValue,
      options,
      validationRules,
      placeholder,
      isKasdaSpecific
    } = req.body;

    // Basic validation
    if (!fieldName || fieldName.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Field name is required'
      });
      return;
    }

    if (!fieldLabel || fieldLabel.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Field label is required'
      });
      return;
    }

    if (!fieldType || fieldType.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Field type is required'
      });
      return;
    }

    // Check if field exists
    const existingField = await prisma.serviceFieldDefinition.findUnique({
      where: { id: parseInt(fieldId) }
    });

    if (!existingField) {
      res.status(404).json({
        success: false,
        message: 'Custom field definition not found'
      });
      return;
    }

    // Check for duplicate field names within the template (excluding current field)
    const duplicateField = await prisma.serviceFieldDefinition.findFirst({
      where: { 
        serviceTemplateId: existingField.serviceTemplateId,
        fieldName: fieldName.trim(),
        id: { not: parseInt(fieldId) }
      }
    });

    if (duplicateField) {
      res.status(400).json({
        success: false,
        message: 'A field with this name already exists in this template'
      });
      return;
    }

    // Update the custom field definition
    const updatedField = await prisma.serviceFieldDefinition.update({
      where: { id: parseInt(fieldId) },
      data: {
        fieldName: fieldName.trim(),
        fieldLabel: fieldLabel.trim(),
        fieldType: fieldType,
        isRequired: isRequired !== undefined ? Boolean(isRequired) : existingField.isRequired,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : existingField.isVisible,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : existingField.sortOrder,
        defaultValue: defaultValue !== undefined ? defaultValue : existingField.defaultValue,
        options: options !== undefined ? options : existingField.options,
        validationRules: validationRules !== undefined ? validationRules : existingField.validationRules,
        placeholder: placeholder !== undefined ? (placeholder?.trim() || null) : existingField.placeholder,
        isKasdaSpecific: isKasdaSpecific !== undefined ? Boolean(isKasdaSpecific) : existingField.isKasdaSpecific
      },
      include: {
        serviceTemplate: {
          select: { id: true, name: true }
        }
      }
    });

    res.json({
      success: true,
      data: updatedField,
      message: 'Custom field definition updated successfully'
    });
  } catch (error) {
    console.error('Error updating custom field definition:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update custom field definition'
    });
  }
}));

/**
 * @route   DELETE /api/service-catalog-admin/fields/:fieldId
 * @desc    Delete a custom field definition
 * @access  Admin/Manager
 */
router.delete('/fields/:fieldId', protect, requireAdminAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fieldId } = req.params;

    // Check if field exists
    const existingField = await prisma.serviceFieldDefinition.findUnique({
      where: { id: parseInt(fieldId) }
    });

    if (!existingField) {
      res.status(404).json({
        success: false,
        message: 'Custom field definition not found'
      });
      return;
    }

    // Delete the custom field definition
    await prisma.serviceFieldDefinition.delete({
      where: { id: parseInt(fieldId) }
    });

    res.json({
      success: true,
      message: `Custom field "${existingField.fieldLabel}" deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting custom field definition:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete custom field definition'
    });
  }
}));

// ===== SERVICE ITEM CUSTOM FIELDS MANAGEMENT =====

/**
 * @route   GET /api/service-catalog-admin/items/:itemId/custom-fields
 * @desc    Get all custom fields for a service item
 * @access  Admin/Manager
 */
router.get('/items/:itemId/custom-fields', protect, requireAdminAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId } = req.params;

    // Check if service item exists
    const serviceItem = await prisma.serviceItem.findUnique({
      where: { id: parseInt(itemId) },
      select: { id: true, name: true, serviceCatalogId: true }
    });

    if (!serviceItem) {
      res.status(404).json({
        success: false,
        message: 'Service item not found'
      });
      return;
    }

    const fields = await prisma.serviceFieldDefinition.findMany({
      where: { serviceItemId: parseInt(itemId) },
      orderBy: [
        { sortOrder: 'asc' },
        { fieldName: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: fields,
      meta: {
        totalFields: fields.length,
        requiredFields: fields.filter(f => f.isRequired).length,
        visibleFields: fields.filter(f => f.isVisible).length,
        serviceItem: serviceItem
      }
    });
  } catch (error) {
    console.error('Error fetching service item custom fields:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch custom fields'
    });
  }
}));

/**
 * @route   POST /api/service-catalog-admin/items/:itemId/custom-fields
 * @desc    Create a new custom field for a service item
 * @access  Admin/Manager
 */
router.post('/items/:itemId/custom-fields', protect, requireAdminAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    const { 
      fieldName, 
      fieldLabel, 
      fieldType, 
      isRequired = false, 
      isVisible = true, 
      sortOrder = 0, 
      placeholder, 
      defaultValue, 
      options, 
      validationRules, 
      isKasdaSpecific = false 
    } = req.body;

    // Basic validation
    if (!fieldName || fieldName.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Field name is required'
      });
      return;
    }

    if (!fieldLabel || fieldLabel.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Field label is required'
      });
      return;
    }

    if (!fieldType || fieldType.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Field type is required'
      });
      return;
    }

    // Check if service item exists
    const serviceItem = await prisma.serviceItem.findUnique({
      where: { id: parseInt(itemId) }
    });

    if (!serviceItem) {
      res.status(404).json({
        success: false,
        message: 'Service item not found'
      });
      return;
    }

    // Check for duplicate field names within the service item
    const existingField = await prisma.serviceFieldDefinition.findFirst({
      where: { 
        serviceItemId: parseInt(itemId),
        fieldName: fieldName.trim()
      }
    });

    if (existingField) {
      res.status(400).json({
        success: false,
        message: 'A field with this name already exists for this service item'
      });
      return;
    }

    const newField = await prisma.serviceFieldDefinition.create({
      data: {
        serviceItemId: parseInt(itemId),
        fieldName: fieldName.trim(),
        fieldLabel: fieldLabel.trim(),
        fieldType: fieldType,
        isRequired: Boolean(isRequired),
        isVisible: Boolean(isVisible),
        sortOrder: parseInt(sortOrder.toString()) || 0,
        defaultValue: defaultValue || null,
        options: options || null,
        validationRules: validationRules || null,
        placeholder: placeholder?.trim() || null,
        isKasdaSpecific: Boolean(isKasdaSpecific)
      }
    });

    res.status(201).json({
      success: true,
      data: newField,
      message: 'Custom field created successfully'
    });
  } catch (error) {
    console.error('Error creating service item custom field:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create custom field'
    });
  }
}));

/**
 * @route   PUT /api/service-catalog-admin/items/custom-fields/:fieldId
 * @desc    Update a custom field for a service item
 * @access  Admin/Manager
 */
router.put('/items/custom-fields/:fieldId', protect, requireAdminAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fieldId } = req.params;
    const { 
      fieldName, 
      fieldLabel, 
      fieldType, 
      isRequired, 
      isVisible, 
      sortOrder, 
      placeholder, 
      defaultValue, 
      options, 
      validationRules, 
      isKasdaSpecific 
    } = req.body;

    // Check if field exists and belongs to a service item
    const existingField = await prisma.serviceFieldDefinition.findUnique({
      where: { id: parseInt(fieldId) }
    });

    if (!existingField || !existingField.serviceItemId) {
      res.status(404).json({
        success: false,
        message: 'Custom field not found or not attached to a service item'
      });
      return;
    }

    // Basic validation - only validate if fields are provided
    if (fieldName !== undefined && (!fieldName || fieldName.trim().length === 0)) {
      res.status(400).json({
        success: false,
        message: 'Field name cannot be empty'
      });
      return;
    }

    if (fieldLabel !== undefined && (!fieldLabel || fieldLabel.trim().length === 0)) {
      res.status(400).json({
        success: false,
        message: 'Field label cannot be empty'
      });
      return;
    }

    if (fieldType !== undefined && (!fieldType || fieldType.trim().length === 0)) {
      res.status(400).json({
        success: false,
        message: 'Field type cannot be empty'
      });
      return;
    }

    // Check for duplicate field names only if name is being updated
    if (fieldName !== undefined) {
      const duplicateField = await prisma.serviceFieldDefinition.findFirst({
        where: { 
          serviceItemId: existingField.serviceItemId,
          fieldName: fieldName.trim(),
          id: { not: parseInt(fieldId) }
        }
      });

      if (duplicateField) {
        res.status(400).json({
          success: false,
          message: 'A field with this name already exists for this service item'
        });
        return;
      }
    }

    // Build update data object with only provided fields
    const updateData: any = {};
    if (fieldName !== undefined) updateData.fieldName = fieldName.trim();
    if (fieldLabel !== undefined) updateData.fieldLabel = fieldLabel.trim();
    if (fieldType !== undefined) updateData.fieldType = fieldType;
    if (isRequired !== undefined) updateData.isRequired = Boolean(isRequired);
    if (isVisible !== undefined) updateData.isVisible = Boolean(isVisible);
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder.toString());
    if (defaultValue !== undefined) updateData.defaultValue = defaultValue;
    if (options !== undefined) updateData.options = options;
    if (validationRules !== undefined) updateData.validationRules = validationRules;
    if (placeholder !== undefined) updateData.placeholder = placeholder?.trim() || null;
    if (isKasdaSpecific !== undefined) updateData.isKasdaSpecific = Boolean(isKasdaSpecific);

    const updatedField = await prisma.serviceFieldDefinition.update({
      where: { id: parseInt(fieldId) },
      data: updateData
    });

    res.json({
      success: true,
      data: updatedField,
      message: 'Custom field updated successfully'
    });
  } catch (error) {
    console.error('Error updating service item custom field:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update custom field',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * @route   DELETE /api/service-catalog-admin/items/custom-fields/:fieldId
 * @desc    Delete a custom field from a service item
 * @access  Admin/Manager
 */
router.delete('/items/custom-fields/:fieldId', protect, requireAdminAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fieldId } = req.params;

    // Check if field exists and belongs to a service item
    const existingField = await prisma.serviceFieldDefinition.findUnique({
      where: { id: parseInt(fieldId) }
    });

    if (!existingField || !existingField.serviceItemId) {
      res.status(404).json({
        success: false,
        message: 'Custom field not found or not attached to a service item'
      });
      return;
    }

    await prisma.serviceFieldDefinition.delete({
      where: { id: parseInt(fieldId) }
    });

    res.json({
      success: true,
      message: 'Custom field deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service item custom field:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete custom field'
    });
  }
}));

export default router;