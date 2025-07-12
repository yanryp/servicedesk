import React, { useState } from 'react';
import {
  FiPackage,
  FiMapPin,
  FiUser,
  FiCalendar,
  FiEdit3,
  FiArrowRight,
  FiTool,
  FiMoreVertical,
  FiEye,
  FiSearch,
  FiFilter
} from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import LoadingSpinner from '../ui/LoadingSpinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

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
  assignedToDept?: {
    id: number;
    name: string;
  };
  vendor?: {
    id: number;
    name: string;
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
  _count: {
    tickets: number;
    maintenanceRecords: number;
    contracts: number;
  };
}

interface AssetListProps {
  assets: Asset[];
  isLoading: boolean;
  onAssetSelect: (asset: Asset) => void;
  onAssetEdit: (asset: Asset) => void;
  onAssetTransfer: (asset: Asset) => void;
  onAssetMaintenance: (asset: Asset) => void;
}

const AssetList: React.FC<AssetListProps> = ({
  assets,
  isLoading,
  onAssetSelect,
  onAssetEdit,
  onAssetTransfer,
  onAssetMaintenance
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortField, setSortField] = useState<string>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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
      month: 'short',
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="mb-4">
            <FiPackage size={64} color="#9CA3AF" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Assets Found</h3>
          <p className="text-gray-500 text-center">
            Get started by adding your first asset to the system.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Assets ({assets.length})</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Table
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{getCategoryIcon(asset.assetType.category)}</span>
                        <div>
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-sm text-gray-500">{asset.assetTag}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{asset.assetType.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(asset.status)}>
                        {asset.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getConditionColor(asset.condition)}>
                        {asset.condition}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <FiMapPin size={16} color="#9CA3AF" />
                        <span className="text-sm">{asset.location?.name || 'Unassigned'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <FiUser size={16} color="#9CA3AF" />
                        <span className="text-sm">{asset.assignedToUser?.name || 'Unassigned'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <FiCalendar size={16} color="#9CA3AF" />
                        <span className="text-sm">
                          {asset.purchaseDate ? formatDate(asset.purchaseDate) : 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {asset.purchasePrice ? formatCurrency(asset.purchasePrice) : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <FiMoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onAssetSelect(asset)}>
                            <span className="mr-2"><FiEye size={16} /></span>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onAssetEdit(asset)}>
                            <span className="mr-2"><FiEdit3 size={16} /></span>
                            Edit Asset
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onAssetTransfer(asset)}>
                            <span className="mr-2"><FiArrowRight size={16} /></span>
                            Transfer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onAssetMaintenance(asset)}>
                            <span className="mr-2"><FiTool size={16} /></span>
                            Maintenance
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map((asset) => (
              <Card key={asset.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getCategoryIcon(asset.assetType.category)}</span>
                      <div>
                        <h3 className="font-medium">{asset.name}</h3>
                        <p className="text-sm text-gray-500">{asset.assetTag}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <FiMoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onAssetSelect(asset)}>
                          <span className="mr-2"><FiEye size={16} /></span>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAssetEdit(asset)}>
                          <span className="mr-2"><FiEdit3 size={16} /></span>
                          Edit Asset
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAssetTransfer(asset)}>
                          <span className="mr-2"><FiArrowRight size={16} /></span>
                          Transfer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAssetMaintenance(asset)}>
                          <span className="mr-2"><FiTool size={16} /></span>
                          Maintenance
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Type:</span>
                      <Badge variant="outline">{asset.assetType.name}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Status:</span>
                      <Badge className={getStatusColor(asset.status)}>
                        {asset.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Condition:</span>
                      <Badge className={getConditionColor(asset.condition)}>
                        {asset.condition}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Location:</span>
                      <span className="text-sm">{asset.location?.name || 'Unassigned'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Assigned:</span>
                      <span className="text-sm">{asset.assignedToUser?.name || 'Unassigned'}</span>
                    </div>

                    {asset.purchasePrice && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Value:</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(asset.purchasePrice)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Tickets: {asset._count.tickets}</span>
                      <span>Maintenance: {asset._count.maintenanceRecords}</span>
                      <span>Contracts: {asset._count.contracts}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssetList;