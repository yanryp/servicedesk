import React, { useState, useEffect } from 'react';
import {
  FiPackage,
  FiMapPin,
  FiUser,
  FiCalendar,
  FiEdit3,
  FiArrowRight,
  FiTool,
  FiArrowLeft,
  FiActivity,
  FiDollarSign,
  FiTrendingUp,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiLink
} from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import ProgressBar from '../ui/ProgressBar';

interface Asset {
  id: number;
  assetTag: string;
  name: string;
  description?: string;
  assetType: {
    id: number;
    name: string;
    category: string;
    icon?: string;
  };
  status: string;
  condition: string;
  location?: {
    id: number;
    name: string;
    address?: string;
  };
  assignedToUser?: {
    id: number;
    name: string;
    email: string;
    department?: string;
  };
  assignedToDept?: {
    id: number;
    name: string;
  };
  vendor?: {
    id: number;
    name: string;
    contactName?: string;
    email?: string;
  };
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  purchasePrice?: number;
  purchaseDate?: string;
  warrantyExpiry?: string;
  deploymentDate?: string;
  retirementDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lifecycleEvents?: any[];
  maintenanceRecords?: any[];
  contracts?: any[];
  transfers?: any[];
  relationships?: any[];
  tickets?: any[];
  assetAttributes?: any[];
}

interface AssetDetailProps {
  asset: Asset;
  onEdit: () => void;
  onTransfer: () => void;
  onMaintenance: () => void;
  onBack: () => void;
}

const AssetDetail: React.FC<AssetDetailProps> = ({
  asset,
  onEdit,
  onTransfer,
  onMaintenance,
  onBack
}) => {
  const [detailedAsset, setDetailedAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [healthScore, setHealthScore] = useState<number | null>(null);

  useEffect(() => {
    fetchAssetDetails();
  }, [asset.id]);

  const fetchAssetDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/assets/${asset.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDetailedAsset(data.data);
      }
    } catch (error) {
      console.error('Error fetching asset details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'retired':
        return 'bg-red-100 text-red-800';
      case 'disposed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new':
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-orange-100 text-orange-800';
      case 'damaged':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hardware':
        return '💻';
      case 'software':
        return '💾';
      case 'network':
        return '🌐';
      case 'security':
        return '🔐';
      case 'facilities':
        return '🏢';
      default:
        return '📦';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const calculateDepreciation = () => {
    if (!detailedAsset?.purchasePrice || !detailedAsset?.purchaseDate) return null;
    
    const purchaseDate = new Date(detailedAsset.purchaseDate);
    const now = new Date();
    const ageInYears = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    // Simple straight-line depreciation over 5 years
    const depreciationRate = 0.2; // 20% per year
    const depreciation = Math.min(detailedAsset.purchasePrice * depreciationRate * ageInYears, detailedAsset.purchasePrice);
    const currentValue = Math.max(detailedAsset.purchasePrice - depreciation, 0);
    
    return {
      originalValue: detailedAsset.purchasePrice,
      currentValue,
      depreciation,
      depreciationPercentage: (depreciation / detailedAsset.purchasePrice) * 100
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!detailedAsset) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Asset not found</p>
      </div>
    );
  }

  const depreciationData = calculateDepreciation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <FiArrowLeft size={16} />
            Back to Assets
          </Button>
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{getCategoryIcon(detailedAsset.assetType.category)}</span>
            <div>
              <h1 className="text-2xl font-bold">{detailedAsset.name}</h1>
              <p className="text-gray-600">{detailedAsset.assetTag}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={onMaintenance}>
            <FiTool size={16} />
            Maintenance
          </Button>
          <Button variant="outline" onClick={onTransfer}>
            <FiArrowRight size={16} />
            Transfer
          </Button>
          <Button onClick={onEdit}>
            <FiEdit3 size={16} />
            Edit
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="flex items-center space-x-3">
              <FiActivity size={32} />
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <Badge className={getStatusColor(detailedAsset.status)}>
                  {detailedAsset.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="flex items-center space-x-3">
              <FiCheckCircle size={32} />
              <div>
                <p className="text-sm font-medium text-gray-600">Condition</p>
                <Badge className={getConditionColor(detailedAsset.condition)}>
                  {detailedAsset.condition}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="flex items-center space-x-3">
              <FiDollarSign size={32} />
              <div>
                <p className="text-sm font-medium text-gray-600">Value</p>
                <p className="text-lg font-bold">
                  {depreciationData ? formatCurrency(depreciationData.currentValue) : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="flex items-center space-x-3">
              <FiTrendingUp size={32} />
              <div>
                <p className="text-sm font-medium text-gray-600">Health Score</p>
                <p className={`text-lg font-bold ${healthScore ? getHealthScoreColor(healthScore) : 'text-gray-500'}`}>
                  {healthScore ? `${healthScore}/100` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Asset Type</label>
                    <p className="text-sm">{detailedAsset.assetType.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Category</label>
                    <p className="text-sm capitalize">{detailedAsset.assetType.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Serial Number</label>
                    <p className="text-sm">{detailedAsset.serialNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Model</label>
                    <p className="text-sm">{detailedAsset.model || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Manufacturer</label>
                    <p className="text-sm">{detailedAsset.manufacturer || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Purchase Date</label>
                    <p className="text-sm">
                      {detailedAsset.purchaseDate ? formatDate(detailedAsset.purchaseDate) : 'N/A'}
                    </p>
                  </div>
                </div>
                
                {detailedAsset.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="text-sm">{detailedAsset.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assignment & Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Location</label>
                  <div className="flex items-center space-x-2">
                    <FiMapPin size={16} />
                    <p className="text-sm">{detailedAsset.location?.name || 'Unassigned'}</p>
                  </div>
                  {detailedAsset.location?.address && (
                    <p className="text-xs text-gray-500 ml-6">{detailedAsset.location.address}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Assigned To</label>
                  <div className="flex items-center space-x-2">
                    <FiUser size={16} />
                    <p className="text-sm">{detailedAsset.assignedToUser?.name || 'Unassigned'}</p>
                  </div>
                  {detailedAsset.assignedToUser?.email && (
                    <p className="text-xs text-gray-500 ml-6">{detailedAsset.assignedToUser.email}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Department</label>
                  <p className="text-sm">{detailedAsset.assignedToDept?.name || 'Unassigned'}</p>
                </div>

                {detailedAsset.vendor && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Vendor</label>
                    <p className="text-sm">{detailedAsset.vendor.name}</p>
                    {detailedAsset.vendor.contactName && (
                      <p className="text-xs text-gray-500">Contact: {detailedAsset.vendor.contactName}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              {detailedAsset.assetAttributes && detailedAsset.assetAttributes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detailedAsset.assetAttributes.map((attr, index) => (
                    <div key={index}>
                      <label className="text-sm font-medium text-gray-600">{attr.attribute?.label}</label>
                      <p className="text-sm">{attr.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No technical specifications available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Purchase Price</label>
                    <p className="text-sm">
                      {detailedAsset.purchasePrice ? formatCurrency(detailedAsset.purchasePrice) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Current Value</label>
                    <p className="text-sm">
                      {depreciationData ? formatCurrency(depreciationData.currentValue) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Warranty Expires</label>
                    <p className="text-sm">
                      {detailedAsset.warrantyExpiry ? formatDate(detailedAsset.warrantyExpiry) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Depreciation</label>
                    <p className="text-sm">
                      {depreciationData ? `${depreciationData.depreciationPercentage.toFixed(1)}%` : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {depreciationData && (
              <Card>
                <CardHeader>
                  <CardTitle>Depreciation Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Original Value</span>
                      <span className="text-sm font-medium">{formatCurrency(depreciationData.originalValue)}</span>
                    </div>
                    <ProgressBar 
                      value={depreciationData.currentValue} 
                      max={depreciationData.originalValue} 
                      className="w-full"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Value</span>
                      <span className="text-sm font-medium">{formatCurrency(depreciationData.currentValue)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Records</CardTitle>
            </CardHeader>
            <CardContent>
              {detailedAsset.maintenanceRecords && detailedAsset.maintenanceRecords.length > 0 ? (
                <div className="space-y-4">
                  {detailedAsset.maintenanceRecords.map((record, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <FiTool size={20} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{record.title}</h4>
                          <Badge variant="outline">{record.maintenanceType}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{record.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Scheduled: {formatDate(record.scheduledDate)}</span>
                          {record.completedDate && (
                            <span>Completed: {formatDate(record.completedDate)}</span>
                          )}
                          {record.cost && (
                            <span>Cost: {formatCurrency(record.cost)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No maintenance records available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset History</CardTitle>
            </CardHeader>
            <CardContent>
              {detailedAsset.lifecycleEvents && detailedAsset.lifecycleEvents.length > 0 ? (
                <div className="space-y-4">
                  {detailedAsset.lifecycleEvents.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <FiActivity size={20} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{event.description}</h4>
                          <Badge variant="outline">{event.eventType}</Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{formatDate(event.eventDate)}</span>
                          {event.user && <span>by {event.user.name}</span>}
                        </div>
                        {event.notes && (
                          <p className="text-sm text-gray-600 mt-1">{event.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No history available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relationships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Relationships</CardTitle>
            </CardHeader>
            <CardContent>
              {detailedAsset.relationships && detailedAsset.relationships.length > 0 ? (
                <div className="space-y-4">
                  {detailedAsset.relationships.map((relationship, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <FiLink size={20} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{relationship.childAsset?.name}</h4>
                          <Badge variant="outline">{relationship.relationshipType}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{relationship.childAsset?.assetTag}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No relationships configured</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssetDetail;