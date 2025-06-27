// Service Catalog Management Component
import React, { useState } from 'react';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ServiceCatalogEditor from './ServiceCatalogEditor';

import { ServiceCatalog } from '../../types/serviceCatalog';

interface ServiceCatalogListProps {
  catalogs: ServiceCatalog[];
  onRefresh: () => void;
  onSelectCatalog: (catalog: ServiceCatalog | null) => void;
}

const ServiceCatalogList: React.FC<ServiceCatalogListProps> = ({ 
  catalogs, 
  onRefresh, 
  onSelectCatalog 
}) => {
  const [showEditor, setShowEditor] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<ServiceCatalog | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<ServiceCatalog | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateNew = () => {
    setEditingCatalog(null);
    setShowEditor(true);
  };

  const handleEdit = (catalog: ServiceCatalog) => {
    setEditingCatalog(catalog);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingCatalog(null);
  };

  const handleSave = () => {
    setShowEditor(false);
    setEditingCatalog(null);
    onRefresh();
    toast.success(editingCatalog ? 'Service catalog updated successfully' : 'Service catalog created successfully');
  };

  const handleDeleteClick = (catalog: ServiceCatalog) => {
    if (catalog.statistics.serviceItemCount > 0) {
      toast.error(`Cannot delete "${catalog.name}". It contains ${catalog.statistics.serviceItemCount} service item(s). Please delete or move all service items first.`);
      return;
    }
    setShowDeleteConfirm(catalog);
  };

  const handleConfirmDelete = async () => {
    if (!showDeleteConfirm) return;

    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/service-catalog-admin/catalogs/${showDeleteConfirm.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete service catalog');
      }

      toast.success('Service catalog deleted successfully');
      onRefresh();
    } catch (error: any) {
      console.error('Error deleting catalog:', error);
      toast.error(error.message || 'Failed to delete service catalog');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Service Catalog Management</h2>
          <p className="text-gray-600">
            Create and manage service catalogs that organize your service offerings
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Service Catalog
        </button>
      </div>

      {/* Service Catalogs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {catalogs.map((catalog) => (
          <div key={catalog.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <BuildingOfficeIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {catalog.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {catalog.description || 'No description provided'}
                </p>
              </div>
              
              {/* Status Badge */}
              <div className="ml-2">
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

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">
                  {catalog.statistics.serviceItemCount}
                </div>
                <div className="text-xs text-blue-700">Service Items</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">
                  {catalog.statistics.templateCount}
                </div>
                <div className="text-xs text-green-700">Templates</div>
              </div>
            </div>

            {/* Department Info */}
            {catalog.department && (
              <div className="mb-4 p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">Department:</p>
                <p className="text-sm font-medium text-gray-900">{catalog.department.name}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={() => onSelectCatalog(catalog)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View Items ({catalog.statistics.serviceItemCount})
              </button>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(catalog)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                  title="Edit catalog"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(catalog)}
                  disabled={catalog.statistics.serviceItemCount > 0}
                  className={`p-2 rounded-md ${
                    catalog.statistics.serviceItemCount > 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                  }`}
                  title={
                    catalog.statistics.serviceItemCount > 0
                      ? 'Cannot delete - contains service items'
                      : 'Delete catalog'
                  }
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {catalogs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <BuildingOfficeIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Service Catalogs</h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first service catalog to organize your service offerings.
          </p>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create First Service Catalog
          </button>
        </div>
      )}

      {/* Service Catalog Editor Modal */}
      {showEditor && (
        <ServiceCatalogEditor
          catalog={editingCatalog}
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
              <h3 className="text-lg font-medium text-gray-900">Delete Service Catalog</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{showDeleteConfirm.name}"? This action cannot be undone.
            </p>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
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
    </div>
  );
};

export default ServiceCatalogList;