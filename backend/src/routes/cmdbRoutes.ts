// CMDB (Configuration Management Database) Routes
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, AuthenticatedRequest } from '../middleware/authMiddleware';
import asyncHandler from '../utils/asyncHandler';

const router = express.Router();
const prisma = new PrismaClient();

// =============================================================================
// CI TYPE MANAGEMENT
// =============================================================================

// @route   GET /api/cmdb/ci-types
// @desc    Get all CI types
// @access  Private
router.get('/ci-types', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { category, isActive } = req.query;
  
  const ciTypes = await prisma.cIType.findMany({
    where: {
      ...(category && { category: category as string }),
      ...(isActive !== undefined && { isActive: isActive === 'true' })
    },
    include: {
      ciAttributes: {
        orderBy: { sortOrder: 'asc' }
      },
      _count: {
        select: { configurationItems: true }
      }
    },
    orderBy: { name: 'asc' }
  });
  
  res.json({
    success: true,
    data: ciTypes,
    message: `Retrieved ${ciTypes.length} CI types`
  });
}));

// @route   POST /api/cmdb/ci-types
// @desc    Create new CI type
// @access  Private (Admin only)
router.post('/ci-types', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  
  const { name, description, category, icon, attributes } = req.body;
  
  if (!name || !category) {
    return res.status(400).json({
      success: false,
      message: 'Name and category are required'
    });
  }
  
  const ciType = await prisma.cIType.create({
    data: {
      name,
      description,
      category,
      icon,
      ciAttributes: {
        create: attributes?.map((attr: any, index: number) => ({
          name: attr.name,
          label: attr.label,
          fieldType: attr.fieldType,
          isRequired: attr.isRequired || false,
          options: attr.options,
          validation: attr.validation,
          sortOrder: index
        })) || []
      }
    },
    include: {
      ciAttributes: {
        orderBy: { sortOrder: 'asc' }
      }
    }
  });
  
  res.status(201).json({
    success: true,
    data: ciType,
    message: 'CI type created successfully'
  });
}));

// =============================================================================
// CONFIGURATION ITEM MANAGEMENT
// =============================================================================

// @route   GET /api/cmdb/cis
// @desc    Get all configuration items with filtering
// @access  Private
router.get('/cis', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { 
    page = 1, 
    limit = 50, 
    search, 
    ciTypeId, 
    status, 
    businessCriticality,
    environment,
    locationId,
    ownerId 
  } = req.query;
  
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);
  
  const whereClause: any = {};
  
  // Search across multiple fields
  if (search) {
    whereClause.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { ciId: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
      { hostname: { contains: search as string, mode: 'insensitive' } },
      { ipAddress: { contains: search as string, mode: 'insensitive' } }
    ];
  }
  
  // Apply filters
  if (ciTypeId) whereClause.ciTypeId = parseInt(ciTypeId as string);
  if (status) whereClause.status = status as string;
  if (businessCriticality) whereClause.businessCriticality = businessCriticality as string;
  if (environment) whereClause.environment = environment as string;
  if (locationId) whereClause.locationId = parseInt(locationId as string);
  if (ownerId) whereClause.ownerId = parseInt(ownerId as string);
  
  const [cis, totalCount] = await Promise.all([
    prisma.configurationItem.findMany({
      where: whereClause,
      skip,
      take,
      include: {
        ciType: true,
        asset: {
          select: { id: true, name: true, assetTag: true }
        },
        owner: {
          select: { id: true, name: true, email: true }
        },
        location: {
          select: { id: true, name: true }
        },
        ciAttributes: {
          include: {
            attribute: true
          }
        },
        _count: {
          select: { 
            incidents: true,
            changes: true,
            relationships: true 
          }
        }
      },
      orderBy: { lastUpdated: 'desc' }
    }),
    prisma.configurationItem.count({ where: whereClause })
  ]);
  
  res.json({
    success: true,
    data: {
      cis,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit as string))
      }
    },
    message: `Retrieved ${cis.length} configuration items`
  });
}));

// @route   GET /api/cmdb/cis/:id
// @desc    Get single configuration item by ID
// @access  Private
router.get('/cis/:id', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  
  const ci = await prisma.configurationItem.findUnique({
    where: { id: parseInt(id) },
    include: {
      ciType: {
        include: {
          ciAttributes: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      },
      asset: {
        select: { 
          id: true, 
          name: true, 
          assetTag: true, 
          serialNumber: true,
          model: true,
          manufacturer: true 
        }
      },
      owner: {
        select: { id: true, name: true, email: true, department: true }
      },
      location: {
        select: { id: true, name: true, address: true }
      },
      createdBy: {
        select: { id: true, name: true, email: true }
      },
      ciAttributes: {
        include: {
          attribute: true
        }
      },
      relationships: {
        include: {
          childCI: {
            select: { 
              id: true, 
              name: true, 
              ciId: true, 
              ciType: { select: { name: true } } 
            }
          }
        }
      },
      childRelationships: {
        include: {
          parentCI: {
            select: { 
              id: true, 
              name: true, 
              ciId: true, 
              ciType: { select: { name: true } } 
            }
          }
        }
      },
      incidents: {
        include: {
          ticket: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      changes: {
        include: {
          requester: {
            select: { id: true, name: true }
          },
          approver: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });
  
  if (!ci) {
    return res.status(404).json({
      success: false,
      message: 'Configuration item not found'
    });
  }
  
  res.json({
    success: true,
    data: ci,
    message: 'Configuration item retrieved successfully'
  });
}));

// @route   POST /api/cmdb/cis
// @desc    Create new configuration item
// @access  Private
router.post('/cis', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    name,
    description,
    ciTypeId,
    assetId,
    status,
    environment,
    businessCriticality,
    ownerId,
    locationId,
    version,
    ipAddress,
    hostname,
    operatingSystem,
    notes,
    customFields,
    ciAttributes
  } = req.body;
  
  if (!name || !ciTypeId) {
    return res.status(400).json({
      success: false,
      message: 'Name and CI type are required'
    });
  }
  
  // Generate unique CI ID
  const ciId = `CI-${Date.now()}`;
  
  const ci = await prisma.configurationItem.create({
    data: {
      ciId,
      name,
      description,
      ciTypeId,
      assetId,
      status: status || 'active',
      environment,
      businessCriticality: businessCriticality || 'medium',
      ownerId,
      locationId,
      version,
      ipAddress,
      hostname,
      operatingSystem,
      notes,
      customFields,
      discoveredDate: new Date(),
      createdByUserId: req.user!.id,
      ciAttributes: {
        create: ciAttributes?.map((attr: any) => ({
          attributeId: attr.attributeId,
          value: attr.value
        })) || []
      }
    },
    include: {
      ciType: true,
      asset: {
        select: { id: true, name: true, assetTag: true }
      },
      owner: {
        select: { id: true, name: true, email: true }
      },
      location: {
        select: { id: true, name: true }
      },
      ciAttributes: {
        include: {
          attribute: true
        }
      }
    }
  });
  
  res.status(201).json({
    success: true,
    data: ci,
    message: 'Configuration item created successfully'
  });
}));

// @route   PUT /api/cmdb/cis/:id
// @desc    Update configuration item
// @access  Private
router.put('/cis/:id', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const {
    name,
    description,
    status,
    environment,
    businessCriticality,
    ownerId,
    locationId,
    version,
    ipAddress,
    hostname,
    operatingSystem,
    notes,
    customFields,
    ciAttributes
  } = req.body;
  
  const existingCI = await prisma.configurationItem.findUnique({
    where: { id: parseInt(id) }
  });
  
  if (!existingCI) {
    return res.status(404).json({
      success: false,
      message: 'Configuration item not found'
    });
  }
  
  // Update CI attributes if provided
  if (ciAttributes) {
    await prisma.cIAttributeValue.deleteMany({
      where: { ciId: parseInt(id) }
    });
  }
  
  const ci = await prisma.configurationItem.update({
    where: { id: parseInt(id) },
    data: {
      name,
      description,
      status,
      environment,
      businessCriticality,
      ownerId,
      locationId,
      version,
      ipAddress,
      hostname,
      operatingSystem,
      notes,
      customFields,
      lastUpdated: new Date(),
      ...(ciAttributes && {
        ciAttributes: {
          create: ciAttributes.map((attr: any) => ({
            attributeId: attr.attributeId,
            value: attr.value
          }))
        }
      })
    },
    include: {
      ciType: true,
      asset: {
        select: { id: true, name: true, assetTag: true }
      },
      owner: {
        select: { id: true, name: true, email: true }
      },
      location: {
        select: { id: true, name: true }
      },
      ciAttributes: {
        include: {
          attribute: true
        }
      }
    }
  });
  
  res.json({
    success: true,
    data: ci,
    message: 'Configuration item updated successfully'
  });
}));

// =============================================================================
// CI RELATIONSHIP MANAGEMENT
// =============================================================================

// @route   GET /api/cmdb/cis/:id/relationships
// @desc    Get CI relationships and dependency map
// @access  Private
router.get('/cis/:id/relationships', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  
  const [parentRelationships, childRelationships] = await Promise.all([
    prisma.cIRelationship.findMany({
      where: { childCIId: parseInt(id) },
      include: {
        parentCI: {
          select: { 
            id: true, 
            name: true, 
            ciId: true, 
            status: true,
            ciType: { select: { name: true, icon: true } }
          }
        }
      }
    }),
    prisma.cIRelationship.findMany({
      where: { parentCIId: parseInt(id) },
      include: {
        childCI: {
          select: { 
            id: true, 
            name: true, 
            ciId: true, 
            status: true,
            ciType: { select: { name: true, icon: true } }
          }
        }
      }
    })
  ]);
  
  res.json({
    success: true,
    data: {
      dependencies: parentRelationships.map(rel => ({
        id: rel.id,
        relationshipType: rel.relationshipType,
        description: rel.description,
        ci: rel.parentCI
      })),
      dependents: childRelationships.map(rel => ({
        id: rel.id,
        relationshipType: rel.relationshipType,
        description: rel.description,
        ci: rel.childCI
      }))
    },
    message: 'CI relationships retrieved successfully'
  });
}));

// @route   POST /api/cmdb/cis/:id/relationships
// @desc    Create CI relationship
// @access  Private
router.post('/cis/:id/relationships', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { childCIId, relationshipType, description } = req.body;
  
  if (!childCIId || !relationshipType) {
    return res.status(400).json({
      success: false,
      message: 'Child CI and relationship type are required'
    });
  }
  
  // Check if relationship already exists
  const existingRelationship = await prisma.cIRelationship.findFirst({
    where: {
      parentCIId: parseInt(id),
      childCIId: parseInt(childCIId),
      relationshipType: relationshipType
    }
  });
  
  if (existingRelationship) {
    return res.status(400).json({
      success: false,
      message: 'Relationship already exists'
    });
  }
  
  const relationship = await prisma.cIRelationship.create({
    data: {
      parentCIId: parseInt(id),
      childCIId: parseInt(childCIId),
      relationshipType,
      description
    },
    include: {
      parentCI: {
        select: { id: true, name: true, ciId: true }
      },
      childCI: {
        select: { id: true, name: true, ciId: true }
      }
    }
  });
  
  res.status(201).json({
    success: true,
    data: relationship,
    message: 'CI relationship created successfully'
  });
}));

// =============================================================================
// CI INCIDENT MANAGEMENT
// =============================================================================

// @route   POST /api/cmdb/cis/:id/incidents
// @desc    Link CI to incident/ticket
// @access  Private
router.post('/cis/:id/incidents', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { ticketId, impact } = req.body;
  
  if (!ticketId) {
    return res.status(400).json({
      success: false,
      message: 'Ticket ID is required'
    });
  }
  
  // Check if CI-incident link already exists
  const existingIncident = await prisma.cIIncident.findFirst({
    where: {
      ciId: parseInt(id),
      ticketId: parseInt(ticketId)
    }
  });
  
  if (existingIncident) {
    return res.status(400).json({
      success: false,
      message: 'CI is already linked to this incident'
    });
  }
  
  const incident = await prisma.cIIncident.create({
    data: {
      ciId: parseInt(id),
      ticketId: parseInt(ticketId),
      impact: impact || 'low'
    },
    include: {
      configurationItem: {
        select: { id: true, name: true, ciId: true }
      },
      ticket: {
        select: { id: true, title: true, status: true, priority: true }
      }
    }
  });
  
  res.status(201).json({
    success: true,
    data: incident,
    message: 'CI linked to incident successfully'
  });
}));

// =============================================================================
// CI CHANGE MANAGEMENT
// =============================================================================

// @route   POST /api/cmdb/cis/:id/changes
// @desc    Create change request for CI
// @access  Private
router.post('/cis/:id/changes', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const {
    changeType,
    changeDescription,
    plannedDate,
    impact,
    notes
  } = req.body;
  
  if (!changeType || !changeDescription) {
    return res.status(400).json({
      success: false,
      message: 'Change type and description are required'
    });
  }
  
  const change = await prisma.cIChange.create({
    data: {
      ciId: parseInt(id),
      changeType,
      changeDescription,
      plannedDate: plannedDate ? new Date(plannedDate) : null,
      impact: impact || 'low',
      requestedBy: req.user!.id,
      notes
    },
    include: {
      configurationItem: {
        select: { id: true, name: true, ciId: true }
      },
      requester: {
        select: { id: true, name: true, email: true }
      }
    }
  });
  
  res.status(201).json({
    success: true,
    data: change,
    message: 'Change request created successfully'
  });
}));

// @route   PUT /api/cmdb/changes/:changeId/approve
// @desc    Approve CI change request
// @access  Private (Manager only)
router.put('/changes/:changeId/approve', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { changeId } = req.params;
  
  if (req.user?.role !== 'manager' && req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Manager or admin role required.'
    });
  }
  
  const change = await prisma.cIChange.findUnique({
    where: { id: parseInt(changeId) }
  });
  
  if (!change) {
    return res.status(404).json({
      success: false,
      message: 'Change request not found'
    });
  }
  
  if (change.status !== 'planning') {
    return res.status(400).json({
      success: false,
      message: 'Change request is not in planning status'
    });
  }
  
  const updatedChange = await prisma.cIChange.update({
    where: { id: parseInt(changeId) },
    data: {
      status: 'approved',
      approvedBy: req.user!.id
    },
    include: {
      configurationItem: {
        select: { id: true, name: true, ciId: true }
      },
      requester: {
        select: { id: true, name: true }
      },
      approver: {
        select: { id: true, name: true }
      }
    }
  });
  
  res.json({
    success: true,
    data: updatedChange,
    message: 'Change request approved successfully'
  });
}));

// =============================================================================
// CMDB DASHBOARD AND ANALYTICS
// =============================================================================

// @route   GET /api/cmdb/dashboard
// @desc    Get CMDB dashboard data
// @access  Private
router.get('/dashboard', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { period = '30' } = req.query;
  const daysBack = parseInt(period as string);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  
  const [
    totalCIs,
    cisByType,
    cisByStatus,
    cisByEnvironment,
    cisByCriticality,
    recentChanges,
    activeIncidents,
    relationshipStats
  ] = await Promise.all([
    // Total CIs
    prisma.configurationItem.count(),
    
    // CIs by type
    prisma.configurationItem.groupBy({
      by: ['ciTypeId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    }),
    
    // CIs by status
    prisma.configurationItem.groupBy({
      by: ['status'],
      _count: { id: true }
    }),
    
    // CIs by environment
    prisma.configurationItem.groupBy({
      by: ['environment'],
      _count: { id: true }
    }),
    
    // CIs by business criticality
    prisma.configurationItem.groupBy({
      by: ['businessCriticality'],
      _count: { id: true }
    }),
    
    // Recent changes
    prisma.cIChange.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      include: {
        configurationItem: {
          select: { id: true, name: true, ciId: true }
        },
        requester: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    
    // Active incidents
    prisma.cIIncident.findMany({
      where: {
        ticket: {
          status: { in: ['open', 'in_progress', 'assigned'] }
        }
      },
      include: {
        configurationItem: {
          select: { id: true, name: true, ciId: true }
        },
        ticket: {
          select: { id: true, title: true, status: true, priority: true }
        }
      },
      take: 10
    }),
    
    // Relationship statistics
    prisma.cIRelationship.groupBy({
      by: ['relationshipType'],
      _count: { id: true }
    })
  ]);
  
  // Get CI type names for the grouping
  const ciTypeIds = cisByType.map(item => item.ciTypeId);
  const ciTypes = await prisma.cIType.findMany({
    where: { id: { in: ciTypeIds } },
    select: { id: true, name: true }
  });
  
  res.json({
    success: true,
    data: {
      overview: {
        totalCIs,
        cisByType: cisByType.map(item => ({
          ciTypeId: item.ciTypeId,
          typeName: ciTypes.find(t => t.id === item.ciTypeId)?.name || 'Unknown',
          count: item._count.id
        })),
        cisByStatus: cisByStatus.map(item => ({
          status: item.status,
          count: item._count.id
        })),
        cisByEnvironment: cisByEnvironment.map(item => ({
          environment: item.environment || 'Unknown',
          count: item._count.id
        })),
        cisByCriticality: cisByCriticality.map(item => ({
          criticality: item.businessCriticality,
          count: item._count.id
        })),
        relationshipStats: relationshipStats.map(item => ({
          type: item.relationshipType,
          count: item._count.id
        }))
      },
      recent: {
        changes: recentChanges,
        incidents: activeIncidents
      },
      alerts: {
        pendingChanges: recentChanges.filter(c => c.status === 'planning').length,
        activeIncidents: activeIncidents.length,
        failedCIs: cisByStatus.find(item => item.status === 'failed')?._count.id || 0
      }
    },
    message: 'CMDB dashboard data retrieved successfully'
  });
}));

export default router;