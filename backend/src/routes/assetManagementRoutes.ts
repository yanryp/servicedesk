// Asset Management Routes - ITIL-Compliant Asset Management System
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, AuthenticatedRequest } from '../middleware/authMiddleware';
import asyncHandler from '../utils/asyncHandler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { generateAssetTag } from '../utils/assetUtils';

const router = express.Router();
const prisma = new PrismaClient();

// File upload configuration for asset attachments
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'assets');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'asset-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|csv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type for asset upload'));
    }
  }
});

// =============================================================================
// ASSET TYPE MANAGEMENT
// =============================================================================

// @route   GET /api/assets/types
// @desc    Get all asset types
// @access  Private
router.get('/types', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { category, isActive } = req.query;
  
  const assetTypes = await prisma.assetType.findMany({
    where: {
      ...(category && { category: category as string }),
      ...(isActive !== undefined && { isActive: isActive === 'true' })
    },
    include: {
      assetAttributes: {
        orderBy: { sortOrder: 'asc' }
      },
      _count: {
        select: { assets: true }
      }
    },
    orderBy: { name: 'asc' }
  });
  
  res.json({
    success: true,
    data: assetTypes,
    message: `Retrieved ${assetTypes.length} asset types`
  });
}));

// @route   POST /api/assets/types
// @desc    Create new asset type
// @access  Private (Admin only)
router.post('/types', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  
  const { name, description, category, icon, attributes } = req.body;
  
  // Validate required fields
  if (!name || !category) {
    return res.status(400).json({
      success: false,
      message: 'Name and category are required'
    });
  }
  
  // Create asset type with attributes
  const assetType = await prisma.assetType.create({
    data: {
      name,
      description,
      category,
      icon,
      assetAttributes: {
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
      assetAttributes: {
        orderBy: { sortOrder: 'asc' }
      }
    }
  });
  
  res.status(201).json({
    success: true,
    data: assetType,
    message: 'Asset type created successfully'
  });
}));

// =============================================================================
// ASSET MANAGEMENT
// =============================================================================

// @route   GET /api/assets
// @desc    Get all assets with filtering and pagination
// @access  Private
router.get('/', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { 
    page = 1, 
    limit = 50, 
    search, 
    assetTypeId, 
    status, 
    locationId, 
    assignedToUserId,
    category 
  } = req.query;
  
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);
  
  const whereClause: any = {};
  
  // Search across multiple fields
  if (search) {
    whereClause.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { assetTag: { contains: search as string, mode: 'insensitive' } },
      { serialNumber: { contains: search as string, mode: 'insensitive' } },
      { model: { contains: search as string, mode: 'insensitive' } },
      { manufacturer: { contains: search as string, mode: 'insensitive' } }
    ];
  }
  
  // Apply filters
  if (assetTypeId) whereClause.assetTypeId = parseInt(assetTypeId as string);
  if (status) whereClause.status = status as string;
  if (locationId) whereClause.locationId = parseInt(locationId as string);
  if (assignedToUserId) whereClause.assignedToUserId = parseInt(assignedToUserId as string);
  if (category) {
    whereClause.assetType = { category: category as string };
  }
  
  const [assets, totalCount] = await Promise.all([
    prisma.asset.findMany({
      where: whereClause,
      skip,
      take,
      include: {
        assetType: true,
        location: true,
        assignedToUser: {
          select: { id: true, name: true, email: true }
        },
        assignedToDept: {
          select: { id: true, name: true }
        },
        vendor: true,
        assetAttributes: {
          include: {
            attribute: true
          }
        },
        _count: {
          select: { 
            tickets: true,
            maintenanceRecords: true,
            contracts: true 
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.asset.count({ where: whereClause })
  ]);
  
  res.json({
    success: true,
    data: {
      assets,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit as string))
      }
    },
    message: `Retrieved ${assets.length} assets`
  });
}));

// @route   GET /api/assets/:id
// @desc    Get single asset by ID
// @access  Private
router.get('/:id', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  
  const asset = await prisma.asset.findUnique({
    where: { id: parseInt(id) },
    include: {
      assetType: {
        include: {
          assetAttributes: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      },
      location: true,
      assignedToUser: {
        select: { id: true, name: true, email: true, department: true }
      },
      assignedToDept: true,
      vendor: true,
      createdBy: {
        select: { id: true, name: true, email: true }
      },
      assetAttributes: {
        include: {
          attribute: true
        }
      },
      lifecycleEvents: {
        include: {
          user: {
            select: { id: true, name: true }
          }
        },
        orderBy: { eventDate: 'desc' }
      },
      maintenanceRecords: {
        include: {
          createdBy: {
            select: { id: true, name: true }
          }
        },
        orderBy: { scheduledDate: 'desc' }
      },
      contracts: {
        include: {
          vendor: true,
          createdBy: {
            select: { id: true, name: true }
          }
        },
        orderBy: { startDate: 'desc' }
      },
      transfers: {
        include: {
          fromUser: { select: { id: true, name: true } },
          toUser: { select: { id: true, name: true } },
          fromLocation: { select: { id: true, name: true } },
          toLocation: { select: { id: true, name: true } },
          requester: { select: { id: true, name: true } },
          approver: { select: { id: true, name: true } }
        },
        orderBy: { transferDate: 'desc' }
      },
      relationships: {
        include: {
          childAsset: {
            select: { id: true, name: true, assetTag: true }
          }
        }
      },
      childRelationships: {
        include: {
          parentAsset: {
            select: { id: true, name: true, assetTag: true }
          }
        }
      },
      tickets: {
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });
  
  if (!asset) {
    return res.status(404).json({
      success: false,
      message: 'Asset not found'
    });
  }
  
  res.json({
    success: true,
    data: asset,
    message: 'Asset retrieved successfully'
  });
}));

// @route   POST /api/assets
// @desc    Create new asset
// @access  Private
router.post('/', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    name,
    description,
    assetTypeId,
    serialNumber,
    model,
    manufacturer,
    status,
    condition,
    locationId,
    assignedToUserId,
    assignedToDeptId,
    purchasePrice,
    purchaseDate,
    warrantyExpiry,
    depreciationRate,
    vendorId,
    purchaseOrderNum,
    deploymentDate,
    notes,
    customFields,
    assetAttributes
  } = req.body;
  
  // Validate required fields
  if (!name || !assetTypeId) {
    return res.status(400).json({
      success: false,
      message: 'Name and asset type are required'
    });
  }
  
  // Generate unique asset tag
  const assetTag = await generateAssetTag(assetTypeId);
  
  // Create asset with attributes
  const asset = await prisma.asset.create({
    data: {
      assetTag,
      name,
      description,
      assetTypeId,
      serialNumber,
      model,
      manufacturer,
      status: status || 'received',
      condition: condition || 'new',
      locationId,
      assignedToUserId,
      assignedToDeptId,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
      depreciationRate: depreciationRate ? parseFloat(depreciationRate) : null,
      vendorId,
      purchaseOrderNum,
      deploymentDate: deploymentDate ? new Date(deploymentDate) : null,
      notes,
      customFields,
      createdByUserId: req.user!.id,
      assetAttributes: {
        create: assetAttributes?.map((attr: any) => ({
          attributeId: attr.attributeId,
          value: attr.value
        })) || []
      },
      lifecycleEvents: {
        create: {
          eventType: 'received',
          description: 'Asset created and received',
          eventDate: new Date(),
          performedBy: req.user!.id,
          notes: 'Initial asset creation'
        }
      }
    },
    include: {
      assetType: true,
      location: true,
      assignedToUser: {
        select: { id: true, name: true, email: true }
      },
      vendor: true,
      createdBy: {
        select: { id: true, name: true, email: true }
      },
      assetAttributes: {
        include: {
          attribute: true
        }
      }
    }
  });
  
  res.status(201).json({
    success: true,
    data: asset,
    message: 'Asset created successfully'
  });
}));

// @route   PUT /api/assets/:id
// @desc    Update asset
// @access  Private
router.put('/:id', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const {
    name,
    description,
    serialNumber,
    model,
    manufacturer,
    status,
    condition,
    locationId,
    assignedToUserId,
    assignedToDeptId,
    purchasePrice,
    purchaseDate,
    warrantyExpiry,
    depreciationRate,
    vendorId,
    purchaseOrderNum,
    deploymentDate,
    retirementDate,
    notes,
    customFields,
    assetAttributes
  } = req.body;
  
  const existingAsset = await prisma.asset.findUnique({
    where: { id: parseInt(id) },
    include: { assetAttributes: true }
  });
  
  if (!existingAsset) {
    return res.status(404).json({
      success: false,
      message: 'Asset not found'
    });
  }
  
  // Create lifecycle event for status change
  const lifecycleEvents = [];
  if (status && status !== existingAsset.status) {
    lifecycleEvents.push({
      eventType: status === 'deployed' ? 'deployed' : 
                 status === 'retired' ? 'retired' : 
                 status === 'disposed' ? 'disposed' : 'transferred',
      description: `Asset status changed from ${existingAsset.status} to ${status}`,
      eventDate: new Date(),
      performedBy: req.user!.id,
      notes: `Status updated by ${req.user!.name || req.user!.username || 'User'}`
    });
  }
  
  // Update asset attributes
  if (assetAttributes) {
    // Delete existing attributes
    await prisma.assetAttributeValue.deleteMany({
      where: { assetId: parseInt(id) }
    });
  }
  
  const asset = await prisma.asset.update({
    where: { id: parseInt(id) },
    data: {
      name,
      description,
      serialNumber,
      model,
      manufacturer,
      status,
      condition,
      locationId,
      assignedToUserId,
      assignedToDeptId,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
      warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : undefined,
      depreciationRate: depreciationRate ? parseFloat(depreciationRate) : undefined,
      vendorId,
      purchaseOrderNum,
      deploymentDate: deploymentDate ? new Date(deploymentDate) : undefined,
      retirementDate: retirementDate ? new Date(retirementDate) : undefined,
      notes,
      customFields,
      ...(assetAttributes && {
        assetAttributes: {
          create: assetAttributes.map((attr: any) => ({
            attributeId: attr.attributeId,
            value: attr.value
          }))
        }
      }),
      ...(lifecycleEvents.length > 0 && {
        lifecycleEvents: {
          create: lifecycleEvents
        }
      })
    },
    include: {
      assetType: true,
      location: true,
      assignedToUser: {
        select: { id: true, name: true, email: true }
      },
      vendor: true,
      assetAttributes: {
        include: {
          attribute: true
        }
      }
    }
  });
  
  res.json({
    success: true,
    data: asset,
    message: 'Asset updated successfully'
  });
}));

// @route   DELETE /api/assets/:id
// @desc    Delete asset (soft delete by setting status to disposed)
// @access  Private (Admin only)
router.delete('/:id', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  
  const { id } = req.params;
  
  const asset = await prisma.asset.findUnique({
    where: { id: parseInt(id) }
  });
  
  if (!asset) {
    return res.status(404).json({
      success: false,
      message: 'Asset not found'
    });
  }
  
  // Soft delete by updating status to disposed
  await prisma.asset.update({
    where: { id: parseInt(id) },
    data: {
      status: 'disposed',
      disposalDate: new Date(),
      lifecycleEvents: {
        create: {
          eventType: 'disposed',
          description: 'Asset disposed/deleted',
          eventDate: new Date(),
          performedBy: req.user!.id,
          notes: `Asset disposed by ${req.user!.name}`
        }
      }
    }
  });
  
  res.json({
    success: true,
    message: 'Asset disposed successfully'
  });
}));

// =============================================================================
// ASSET MAINTENANCE
// =============================================================================

// @route   GET /api/assets/:id/maintenance
// @desc    Get maintenance records for an asset
// @access  Private
router.get('/:id/maintenance', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  
  const maintenanceRecords = await prisma.assetMaintenance.findMany({
    where: { assetId: parseInt(id) },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { scheduledDate: 'desc' }
  });
  
  res.json({
    success: true,
    data: maintenanceRecords,
    message: `Retrieved ${maintenanceRecords.length} maintenance records`
  });
}));

// @route   POST /api/assets/:id/maintenance
// @desc    Create maintenance record for an asset
// @access  Private
router.post('/:id/maintenance', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const {
    maintenanceType,
    title,
    description,
    scheduledDate,
    cost,
    performedBy,
    notes,
    nextScheduledDate
  } = req.body;
  
  if (!maintenanceType || !title || !scheduledDate) {
    return res.status(400).json({
      success: false,
      message: 'Maintenance type, title, and scheduled date are required'
    });
  }
  
  const maintenance = await prisma.assetMaintenance.create({
    data: {
      assetId: parseInt(id),
      maintenanceType,
      title,
      description,
      scheduledDate: new Date(scheduledDate),
      cost: cost ? parseFloat(cost) : null,
      performedBy,
      notes,
      nextScheduledDate: nextScheduledDate ? new Date(nextScheduledDate) : null,
      createdByUserId: req.user!.id
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true }
      }
    }
  });
  
  res.status(201).json({
    success: true,
    data: maintenance,
    message: 'Maintenance record created successfully'
  });
}));

// @route   PUT /api/assets/maintenance/:maintenanceId
// @desc    Update maintenance record
// @access  Private
router.put('/maintenance/:maintenanceId', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { maintenanceId } = req.params;
  const {
    title,
    description,
    scheduledDate,
    completedDate,
    status,
    cost,
    performedBy,
    notes,
    nextScheduledDate
  } = req.body;
  
  const maintenance = await prisma.assetMaintenance.update({
    where: { id: parseInt(maintenanceId) },
    data: {
      title,
      description,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      completedDate: completedDate ? new Date(completedDate) : undefined,
      status,
      cost: cost ? parseFloat(cost) : undefined,
      performedBy,
      notes,
      nextScheduledDate: nextScheduledDate ? new Date(nextScheduledDate) : undefined
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true }
      }
    }
  });
  
  res.json({
    success: true,
    data: maintenance,
    message: 'Maintenance record updated successfully'
  });
}));

// =============================================================================
// ASSET TRANSFERS
// =============================================================================

// @route   POST /api/assets/:id/transfer
// @desc    Create asset transfer request
// @access  Private
router.post('/:id/transfer', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const {
    transferType,
    toUserId,
    toLocationId,
    toDeptId,
    transferDate,
    reason,
    notes
  } = req.body;
  
  if (!transferType || !transferDate) {
    return res.status(400).json({
      success: false,
      message: 'Transfer type and date are required'
    });
  }
  
  const asset = await prisma.asset.findUnique({
    where: { id: parseInt(id) },
    select: { 
      assignedToUserId: true, 
      locationId: true, 
      assignedToDeptId: true 
    }
  });
  
  if (!asset) {
    return res.status(404).json({
      success: false,
      message: 'Asset not found'
    });
  }
  
  const transfer = await prisma.assetTransfer.create({
    data: {
      assetId: parseInt(id),
      transferType,
      fromUserId: asset.assignedToUserId,
      toUserId,
      fromLocationId: asset.locationId,
      toLocationId,
      fromDeptId: asset.assignedToDeptId,
      toDeptId,
      transferDate: new Date(transferDate),
      reason,
      notes,
      requestedBy: req.user!.id
    },
    include: {
      fromUser: { select: { id: true, name: true } },
      toUser: { select: { id: true, name: true } },
      fromLocation: { select: { id: true, name: true } },
      toLocation: { select: { id: true, name: true } },
      requester: { select: { id: true, name: true } }
    }
  });
  
  res.status(201).json({
    success: true,
    data: transfer,
    message: 'Asset transfer request created successfully'
  });
}));

// @route   PUT /api/assets/transfer/:transferId/approve
// @desc    Approve asset transfer
// @access  Private (Manager only)
router.put('/transfer/:transferId/approve', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { transferId } = req.params;
  
  if (req.user?.role !== 'manager' && req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Manager or admin role required.'
    });
  }
  
  const transfer = await prisma.assetTransfer.findUnique({
    where: { id: parseInt(transferId) },
    include: { asset: true }
  });
  
  if (!transfer) {
    return res.status(404).json({
      success: false,
      message: 'Transfer request not found'
    });
  }
  
  if (transfer.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Transfer request is not pending'
    });
  }
  
  // Update transfer status and asset assignment
  await prisma.$transaction([
    prisma.assetTransfer.update({
      where: { id: parseInt(transferId) },
      data: {
        status: 'approved',
        approvedBy: req.user!.id
      }
    }),
    prisma.asset.update({
      where: { id: transfer.assetId },
      data: {
        assignedToUserId: transfer.toUserId,
        locationId: transfer.toLocationId,
        assignedToDeptId: transfer.toDeptId
      }
    }),
    prisma.assetLifecycleEvent.create({
      data: {
        assetId: transfer.assetId,
        eventType: 'transferred',
        description: `Asset transferred (${transfer.transferType})`,
        eventDate: new Date(),
        performedBy: req.user!.id,
        notes: `Transfer approved by ${req.user!.name || req.user!.username || 'User'}`
      }
    })
  ]);
  
  res.json({
    success: true,
    message: 'Asset transfer approved successfully'
  });
}));

// =============================================================================
// ASSET DASHBOARD AND ANALYTICS
// =============================================================================

// @route   GET /api/assets/dashboard
// @desc    Get asset management dashboard data
// @access  Private
router.get('/dashboard', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { period = '30' } = req.query;
  const daysBack = parseInt(period as string);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  
  const [
    totalAssets,
    assetsByStatus,
    assetsByType,
    assetsByLocation,
    recentAssets,
    maintenanceDue,
    warrantiesExpiring,
    transfersPending
  ] = await Promise.all([
    // Total assets count
    prisma.asset.count(),
    
    // Assets by status
    prisma.asset.groupBy({
      by: ['status'],
      _count: { id: true }
    }),
    
    // Assets by type
    prisma.asset.groupBy({
      by: ['assetTypeId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    }),
    
    // Assets by location
    prisma.asset.groupBy({
      by: ['locationId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    }),
    
    // Recent assets
    prisma.asset.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      include: {
        assetType: true,
        location: true,
        assignedToUser: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    
    // Maintenance due
    prisma.assetMaintenance.findMany({
      where: {
        status: 'scheduled',
        scheduledDate: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        }
      },
      include: {
        asset: {
          select: { id: true, name: true, assetTag: true }
        }
      },
      orderBy: { scheduledDate: 'asc' },
      take: 10
    }),
    
    // Warranties expiring
    prisma.asset.findMany({
      where: {
        warrantyExpiry: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
        }
      },
      select: {
        id: true,
        name: true,
        assetTag: true,
        warrantyExpiry: true
      },
      orderBy: { warrantyExpiry: 'asc' },
      take: 10
    }),
    
    // Pending transfers
    prisma.assetTransfer.findMany({
      where: { status: 'pending' },
      include: {
        asset: {
          select: { id: true, name: true, assetTag: true }
        },
        requester: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ]);
  
  // Get asset type names for the grouping
  const assetTypeIds = assetsByType.map(item => item.assetTypeId);
  const assetTypes = await prisma.assetType.findMany({
    where: { id: { in: assetTypeIds } },
    select: { id: true, name: true }
  });
  
  // Get location names for the grouping
  const locationIds = assetsByLocation.map(item => item.locationId).filter((id): id is number => id !== null);
  const locations = await prisma.unit.findMany({
    where: { id: { in: locationIds } },
    select: { id: true, name: true }
  });
  
  res.json({
    success: true,
    data: {
      overview: {
        totalAssets,
        assetsByStatus: assetsByStatus.map(item => ({
          status: item.status,
          count: item._count.id
        })),
        assetsByType: assetsByType.map(item => ({
          assetTypeId: item.assetTypeId,
          typeName: assetTypes.find(t => t.id === item.assetTypeId)?.name || 'Unknown',
          count: item._count.id
        })),
        assetsByLocation: assetsByLocation.map(item => ({
          locationId: item.locationId,
          locationName: locations.find(l => l.id === item.locationId)?.name || 'Unassigned',
          count: item._count.id
        }))
      },
      recent: {
        assets: recentAssets,
        maintenanceDue,
        warrantiesExpiring,
        transfersPending
      },
      alerts: {
        maintenanceDueCount: maintenanceDue.length,
        warrantiesExpiringCount: warrantiesExpiring.length,
        transfersPendingCount: transfersPending.length
      }
    },
    message: 'Asset dashboard data retrieved successfully'
  });
}));

export default router;