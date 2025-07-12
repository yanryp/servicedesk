import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FiSearch, 
  FiPlus, 
  FiFilter, 
  FiDownload, 
  FiUpload,
  FiPackage,
  FiMonitor,
  FiSettings,
  FiBarChart,
  FiList,
  FiTool,
  FiChevronRight
} from 'react-icons/fi';
import { 
  AssetDashboard,
  AssetList,
  AssetDetail,
  AssetForm,
  AssetTransferForm,
  AssetMaintenanceForm,
  AssetImportForm
} from '../components/assets';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

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

const AssetManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    assetTypeId: '',
    locationId: '',
    category: ''
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardData();
    } else if (activeTab === 'assets') {
      fetchAssets();
    }
  }, [activeTab, filters]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/assets/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search: searchQuery,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });

      const response = await fetch(`/api/assets?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAssets(data.data.assets);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(location.search);
    params.set('tab', tab);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
    setActiveTab('detail');
  };

  const handleAssetSave = async (assetData: any) => {
    try {
      const method = selectedAsset ? 'PUT' : 'POST';
      const url = selectedAsset ? `/api/assets/${selectedAsset.id}` : '/api/assets';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(assetData)
      });

      if (response.ok) {
        setShowAssetForm(false);
        setSelectedAsset(null);
        fetchAssets();
      }
    } catch (error) {
      console.error('Error saving asset:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <FiPackage size={32} color="#2563EB" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Asset Management</h1>
                <p className="text-gray-600">ITIL-compliant asset lifecycle management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowImportForm(true)}
                className="flex items-center space-x-2"
              >
                <FiUpload size={16} />
                <span>Import</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => {/* Export functionality */}}
                className="flex items-center space-x-2"
              >
                <FiDownload size={16} />
                <span>Export</span>
              </Button>
              <Button
                onClick={() => setShowAssetForm(true)}
                className="flex items-center space-x-2"
              >
                <FiPlus size={16} />
                <span>Add Asset</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <FiBarChart size={16} />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center space-x-2">
              <FiList size={16} />
              <span>Assets</span>
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center space-x-2">
              <FiTool size={16} />
              <span>Maintenance</span>
            </TabsTrigger>
            <TabsTrigger value="cmdb" className="flex items-center space-x-2">
              <FiSettings size={16} />
              <span>CMDB</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <FiBarChart size={16} />
              <span>Reports</span>
            </TabsTrigger>
            <TabsTrigger value="detail" className="flex items-center space-x-2" disabled={!selectedAsset}>
              <FiMonitor size={16} />
              <span>Detail</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <AssetDashboard 
              data={dashboardData} 
              isLoading={isLoading}
              onAssetSelect={handleAssetSelect}
            />
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FiSearch size={16} />
                  </div>
                  <Input
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {/* Show filters */}}
                  className="flex items-center space-x-2"
                >
                  <FiFilter size={16} />
                  <span>Filters</span>
                </Button>
              </div>
            </div>

            <AssetList 
              assets={assets}
              isLoading={isLoading}
              onAssetSelect={handleAssetSelect}
              onAssetEdit={(asset) => {
                setSelectedAsset(asset);
                setShowAssetForm(true);
              }}
              onAssetTransfer={(asset) => {
                setSelectedAsset(asset);
                setShowTransferForm(true);
              }}
              onAssetMaintenance={(asset) => {
                setSelectedAsset(asset);
                setShowMaintenanceForm(true);
              }}
            />
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Maintenance schedules and records will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cmdb" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration Management Database</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">CMDB views and configuration items will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Asset Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Asset reports and analytics will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detail" className="space-y-6">
            {selectedAsset && (
              <AssetDetail 
                asset={selectedAsset}
                onEdit={() => setShowAssetForm(true)}
                onTransfer={() => setShowTransferForm(true)}
                onMaintenance={() => setShowMaintenanceForm(true)}
                onBack={() => setActiveTab('assets')}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {showAssetForm && (
        <AssetForm
          asset={selectedAsset}
          onSave={handleAssetSave}
          onClose={() => {
            setShowAssetForm(false);
            setSelectedAsset(null);
          }}
        />
      )}

      {showImportForm && (
        <AssetImportForm
          onImport={(data) => {
            // Handle import
            setShowImportForm(false);
            fetchAssets();
          }}
          onClose={() => setShowImportForm(false)}
        />
      )}

      {showTransferForm && selectedAsset && (
        <AssetTransferForm
          asset={selectedAsset}
          onTransfer={(data) => {
            // Handle transfer
            setShowTransferForm(false);
            setSelectedAsset(null);
          }}
          onClose={() => {
            setShowTransferForm(false);
            setSelectedAsset(null);
          }}
        />
      )}

      {showMaintenanceForm && selectedAsset && (
        <AssetMaintenanceForm
          asset={selectedAsset}
          onSave={(data) => {
            // Handle maintenance
            setShowMaintenanceForm(false);
            setSelectedAsset(null);
          }}
          onClose={() => {
            setShowMaintenanceForm(false);
            setSelectedAsset(null);
          }}
        />
      )}
    </div>
  );
};

export default AssetManagementPage;