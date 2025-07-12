import React from 'react';
import { 
  FiPackage, 
  FiActivity, 
  FiAlertTriangle, 
  FiClock, 
  FiTrendingUp,
  FiArrowRight,
  FiTool,
  FiCalendar
} from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import ProgressBar from '../ui/ProgressBar';
import LoadingSpinner from '../ui/LoadingSpinner';

interface Asset {
  id: number;
  assetTag: string;
  name: string;
  description?: string;
  assetTypeId: number;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  assetType: {
    id: number;
    name: string;
    category: string;
    icon?: string;
  };
  status: string;
  condition: string;
  locationId?: number;
  assignedToUserId?: number;
  assignedToDeptId?: number;
  vendorId?: number;
  location?: {
    id: number;
    name: string;
  };
  assignedToUser?: {
    id: number;
    name: string;
    email: string;
  };
  purchasePrice?: number;
  purchaseDate?: string;
  warrantyExpiry?: string;
  depreciationRate?: number;
  purchaseOrderNum?: string;
  deploymentDate?: string;
  notes?: string;
  assetAttributes?: any[];
  createdAt: string;
  updatedAt: string;
  assignedToDept?: {
    id: number;
    name: string;
  };
  vendor?: {
    id: number;
    name: string;
  };
  _count: {
    tickets: number;
    maintenanceRecords: number;
    contracts: number;
  };
}

interface DashboardData {
  overview: {
    totalAssets: number;
    assetsByStatus: Array<{ status: string; count: number }>;
    assetsByType: Array<{ assetTypeId: number; typeName: string; count: number }>;
    assetsByLocation: Array<{ locationId: number; locationName: string; count: number }>;
  };
  recent: {
    assets: Asset[];
    maintenanceDue: any[];
    warrantiesExpiring: any[];
    transfersPending: any[];
  };
  alerts: {
    maintenanceDueCount: number;
    warrantiesExpiringCount: number;
    transfersPendingCount: number;
  };
}

interface AssetDashboardProps {
  data: DashboardData | null;
  isLoading: boolean;
  onAssetSelect: (asset: Asset) => void;
}

const AssetDashboard: React.FC<AssetDashboardProps> = ({ data, isLoading, onAssetSelect }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

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
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <FiPackage size={16} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalAssets}</div>
            <p className="text-xs text-muted-foreground">
              Across all locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
            <FiTool size={16} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{data.alerts.maintenanceDueCount}</div>
            <p className="text-xs text-muted-foreground">
              Next 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warranties Expiring</CardTitle>
            <FiCalendar size={16} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{data.alerts.warrantiesExpiringCount}</div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Transfers</CardTitle>
            <FiArrowRight size={16} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data.alerts.transfersPendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Assets by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.overview.assetsByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                    <span className="text-sm font-medium capitalize">{item.status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ProgressBar 
                      value={item.count} 
                      max={data.overview.totalAssets} 
                      className="w-20"
                    />
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assets by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Assets by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.overview.assetsByType.slice(0, 5).map((item) => (
                <div key={item.assetTypeId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm font-medium">{item.typeName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ProgressBar 
                      value={item.count} 
                      max={data.overview.totalAssets} 
                      className="w-20"
                    />
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assets and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Assets</CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recent.assets.slice(0, 5).map((asset) => (
                <div 
                  key={asset.id} 
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                  onClick={() => onAssetSelect(asset)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div>
                      <p className="font-medium">{asset.name}</p>
                      <p className="text-sm text-gray-600">{asset.assetTag}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(asset.status)}>
                      {asset.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(asset.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Due */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FiAlertTriangle size={16} />
              <span>Maintenance Due</span>
            </CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recent.maintenanceDue.length > 0 ? (
                data.recent.maintenanceDue.slice(0, 5).map((maintenance) => (
                  <div 
                    key={maintenance.id} 
                    className="flex items-center justify-between p-3 rounded-lg border border-yellow-200 bg-yellow-50"
                  >
                    <div className="flex items-center space-x-3">
                      <FiTool size={16} />
                      <div>
                        <p className="font-medium">{maintenance.asset.name}</p>
                        <p className="text-sm text-gray-600">{maintenance.title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                        {maintenance.maintenanceType}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        Due: {formatDate(maintenance.scheduledDate)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FiTool size={48} />
                  <p className="text-gray-500">No maintenance due</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Locations Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Assets by Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.overview.assetsByLocation.slice(0, 6).map((location) => (
              <div key={location.locationId} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{location.locationName}</h3>
                  <Badge variant="outline">{location.count}</Badge>
                </div>
                <ProgressBar 
                  value={location.count} 
                  max={data.overview.totalAssets} 
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetDashboard;