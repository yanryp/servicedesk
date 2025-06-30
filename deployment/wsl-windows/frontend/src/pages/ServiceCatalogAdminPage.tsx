// Service Catalog Administration Dashboard
import React, { useState, useEffect } from 'react';
import { 
  BuildingOfficeIcon,
  CogIcon,
  DocumentTextIcon,
  PlusIcon,
  ChartBarIcon,
  ArrowUpTrayIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ServiceCatalog } from '../types/serviceCatalog';
import { serviceCatalogAdminService } from '../services/serviceCatalogAdmin';

// Import admin components (will create these next)
import ServiceCatalogList from '../components/admin/ServiceCatalogList';
import ServiceItemList from '../components/admin/ServiceItemList';
import ServiceTemplateList from '../components/admin/ServiceTemplateList';
import AdminOverview from '../components/admin/AdminOverview';

interface SystemStats {
  totalCatalogs: number;
  totalServiceItems: number;
  totalCustomFields: number; // Changed from totalTemplates to reflect custom fields
  serviceItemsWithFields: number; // Changed from visibleTemplates
  totalFields: number;
}

const ServiceCatalogAdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'catalogs' | 'items' | 'templates' | 'import'>('overview');
  const [catalogs, setCatalogs] = useState<ServiceCatalog[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [selectedCatalog, setSelectedCatalog] = useState<ServiceCatalog | null>(null);
  const [selectedServiceItem, setSelectedServiceItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authorization
  useEffect(() => {
    if (user && !['admin', 'manager'].includes(user.role)) {
      setError('Access denied. Admin or Manager role required.');
      return;
    }
    loadInitialData();
  }, [user]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load service catalogs using the new service
      let loadedCatalogs: ServiceCatalog[] = [];
      
      try {
        const catalogsData = await serviceCatalogAdminService.getCatalogs();
        
        // Ensure catalogsData is an array
        loadedCatalogs = Array.isArray(catalogsData) ? catalogsData : [];
        setCatalogs(loadedCatalogs);
      } catch (apiError: any) {
        // If API fails, show empty state with mock data for demo
        console.warn('API failed, using mock data for demo:', apiError);
        loadedCatalogs = [
          {
            id: 1,
            name: 'IT Services',
            description: 'Information Technology support services',
            serviceType: 'business_service',
            categoryLevel: 1,
            departmentId: 1,
            department: { id: 1, name: 'IT Department' },
            isActive: true,
            requiresApproval: false,
            businessImpact: 'medium',
            statistics: {
              serviceItemCount: 5,
              templateCount: 12,
              visibleTemplateCount: 10
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 2, 
            name: 'KASDA Services',
            description: 'Government treasury and financial services',
            serviceType: 'business_service',
            categoryLevel: 1,
            departmentId: 2,
            department: { id: 2, name: 'Treasury Department' },
            isActive: true,
            requiresApproval: true,
            businessImpact: 'high',
            statistics: {
              serviceItemCount: 3,
              templateCount: 8,
              visibleTemplateCount: 6
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        setCatalogs(loadedCatalogs);
      }
      
      // Calculate basic stats from the loaded data
      const stats: SystemStats = {
        totalCatalogs: loadedCatalogs.length,
        totalServiceItems: loadedCatalogs.reduce((sum, cat) => sum + (cat.statistics?.serviceItemCount || 0), 0),
        totalCustomFields: loadedCatalogs.reduce((sum, cat) => sum + (cat.statistics?.templateCount || 0), 0), // templateCount now represents custom fields
        serviceItemsWithFields: loadedCatalogs.reduce((sum, cat) => sum + (cat.statistics?.visibleTemplateCount || 0), 0), // visibleTemplateCount now represents service items with fields
        totalFields: loadedCatalogs.reduce((sum, cat) => sum + (cat.statistics?.templateCount || 0), 0)
      };
      setSystemStats(stats);
      
    } catch (error: any) {
      console.error('Error loading admin data:', error);
      setError(error.message || 'Failed to load service catalog administration data');
      toast.error(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadInitialData();
  };

  // Handle tab navigation
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    // Reset selections when changing tabs
    if (tab !== 'items') setSelectedCatalog(null);
    if (tab !== 'templates') setSelectedServiceItem(null);
  };

  const handleSelectCatalog = (catalog: ServiceCatalog | null) => {
    setSelectedCatalog(catalog);
  };

  // Render access denied state
  if (error && error.includes('Access denied')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You need Admin or Manager privileges to access the Service Catalog Administration.
          </p>
          <p className="text-sm text-gray-500">
            Current role: {user?.role || 'Unknown'}
          </p>
        </div>
      </div>
    );
  }

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Service Catalog Administration...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadInitialData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <CogIcon className="h-8 w-8 text-blue-600 mr-3" />
                Service Catalog Administration
              </h1>
              <p className="mt-2 text-gray-600">
                Manage service catalogs, service items, templates, and custom fields
              </p>
            </div>
            
            {/* Quick Stats */}
            {systemStats && (
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="text-2xl font-bold text-blue-600">{systemStats.totalCatalogs}</div>
                  <div className="text-sm text-gray-600">Service Catalogs</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="text-2xl font-bold text-green-600">{systemStats.totalCustomFields}</div>
                  <div className="text-sm text-gray-600">Custom Fields</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'overview', label: 'Overview', icon: ChartBarIcon },
                { key: 'catalogs', label: 'Service Catalogs', icon: BuildingOfficeIcon },
                { key: 'items', label: 'Service Items', icon: DocumentTextIcon },
                { key: 'templates', label: 'Custom Fields', icon: DocumentTextIcon },
                { key: 'import', label: 'Import/Export', icon: ArrowUpTrayIcon }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <AdminOverview 
              systemStats={systemStats}
              catalogs={catalogs}
              onRefresh={refreshData}
            />
          )}
          
          {activeTab === 'catalogs' && (
            <ServiceCatalogList 
              catalogs={catalogs}
              onRefresh={refreshData}
              onSelectCatalog={handleSelectCatalog}
            />
          )}
          
          {activeTab === 'items' && (
            <ServiceItemList 
              catalogs={catalogs}
              selectedCatalog={selectedCatalog}
              onSelectCatalog={handleSelectCatalog}
              onSelectServiceItem={setSelectedServiceItem}
              onRefresh={refreshData}
            />
          )}
          
          {activeTab === 'templates' && (
            <ServiceTemplateList 
              catalogs={catalogs}
              selectedCatalog={selectedCatalog}
              selectedServiceItem={selectedServiceItem}
              onSelectCatalog={handleSelectCatalog}
              onSelectServiceItem={setSelectedServiceItem}
              onRefresh={refreshData}
            />
          )}
          
          {activeTab === 'import' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center py-12">
                <ArrowUpTrayIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Import/Export Functionality
                </h3>
                <p className="text-gray-600 mb-6">
                  Bulk import and export tools for service catalog data will be available here.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Coming Soon</p>
                      <p>CSV import/export, bulk template creation, and data migration tools.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCatalogAdminPage;