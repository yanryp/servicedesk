// Service Item Management Component - Full CRUD Implementation
import React, { useState, useEffect } from 'react';
import { 
  CubeIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { ServiceCatalog } from '../../types/serviceCatalog';
import ServiceItemCustomFields from './ServiceItemCustomFields';

interface ServiceItem {
  id: number;
  name: string;
  description: string | null;
  requestType: string;
  isKasdaRelated: boolean;
  requiresGovApproval: boolean;
  isActive: boolean;
  sortOrder: number;
  serviceCatalogId: number;
  serviceCatalog: {
    id: number;
    name: string;
  };
  statistics: {
    templateCount: number;
    visibleTemplateCount: number;
    totalFields: number;
    customFieldCount?: number;
    hasCustomFields?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface ServiceItemListProps {
  catalogs: ServiceCatalog[];
  selectedCatalog: ServiceCatalog | null;
  onSelectCatalog: (catalog: ServiceCatalog | null) => void;
  onSelectServiceItem: (item: ServiceItem | null) => void;
  onRefresh: () => void;
}

const ServiceItemList: React.FC<ServiceItemListProps> = ({ 
  catalogs, 
  selectedCatalog, 
  onSelectCatalog,
  onSelectServiceItem,
  onRefresh 
}) => {
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<ServiceItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [managingFieldsFor, setManagingFieldsFor] = useState<ServiceItem | null>(null);

  // Load service items when catalog is selected
  useEffect(() => {
    if (selectedCatalog) {
      loadServiceItems();
    }
  }, [selectedCatalog]);

  const loadServiceItems = async () => {
    if (!selectedCatalog) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/service-catalog-admin/catalogs/${selectedCatalog.id}/items`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load service items');
      }

      const result = await response.json();
      if (result.success) {
        setServiceItems(result.data);
      } else {
        throw new Error(result.message || 'Failed to load service items');
      }
    } catch (error: any) {
      console.error('Error loading service items:', error);
      toast.error(error.message || 'Failed to load service items');
      setServiceItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingItem(null);
    setShowEditor(true);
  };

  const handleEdit = (item: ServiceItem) => {
    setEditingItem(item);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingItem(null);
  };

  const handleSave = () => {
    setShowEditor(false);
    setEditingItem(null);
    loadServiceItems();
    onRefresh(); // Refresh parent catalog data
    toast.success(editingItem ? 'Service item updated successfully' : 'Service item created successfully');
  };

  const handleDeleteClick = (item: ServiceItem) => {
    if (item.statistics.templateCount > 0) {
      toast.error(`Cannot delete "${item.name}". It contains ${item.statistics.templateCount} template(s). Please delete all templates first.`);
      return;
    }
    setShowDeleteConfirm(item);
  };

  const handleConfirmDelete = async () => {
    if (!showDeleteConfirm) return;

    try {
      setIsDeleting(true);
      
      const response = await fetch(`http://localhost:3001/api/service-catalog-admin/items/${showDeleteConfirm.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete service item');
      }

      toast.success('Service item deleted successfully');
      loadServiceItems();
      onRefresh(); // Refresh parent catalog data
    } catch (error: any) {
      console.error('Error deleting service item:', error);
      toast.error(error.message || 'Failed to delete service item');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(null);
    }
  };

  // Render catalog selection screen
  if (!selectedCatalog) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Service Item Management</h2>
            <p className="text-gray-600">
              Manage service items within your service catalogs
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <CubeIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Service Catalog</h3>
            <p className="text-gray-600 mb-6">
              Choose a service catalog to view and manage its service items.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {catalogs.map((catalog) => (
                <button
                  key={catalog.id}
                  onClick={() => onSelectCatalog(catalog)}
                  className="p-4 text-left bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{catalog.name}</h4>
                      <p className="text-sm text-gray-600">
                        {catalog.statistics.serviceItemCount} service items
                      </p>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                  </div>
                </button>
              ))}
            </div>

            {catalogs.length === 0 && (
              <p className="text-gray-500 mt-6">No service catalogs found. Create a service catalog first.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render service items for selected catalog
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onSelectCatalog(null)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
            title="Back to catalog selection"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Service Items</h2>
            <p className="text-gray-600">
              Managing items in "{selectedCatalog.name}" catalog
            </p>
          </div>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Service Item
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading service items...</p>
          </div>
        </div>
      )}

      {/* Service Items Grid */}
      {!loading && (
        <>
          {serviceItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <CubeIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {item.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {item.description || 'No description provided'}
                      </p>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="ml-2">
                      {item.isActive ? (
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

                  {/* Metadata */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Request Type:</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {item.requestType.replace('_', ' ')}
                      </span>
                    </div>
                    {item.isKasdaRelated && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">KASDA Related:</span>
                        <span className="text-orange-600 font-medium">Yes</span>
                      </div>
                    )}
                    {item.requiresGovApproval && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Gov Approval:</span>
                        <span className="text-red-600 font-medium">Required</span>
                      </div>
                    )}
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {item.statistics.customFieldCount || item.statistics.templateCount || 0}
                      </div>
                      <div className="text-xs text-blue-700">Custom Fields</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {item.statistics.visibleTemplateCount}
                      </div>
                      <div className="text-xs text-green-700">Legacy Templates</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setManagingFieldsFor(item)}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center"
                      >
                        <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1" />
                        Custom Fields ({item.statistics.customFieldCount || item.statistics.templateCount || 0})
                      </button>
                      <button
                        onClick={() => onSelectServiceItem(item)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Legacy Templates ({item.statistics.visibleTemplateCount || 0})
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Edit service item"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item)}
                        disabled={item.statistics.templateCount > 0}
                        className={`p-2 rounded-md ${
                          item.statistics.templateCount > 0
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title={
                          item.statistics.templateCount > 0
                            ? 'Cannot delete - contains templates'
                            : 'Delete service item'
                        }
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <CubeIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Service Items</h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first service item in "{selectedCatalog.name}".
              </p>
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create First Service Item
              </button>
            </div>
          )}
        </>
      )}

      {/* Service Item Editor Modal */}
      {showEditor && (
        <ServiceItemEditor
          item={editingItem}
          catalogId={selectedCatalog.id}
          onSave={handleSave}
          onCancel={handleCloseEditor}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Delete Service Item</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{showDeleteConfirm.name}"? This action cannot be undone.
            </p>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Fields Management Modal */}
      {managingFieldsFor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Custom Fields Management
                </h3>
                <button
                  onClick={() => setManagingFieldsFor(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <ServiceItemCustomFields
                serviceItemId={managingFieldsFor.id}
                serviceItemName={managingFieldsFor.name}
                onFieldsChange={() => {
                  // Refresh the service items list to update statistics
                  loadServiceItems();
                  // Notify parent to refresh if needed
                  onRefresh();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Service Item Editor Component
interface ServiceItemEditorProps {
  item: ServiceItem | null;
  catalogId: number;
  onSave: () => void;
  onCancel: () => void;
}

const ServiceItemEditor: React.FC<ServiceItemEditorProps> = ({
  item,
  catalogId,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isKasdaRelated: false,
    requiresGovApproval: false,
    isActive: true,
    sortOrder: 0,
    // Classification Configuration
    availableRootCauses: ['human_error', 'system_error', 'external_factor', 'undetermined'],
    availableIssueTypes: ['request', 'problem', 'incident', 'complaint'],
    defaultRootCause: 'undetermined',
    defaultIssueType: 'request'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = item !== null;

  // Load form data if editing
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || '',
        isKasdaRelated: item.isKasdaRelated,
        requiresGovApproval: item.requiresGovApproval,
        isActive: item.isActive,
        sortOrder: item.sortOrder,
        // Load existing classification config or use defaults
        availableRootCauses: (item as any).availableRootCauses || ['human_error', 'system_error', 'external_factor', 'undetermined'],
        availableIssueTypes: (item as any).availableIssueTypes || ['request', 'problem', 'incident', 'complaint'],
        defaultRootCause: (item as any).defaultRootCause || 'undetermined',
        defaultIssueType: (item as any).defaultIssueType || 'request'
      });
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : type === 'number' 
          ? parseInt(value) || 0
          : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Service item name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Service item name must be at least 3 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);

      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        isKasdaRelated: formData.isKasdaRelated,
        requiresGovApproval: formData.requiresGovApproval,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder,
        // Classification Configuration
        availableRootCauses: formData.availableRootCauses,
        availableIssueTypes: formData.availableIssueTypes,
        defaultRootCause: formData.defaultRootCause,
        defaultIssueType: formData.defaultIssueType
      };

      const url = isEditing 
        ? `http://localhost:3001/api/service-catalog-admin/items/${item.id}`
        : `http://localhost:3001/api/service-catalog-admin/catalogs/${catalogId}/items`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Failed to ${isEditing ? 'update' : 'create'} service item`);
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving service item:', error);
      toast.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} service item`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <CubeIcon className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">
              {isEditing ? 'Edit Service Item' : 'Create New Service Item'}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Basic Information</h4>
            
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Service Item Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter service item name"
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the service item"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <h4 className="text-md font-medium text-gray-900">Configuration</h4>
            

            {/* Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isKasdaRelated"
                  name="isKasdaRelated"
                  checked={formData.isKasdaRelated}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isKasdaRelated" className="ml-2 text-sm text-gray-700">
                  KASDA Related Service
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requiresGovApproval"
                  name="requiresGovApproval"
                  checked={formData.requiresGovApproval}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="requiresGovApproval" className="ml-2 text-sm text-gray-700">
                  Requires Government Approval
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Active (visible to users)
                </label>
              </div>
            </div>
          </div>

          {/* Issue Classification Configuration */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <h4 className="text-md font-medium text-gray-900">Issue Classification Configuration</h4>
            <p className="text-sm text-gray-600">Configure available classification options for tickets using this service</p>
            
            {/* Default Root Cause */}
            <div>
              <label htmlFor="defaultRootCause" className="block text-sm font-medium text-gray-700 mb-1">
                Default Root Cause
              </label>
              <select
                id="defaultRootCause"
                name="defaultRootCause"
                value={formData.defaultRootCause}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="human_error">Human Error</option>
                <option value="system_error">System Error</option>
                <option value="external_factor">External Factor</option>
                <option value="undetermined">Undetermined</option>
              </select>
            </div>

            {/* Default Issue Type */}
            <div>
              <label htmlFor="defaultIssueType" className="block text-sm font-medium text-gray-700 mb-1">
                Default Issue Type
              </label>
              <select
                id="defaultIssueType"
                name="defaultIssueType"
                value={formData.defaultIssueType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="request">Request</option>
                <option value="problem">Problem</option>
                <option value="incident">Incident</option>
                <option value="complaint">Complaint</option>
              </select>
            </div>

            {/* Available Root Causes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Root Causes
              </label>
              <div className="space-y-2">
                {['human_error', 'system_error', 'external_factor', 'undetermined'].map((cause) => (
                  <div key={cause} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`rootCause_${cause}`}
                      checked={formData.availableRootCauses.includes(cause)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData(prev => ({
                          ...prev,
                          availableRootCauses: checked 
                            ? [...prev.availableRootCauses, cause]
                            : prev.availableRootCauses.filter(c => c !== cause)
                        }));
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`rootCause_${cause}`} className="ml-2 text-sm text-gray-700">
                      {cause.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Issue Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Issue Types
              </label>
              <div className="space-y-2">
                {['request', 'problem', 'incident', 'complaint'].map((type) => (
                  <div key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`issueType_${type}`}
                      checked={formData.availableIssueTypes.includes(type)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData(prev => ({
                          ...prev,
                          availableIssueTypes: checked 
                            ? [...prev.availableIssueTypes, type]
                            : prev.availableIssueTypes.filter(t => t !== type)
                        }));
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`issueType_${type}`} className="ml-2 text-sm text-gray-700">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Item' : 'Create Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceItemList;