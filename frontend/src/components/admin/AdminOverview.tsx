// Admin Overview Dashboard Component
import React from 'react';
import { 
  BuildingOfficeIcon,
  DocumentTextIcon,
  CubeIcon,
  EyeIcon,
  EyeSlashIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { ServiceCatalog } from '../../types/serviceCatalog';

interface SystemStats {
  totalCatalogs: number;
  totalServiceItems: number;
  totalCustomFields: number; // Changed from totalTemplates to reflect custom fields
  serviceItemsWithFields: number; // Changed from visibleTemplates
  totalFields: number;
}

interface AdminOverviewProps {
  systemStats: SystemStats | null;
  catalogs: ServiceCatalog[];
  onRefresh: () => void;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({ systemStats, catalogs, onRefresh }) => {
  // Calculate additional statistics
  const activeServiceCatalogs = catalogs.filter(c => c.isActive).length;
  const inactiveServiceCatalogs = catalogs.length - activeServiceCatalogs;
  const itemsWithoutFields = systemStats ? systemStats.totalServiceItems - systemStats.serviceItemsWithFields : 0;

  // Get top service catalogs by template count
  const topCatalogs = catalogs
    .sort((a, b) => b.statistics.templateCount - a.statistics.templateCount)
    .slice(0, 5);

  // Get recently created catalogs
  const recentCatalogs = catalogs
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Service Catalog System Overview
          </h2>
          <button
            onClick={onRefresh}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Refresh Data
          </button>
        </div>

        {systemStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Service Catalogs */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Service Catalogs</p>
                  <p className="text-2xl font-bold text-blue-900">{systemStats.totalCatalogs}</p>
                  <p className="text-xs text-blue-700">
                    {activeServiceCatalogs} active, {inactiveServiceCatalogs} inactive
                  </p>
                </div>
              </div>
            </div>

            {/* Service Items */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CubeIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Service Items</p>
                  <p className="text-2xl font-bold text-green-900">{systemStats.totalServiceItems}</p>
                  <p className="text-xs text-green-700">
                    Across {systemStats.totalCatalogs} catalogs
                  </p>
                </div>
              </div>
            </div>

            {/* Templates */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">Custom Fields</p>
                  <p className="text-2xl font-bold text-purple-900">{systemStats.totalCustomFields}</p>
                  <p className="text-xs text-purple-700">
                    {systemStats.serviceItemsWithFields} services have fields, {itemsWithoutFields} without
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Fields */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-600">Custom Fields</p>
                  <p className="text-2xl font-bold text-orange-900">{systemStats.totalFields || 'N/A'}</p>
                  <p className="text-xs text-orange-700">
                    Total field definitions
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Service Catalogs */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Service Catalogs by Template Count
          </h3>
          <div className="space-y-3">
            {topCatalogs.map((catalog, index) => (
              <div key={catalog.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{catalog.name}</p>
                    <p className="text-sm text-gray-600">
                      {catalog.statistics.serviceItemCount} service items
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">
                    {catalog.statistics.templateCount}
                  </p>
                  <p className="text-xs text-gray-500">templates</p>
                </div>
              </div>
            ))}
            {topCatalogs.length === 0 && (
              <p className="text-gray-500 text-center py-4">No service catalogs found</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recently Created Catalogs
          </h3>
          <div className="space-y-3">
            {recentCatalogs.map((catalog) => (
              <div key={catalog.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{catalog.name}</p>
                    <p className="text-sm text-gray-600">
                      {catalog.statistics.templateCount} templates
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {new Date(catalog.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center mt-1">
                    {catalog.isActive ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <EyeIcon className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <EyeSlashIcon className="w-3 h-3 mr-1" />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {recentCatalogs.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent catalogs</p>
            )}
          </div>
        </div>
      </div>

      {/* System Health Indicators */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          System Health
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {systemStats ? Math.round((systemStats.serviceItemsWithFields / systemStats.totalServiceItems) * 100) : 0}%
            </div>
            <div className="text-sm text-green-700">Services with Custom Fields</div>
            <div className="text-xs text-gray-600 mt-1">
              {systemStats?.serviceItemsWithFields} of {systemStats?.totalServiceItems} services have fields
            </div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {systemStats ? Math.round((activeServiceCatalogs / systemStats.totalCatalogs) * 100) : 0}%
            </div>
            <div className="text-sm text-blue-700">Catalog Activity Rate</div>
            <div className="text-xs text-gray-600 mt-1">
              {activeServiceCatalogs} of {systemStats?.totalCatalogs} active
            </div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {systemStats && systemStats.totalServiceItems > 0 
                ? Math.round(systemStats.totalCustomFields / systemStats.totalServiceItems * 10) / 10
                : 0}
            </div>
            <div className="text-sm text-purple-700">Avg Fields per Service</div>
            <div className="text-xs text-gray-600 mt-1">
              Field distribution efficiency
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;