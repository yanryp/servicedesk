// Global Custom Fields Management Component
import React, { useState, useEffect } from 'react';
import {
  AdjustmentsHorizontalIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { ServiceCatalog } from '../../types/serviceCatalog';
import ServiceItemCustomFields from './ServiceItemCustomFields';
import toast from 'react-hot-toast';

interface ServiceItem {
  id: number;
  name: string;
  description: string | null;
  serviceCatalogId: number;
  serviceCatalog: {
    id: number;
    name: string;
  };
  statistics: {
    customFieldCount?: number;
    hasCustomFields?: boolean;
  };
}

interface CustomFieldsManagerProps {
  catalogs: ServiceCatalog[];
  onRefresh: () => void;
}

const CustomFieldsManager: React.FC<CustomFieldsManagerProps> = ({ 
  catalogs, 
  onRefresh 
}) => {
  const [selectedServiceItem, setSelectedServiceItem] = useState<ServiceItem | null>(null);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByFields, setFilterByFields] = useState<'all' | 'with_fields' | 'without_fields'>('all');

  useEffect(() => {
    loadAllServiceItems();
  }, [catalogs]);

  useEffect(() => {
    applyFilters();
  }, [serviceItems, searchTerm, filterByFields]);

  const loadAllServiceItems = async () => {
    if (catalogs.length === 0) return;
    
    try {
      setLoading(true);
      const allItems: ServiceItem[] = [];
      
      // Load service items from all catalogs
      for (const catalog of catalogs) {
        try {
          const response = await fetch(`http://localhost:3001/api/service-catalog-admin/catalogs/${catalog.id}/items`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
              allItems.push(...result.data);
            }
          }
        } catch (error) {
          console.error(`Error loading items for catalog ${catalog.name}:`, error);
        }
      }
      
      setServiceItems(allItems);
    } catch (error: any) {
      console.error('Error loading service items:', error);
      toast.error('Failed to load service items');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = serviceItems;

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(search) ||
        item.serviceCatalog.name.toLowerCase().includes(search) ||
        (item.description && item.description.toLowerCase().includes(search))
      );
    }

    // Apply field filter
    if (filterByFields === 'with_fields') {
      filtered = filtered.filter(item => item.statistics?.hasCustomFields === true);
    } else if (filterByFields === 'without_fields') {
      filtered = filtered.filter(item => !item.statistics?.hasCustomFields);
    }

    setFilteredItems(filtered);
  };

  const handleSelectServiceItem = (item: ServiceItem) => {
    setSelectedServiceItem(item);
  };

  const handleBack = () => {
    setSelectedServiceItem(null);
    loadAllServiceItems(); // Refresh data when going back
    onRefresh(); // Refresh parent data
  };

  const handleFieldsChange = () => {
    loadAllServiceItems(); // Refresh the list when fields change
    onRefresh(); // Refresh parent data
  };

  // If a service item is selected, show its custom fields management
  if (selectedServiceItem) {
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Service Items
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Custom Fields for "{selectedServiceItem.name}"
            </h2>
            <p className="text-sm text-gray-600">
              Service Catalog: {selectedServiceItem.serviceCatalog.name}
            </p>
          </div>
        </div>

        {/* Custom Fields Management */}
        <ServiceItemCustomFields
          serviceItemId={selectedServiceItem.id}
          serviceItemName={selectedServiceItem.name}
          onFieldsChange={handleFieldsChange}
        />
      </div>
    );
  }

  // Main service items list view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Custom Fields Management</h2>
          <p className="text-sm text-gray-600">
            Select a service item to manage its custom fields
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
          <span>{filteredItems.length} service items</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search service items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filter by fields */}
          <div className="sm:w-48">
            <select
              value={filterByFields}
              onChange={(e) => setFilterByFields(e.target.value as any)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Items</option>
              <option value="with_fields">With Custom Fields</option>
              <option value="without_fields">Without Custom Fields</option>
            </select>
          </div>
        </div>
      </div>

      {/* Service Items List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading service items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No service items found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterByFields !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No service items available to manage custom fields.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleSelectServiceItem(item)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <AdjustmentsHorizontalIcon className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {item.serviceCatalog.name}
                        </p>
                        {item.description && (
                          <p className="text-xs text-gray-400 truncate mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Custom Fields Count */}
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {item.statistics?.customFieldCount || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        Custom Fields
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      {item.statistics?.hasCustomFields ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Has Fields
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          No Fields
                        </span>
                      )}
                    </div>
                    
                    {/* Arrow */}
                    <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {!loading && filteredItems.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div>
                <span className="font-medium text-blue-900">Total Service Items:</span>
                <span className="ml-1 text-blue-700">{filteredItems.length}</span>
              </div>
              <div>
                <span className="font-medium text-blue-900">With Custom Fields:</span>
                <span className="ml-1 text-blue-700">
                  {filteredItems.filter(item => item.statistics?.hasCustomFields).length}
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-900">Total Custom Fields:</span>
                <span className="ml-1 text-blue-700">
                  {filteredItems.reduce((sum, item) => sum + (item.statistics?.customFieldCount || 0), 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomFieldsManager;