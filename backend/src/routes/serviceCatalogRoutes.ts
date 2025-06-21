// Service Catalog Routes for ITIL-aligned BSG Helpdesk
import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, AuthenticatedRequest } from '../middleware/authMiddleware';
import asyncHandler from '../utils/asyncHandler';

const router = express.Router();
const prisma = new PrismaClient();


// Get service catalog hierarchy
router.get('/catalog', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user } = req;
    
    // Build filter based on user context
    let whereClause: any = { isActive: true, categoryLevel: 1 };
    
    // If user is KASDA user, show government services prominently
    if (user?.isKasdaUser) {
      whereClause = {
        isActive: true,
        categoryLevel: 1,
        OR: [
          { serviceType: 'government_service' },
          { serviceType: 'business_service' }
        ]
      };
    }
    // If user is from IT department, show technical services first
    else if (user?.role === 'technician' && user?.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: user.departmentId }
      });
      
      if (department?.name === 'IT') {
        whereClause = {
          isActive: true,
          categoryLevel: 1,
          OR: [
            { serviceType: 'technical_service' },
            { serviceType: 'business_service' }
          ]
        };
      }
    }

    const serviceCatalog = await prisma.serviceCatalog.findMany({
      where: whereClause,
      include: {
        children: {
          where: { isActive: true },
          include: {
            serviceItems: {
              where: { isActive: true },
              include: {
                templates: {
                  where: { isVisible: true },
                  orderBy: { sortOrder: 'asc' }
                }
              },
              orderBy: { sortOrder: 'asc' }
            }
          },
          orderBy: { name: 'asc' }
        },
        department: true
      },
      orderBy: [
        { serviceType: 'asc' }, // Government services first for KASDA users
        { name: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: serviceCatalog,
      userContext: {
        isKasdaUser: user?.isKasdaUser || false,
        department: user?.departmentId,
        role: user?.role
      }
    });
  } catch (error) {
    console.error('Error fetching service catalog:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch service catalog' });
  }
}));

// Get service items for a specific catalog
router.get('/catalog/:catalogId/items', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { catalogId } = req.params;
    const { user } = req;

    const serviceItems = await prisma.serviceItem.findMany({
      where: {
        serviceCatalogId: parseInt(catalogId),
        isActive: true,
        // Filter KASDA items for non-KASDA users if needed
        ...(user?.isKasdaUser ? {} : { isKasdaRelated: false })
      },
      include: {
        templates: {
          where: { isVisible: true },
          include: {
            customFieldDefinitions: {
              where: { isVisible: true },
              orderBy: { sortOrder: 'asc' }
            }
          },
          orderBy: { sortOrder: 'asc' }
        },
        serviceCatalog: {
          include: {
            department: true
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({
      success: true,
      data: serviceItems
    });
  } catch (error) {
    console.error('Error fetching service items:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch service items' });
  }
}));

// Get service template details with custom fields
router.get('/templates/:templateId', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { templateId } = req.params;
    const { user } = req;

    const template = await prisma.serviceTemplate.findUnique({
      where: { id: parseInt(templateId) },
      include: {
        customFieldDefinitions: {
          where: { 
            isVisible: true,
            // Show KASDA-specific fields only to KASDA users or business reviewers
            ...(user?.isKasdaUser || user?.isBusinessReviewer ? {} : { isKasdaSpecific: false })
          },
          orderBy: { sortOrder: 'asc' }
        },
        serviceItem: {
          include: {
            serviceCatalog: {
              include: {
                department: true
              }
            }
          }
        }
      }
    });

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    // Check if user can access KASDA templates
    if (template.isKasdaTemplate && !user?.isKasdaUser && !user?.isBusinessReviewer) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. KASDA templates are restricted to authorized users.' 
      });
    }

    res.json({
      success: true,
      data: template,
      routing: {
        targetDepartment: template.serviceItem?.serviceCatalog?.department?.name,
        requiresBusinessApproval: template.requiresBusinessApproval,
        isKasdaTemplate: template.isKasdaTemplate
      }
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch template' });
  }
}));

// Get government entities (for KASDA users)
router.get('/government-entities', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user } = req;

    // Only allow KASDA users and business reviewers to access government entities
    if (!user?.isKasdaUser && !user?.isBusinessReviewer) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only authorized government users can access this information.' 
      });
    }

    const entities = await prisma.governmentEntity.findMany({
      where: { isActive: true },
      orderBy: { entityName: 'asc' }
    });

    res.json({
      success: true,
      data: entities
    });
  } catch (error) {
    console.error('Error fetching government entities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch government entities' });
  }
}));

// Get KASDA user profile
router.get('/kasda-profile', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user } = req;

    if (!user?.isKasdaUser) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only KASDA users can access profile information.' 
      });
    }

    const profile = await prisma.kasdaUserProfile.findUnique({
      where: { userId: user.id },
      include: {
        governmentEntity: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ 
        success: false, 
        message: 'KASDA profile not found' 
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching KASDA profile:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch KASDA profile' });
  }
}));

// Get department routing information
router.get('/routing/:serviceItemId', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { serviceItemId } = req.params;

    const serviceItem = await prisma.serviceItem.findUnique({
      where: { id: parseInt(serviceItemId) },
      include: {
        serviceCatalog: {
          include: {
            department: {
              include: {
                slaPolicy: {
                  where: { isActive: true }
                }
              }
            }
          }
        }
      }
    });

    if (!serviceItem) {
      return res.status(404).json({ success: false, message: 'Service item not found' });
    }

    const routing = {
      targetDepartment: serviceItem.serviceCatalog.department.name,
      departmentType: serviceItem.serviceCatalog.department.departmentType,
      isServiceOwner: serviceItem.serviceCatalog.department.isServiceOwner,
      requiresGovApproval: serviceItem.requiresGovApproval,
      isKasdaRelated: serviceItem.isKasdaRelated,
      requestType: serviceItem.requestType,
      slaPolicy: serviceItem.serviceCatalog.department.slaPolicy.find(
        p => p.serviceType === serviceItem.serviceCatalog.name
      )
    };

    res.json({
      success: true,
      data: routing
    });
  } catch (error) {
    console.error('Error fetching routing information:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch routing information' });
  }
}));

// Search service catalog
router.get('/search', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { q: query, type, department } = req.query;
    const { user } = req;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    let whereClause: any = {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    };

    // Filter by service type if specified
    if (type) {
      whereClause.serviceType = type;
    }

    // Filter by department if specified
    if (department) {
      whereClause.departmentId = parseInt(department as string);
    }

    // Apply KASDA filtering for non-KASDA users
    if (!user?.isKasdaUser && !user?.isBusinessReviewer) {
      whereClause.serviceType = { not: 'government_service' };
    }

    const results = await prisma.serviceCatalog.findMany({
      where: whereClause,
      include: {
        serviceItems: {
          where: { 
            isActive: true,
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } }
            ]
          },
          include: {
            templates: {
              where: { isVisible: true },
              orderBy: { sortOrder: 'asc' }
            }
          }
        },
        department: true,
        parent: true
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: results,
      query,
      resultCount: results.length
    });
  } catch (error) {
    console.error('Error searching service catalog:', error);
    res.status(500).json({ success: false, message: 'Failed to search service catalog' });
  }
}));

export default router;