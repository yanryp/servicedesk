// Asset Management Utility Functions
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate unique asset tag based on asset type and sequence
 * Format: [TYPE_PREFIX][YEAR][SEQUENCE]
 * Example: HW2025001, SW2025001, NW2025001
 */
export async function generateAssetTag(assetTypeId: number): Promise<string> {
  try {
    // Get asset type information
    const assetType = await prisma.assetType.findUnique({
      where: { id: assetTypeId },
      select: { name: true, category: true }
    });
    
    if (!assetType) {
      throw new Error('Asset type not found');
    }
    
    // Generate prefix based on category
    const prefixMap: Record<string, string> = {
      'hardware': 'HW',
      'software': 'SW',
      'network': 'NW',
      'security': 'SC',
      'facilities': 'FC',
      'default': 'AS'
    };
    
    const prefix = prefixMap[assetType.category.toLowerCase()] || prefixMap['default'];
    const year = new Date().getFullYear().toString();
    
    // Get the last asset tag for this year and prefix
    const lastAsset = await prisma.asset.findFirst({
      where: {
        assetTag: {
          startsWith: `${prefix}${year}`
        }
      },
      orderBy: {
        assetTag: 'desc'
      }
    });
    
    let sequence = 1;
    if (lastAsset) {
      // Extract sequence number from last asset tag
      const lastSequence = parseInt(lastAsset.assetTag.substring(prefix.length + year.length));
      sequence = lastSequence + 1;
    }
    
    // Format sequence with leading zeros (3 digits)
    const formattedSequence = sequence.toString().padStart(3, '0');
    
    return `${prefix}${year}${formattedSequence}`;
  } catch (error) {
    console.error('Error generating asset tag:', error);
    // Fallback to timestamp-based tag
    return `AS${Date.now()}`;
  }
}

/**
 * Calculate asset depreciation value
 * Using straight-line depreciation method
 */
export function calculateDepreciation(
  purchasePrice: number,
  purchaseDate: Date,
  depreciationRate: number,
  usefulLifeYears: number = 5
): number {
  const currentDate = new Date();
  const ageInYears = (currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  
  // Straight-line depreciation
  const annualDepreciation = purchasePrice * (depreciationRate / 100);
  const totalDepreciation = Math.min(annualDepreciation * ageInYears, purchasePrice);
  
  return Math.max(purchasePrice - totalDepreciation, 0);
}

/**
 * Calculate asset Total Cost of Ownership (TCO)
 */
export async function calculateTCO(assetId: number): Promise<number> {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        maintenanceRecords: {
          where: { 
            cost: { not: null }
          }
        },
        contracts: {
          where: {
            contractType: { in: ['maintenance', 'support'] }
          }
        }
      }
    });
    
    if (!asset) {
      throw new Error('Asset not found');
    }
    
    let tco = 0;
    
    // Add purchase price
    if (asset.purchasePrice) {
      tco += parseFloat(asset.purchasePrice.toString());
    }
    
    // Add maintenance costs
    const maintenanceCosts = asset.maintenanceRecords.reduce((sum, record) => {
      return sum + (record.cost ? parseFloat(record.cost.toString()) : 0);
    }, 0);
    tco += maintenanceCosts;
    
    // Add contract costs
    const contractCosts = asset.contracts.reduce((sum, contract) => {
      return sum + parseFloat(contract.cost.toString());
    }, 0);
    tco += contractCosts;
    
    return tco;
  } catch (error) {
    console.error('Error calculating TCO:', error);
    return 0;
  }
}

/**
 * Generate asset QR code data
 */
export function generateAssetQRData(asset: any): string {
  const qrData = {
    assetId: asset.id,
    assetTag: asset.assetTag,
    name: asset.name,
    type: asset.assetType?.name,
    location: asset.location?.name,
    assignedTo: asset.assignedToUser?.name,
    lastUpdated: asset.updatedAt
  };
  
  return JSON.stringify(qrData);
}

/**
 * Validate asset data before creation/update
 */
export function validateAssetData(assetData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (!assetData.name || assetData.name.trim().length === 0) {
    errors.push('Asset name is required');
  }
  
  if (!assetData.assetTypeId) {
    errors.push('Asset type is required');
  }
  
  // Validate dates
  if (assetData.purchaseDate && isNaN(Date.parse(assetData.purchaseDate))) {
    errors.push('Invalid purchase date');
  }
  
  if (assetData.warrantyExpiry && isNaN(Date.parse(assetData.warrantyExpiry))) {
    errors.push('Invalid warranty expiry date');
  }
  
  if (assetData.deploymentDate && isNaN(Date.parse(assetData.deploymentDate))) {
    errors.push('Invalid deployment date');
  }
  
  // Validate prices
  if (assetData.purchasePrice && (isNaN(parseFloat(assetData.purchasePrice)) || parseFloat(assetData.purchasePrice) < 0)) {
    errors.push('Purchase price must be a positive number');
  }
  
  if (assetData.depreciationRate && (isNaN(parseFloat(assetData.depreciationRate)) || parseFloat(assetData.depreciationRate) < 0 || parseFloat(assetData.depreciationRate) > 100)) {
    errors.push('Depreciation rate must be between 0 and 100');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get asset health score based on various factors
 */
export async function calculateAssetHealthScore(assetId: number): Promise<number> {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        maintenanceRecords: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Last year
            }
          }
        },
        tickets: {
          where: {
            status: { in: ['open', 'in_progress', 'assigned'] }
          }
        }
      }
    });
    
    if (!asset) {
      return 0;
    }
    
    let healthScore = 100;
    
    // Reduce score based on asset age
    if (asset.purchaseDate) {
      const ageInYears = (Date.now() - asset.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (ageInYears > 3) {
        healthScore -= Math.min(20, (ageInYears - 3) * 5);
      }
    }
    
    // Reduce score based on condition
    const conditionScores: Record<string, number> = {
      'new': 0,
      'excellent': 0,
      'good': 10,
      'fair': 25,
      'poor': 40,
      'damaged': 60,
      'non_functional': 80
    };
    
    healthScore -= conditionScores[asset.condition] || 0;
    
    // Reduce score based on maintenance frequency
    const maintenanceCount = asset.maintenanceRecords.length;
    if (maintenanceCount > 5) {
      healthScore -= Math.min(15, (maintenanceCount - 5) * 3);
    }
    
    // Reduce score based on open tickets
    const openTicketsCount = asset.tickets.length;
    if (openTicketsCount > 0) {
      healthScore -= Math.min(20, openTicketsCount * 5);
    }
    
    // Check warranty status
    if (asset.warrantyExpiry && asset.warrantyExpiry < new Date()) {
      healthScore -= 10;
    }
    
    return Math.max(0, Math.min(100, healthScore));
  } catch (error) {
    console.error('Error calculating asset health score:', error);
    return 0;
  }
}

/**
 * Generate asset performance report
 */
export async function generateAssetReport(assetId: number, periodDays: number = 30): Promise<any> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);
    
    const [asset, tickets, maintenance, transfers] = await Promise.all([
      prisma.asset.findUnique({
        where: { id: assetId },
        include: {
          assetType: true,
          location: true,
          assignedToUser: true
        }
      }),
      
      prisma.ticket.findMany({
        where: {
          relatedAssets: {
            some: { id: assetId }
          },
          createdAt: { gte: startDate }
        },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      
      prisma.assetMaintenance.findMany({
        where: {
          assetId: assetId,
          scheduledDate: { gte: startDate }
        },
        select: {
          id: true,
          maintenanceType: true,
          title: true,
          status: true,
          cost: true,
          scheduledDate: true,
          completedDate: true
        }
      }),
      
      prisma.assetTransfer.findMany({
        where: {
          assetId: assetId,
          transferDate: { gte: startDate }
        },
        select: {
          id: true,
          transferType: true,
          status: true,
          transferDate: true
        }
      })
    ]);
    
    if (!asset) {
      throw new Error('Asset not found');
    }
    
    // Calculate metrics
    const healthScore = await calculateAssetHealthScore(assetId);
    const tco = await calculateTCO(assetId);
    
    return {
      asset: {
        id: asset.id,
        assetTag: asset.assetTag,
        name: asset.name,
        type: asset.assetType?.name,
        location: asset.location?.name,
        assignedTo: asset.assignedToUser?.name,
        status: asset.status,
        condition: asset.condition
      },
      metrics: {
        healthScore,
        totalCostOfOwnership: tco,
        ticketCount: tickets.length,
        maintenanceCount: maintenance.length,
        transferCount: transfers.length
      },
      activities: {
        tickets: tickets.map(ticket => ({
          id: ticket.id,
          title: ticket.title,
          status: ticket.status,
          priority: ticket.priority,
          createdAt: ticket.createdAt
        })),
        maintenance: maintenance.map(m => ({
          id: m.id,
          type: m.maintenanceType,
          title: m.title,
          status: m.status,
          cost: m.cost,
          scheduledDate: m.scheduledDate,
          completedDate: m.completedDate
        })),
        transfers: transfers.map(t => ({
          id: t.id,
          type: t.transferType,
          status: t.status,
          date: t.transferDate
        }))
      },
      period: {
        days: periodDays,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error generating asset report:', error);
    throw error;
  }
}

/**
 * Asset search helper function
 */
export function buildAssetSearchQuery(searchTerm: string, filters: any = {}) {
  const whereClause: any = {};
  
  // Search across multiple fields
  if (searchTerm) {
    whereClause.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { assetTag: { contains: searchTerm, mode: 'insensitive' } },
      { serialNumber: { contains: searchTerm, mode: 'insensitive' } },
      { model: { contains: searchTerm, mode: 'insensitive' } },
      { manufacturer: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } }
    ];
  }
  
  // Apply filters
  if (filters.assetTypeId) {
    whereClause.assetTypeId = parseInt(filters.assetTypeId);
  }
  
  if (filters.status) {
    whereClause.status = filters.status;
  }
  
  if (filters.condition) {
    whereClause.condition = filters.condition;
  }
  
  if (filters.locationId) {
    whereClause.locationId = parseInt(filters.locationId);
  }
  
  if (filters.assignedToUserId) {
    whereClause.assignedToUserId = parseInt(filters.assignedToUserId);
  }
  
  if (filters.category) {
    whereClause.assetType = { category: filters.category };
  }
  
  if (filters.warrantyExpiring) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    whereClause.warrantyExpiry = {
      gte: new Date(),
      lte: futureDate
    };
  }
  
  return whereClause;
}

export default {
  generateAssetTag,
  calculateDepreciation,
  calculateTCO,
  generateAssetQRData,
  validateAssetData,
  calculateAssetHealthScore,
  generateAssetReport,
  buildAssetSearchQuery
};