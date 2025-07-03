// Service Template Management Component - Full CRUD Implementation
import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { ServiceCatalog } from '../../types/serviceCatalog';

interface ServiceItem {
  id: number;
  name: string;
  serviceCatalogId: number;
  serviceCatalog: {
    id: number;
    name: string;
  };
  statistics: {
    templateCount: number;
    visibleTemplateCount: number;
    totalFields: number;
  };
}

interface ServiceTemplate {
  id: number;
  name: string;
  description: string | null;
  templateType: string;
  isKasdaTemplate: boolean;
  requiresBusinessApproval: boolean;
  isVisible: boolean;
  sortOrder: number;
  estimatedResolutionTime: number | null;
  defaultRootCause: string | null;
  defaultIssueType: string | null;
  serviceItemId: number;
  serviceItem: {
    id: number;
    name: string;
    serviceCatalog: {
      id: number;
      name: string;
    };
  };
  customFieldDefinitions: CustomField[];
  createdAt: string;
  updatedAt: string;
}

interface CustomField {
  id: number;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  fieldCategory: string;
  isRequired: boolean;
  isVisible: boolean;
  sortOrder: number;
  defaultValue: string | null;
  fieldOptions: string | null;
  validationRules: string | null;
  helpText: string | null;
  placeholder: string | null;
}

interface ServiceTemplateListProps {
  catalogs: ServiceCatalog[];
  selectedCatalog: ServiceCatalog | null;
  selectedServiceItem: ServiceItem | null;
  onSelectCatalog: (catalog: ServiceCatalog | null) => void;
  onSelectServiceItem: (item: ServiceItem | null) => void;
  onRefresh: () => void;
}

const ServiceTemplateList: React.FC<ServiceTemplateListProps> = ({ 
  catalogs, 
  selectedCatalog, 
  selectedServiceItem,
  onSelectCatalog,
  onSelectServiceItem,
  onRefresh 
}) => {
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [templates, setTemplates] = useState<ServiceTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ServiceTemplate | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<ServiceTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFieldDesigner, setShowFieldDesigner] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ServiceTemplate | null>(null);

  // Load service items when catalog is selected
  useEffect(() => {
    if (selectedCatalog && !selectedServiceItem) {
      loadServiceItems();
    }
  }, [selectedCatalog, selectedServiceItem]);

  // Load templates when service item is selected
  useEffect(() => {
    if (selectedServiceItem) {
      loadTemplates();
    }
  }, [selectedServiceItem]);

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

  const loadTemplates = async () => {
    if (!selectedServiceItem) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/service-catalog-admin/items/${selectedServiceItem.id}/templates`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load service templates');
      }

      const result = await response.json();
      if (result.success) {
        setTemplates(result.data);
      } else {
        throw new Error(result.message || 'Failed to load service templates');
      }
    } catch (error: any) {
      console.error('Error loading service templates:', error);
      toast.error(error.message || 'Failed to load service templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const handleEdit = (template: ServiceTemplate) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingTemplate(null);
  };

  const handleSave = () => {
    setShowEditor(false);
    setEditingTemplate(null);
    loadTemplates();
    onRefresh(); // Refresh parent data
    toast.success(editingTemplate ? 'Service template updated successfully' : 'Service template created successfully');
  };

  const handleDeleteClick = (template: ServiceTemplate) => {
    if (template.customFieldDefinitions.length > 0) {
      toast.error(`Cannot delete "${template.name}". It contains ${template.customFieldDefinitions.length} custom field(s). Please delete all fields first.`);
      return;
    }
    setShowDeleteConfirm(template);
  };

  const handleConfirmDelete = async () => {
    if (!showDeleteConfirm) return;

    try {
      setIsDeleting(true);
      
      const response = await fetch(`http://localhost:3001/api/service-catalog-admin/templates/${showDeleteConfirm.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete service template');
      }

      toast.success('Service template deleted successfully');
      loadTemplates();
      onRefresh(); // Refresh parent data
    } catch (error: any) {
      console.error('Error deleting service template:', error);
      toast.error(error.message || 'Failed to delete service template');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(null);
    }
  };

  const handleManageFields = (template: ServiceTemplate) => {
    setSelectedTemplate(template);
    setShowFieldDesigner(true);
  };

  // Render catalog selection screen
  if (!selectedCatalog) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Service Template Management</h2>
            <p className="text-gray-600">
              Manage service templates and their custom fields
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Service Catalog</h3>
            <p className="text-gray-600 mb-6">
              Choose a service catalog to view and manage its service templates.
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
                        {catalog.statistics.templateCount} templates
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

  // Render service item selection screen
  if (selectedCatalog && !selectedServiceItem) {
    return (
      <div className="space-y-6">
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
              <h2 className="text-2xl font-bold text-gray-900">Select Service Item</h2>
              <p className="text-gray-600">
                Choose a service item from "{selectedCatalog.name}" to manage templates
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading service items...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Service Item</h3>
              <p className="text-gray-600 mb-6">
                Choose a service item to view and manage its templates.
              </p>
              
              {serviceItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  {serviceItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onSelectServiceItem(item)}
                      className="p-4 text-left bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            {item.statistics.templateCount} templates
                          </p>
                        </div>
                        <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No service items found. Create a service item first.</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render templates for selected service item
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onSelectServiceItem(null)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
            title="Back to service item selection"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Service Templates</h2>
            <p className="text-gray-600">
              Managing templates in "{selectedServiceItem?.name}" service item
            </p>
          </div>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Service Template
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading service templates...</p>
          </div>
        </div>
      )}

      {/* Templates Grid */}
      {!loading && (
        <>
          {templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {template.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {template.description || 'No description provided'}
                      </p>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="ml-2">
                      {template.isVisible ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <EyeIcon className="w-3 h-3 mr-1" />
                          Visible
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <EyeSlashIcon className="w-3 h-3 mr-1" />
                          Hidden
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Template Type:</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {template.templateType.replace('_', ' ')}
                      </span>
                    </div>
                    {template.isKasdaTemplate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">KASDA Template:</span>
                        <span className="text-orange-600 font-medium">Yes</span>
                      </div>
                    )}
                    {template.requiresBusinessApproval && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Business Approval:</span>
                        <span className="text-red-600 font-medium">Required</span>
                      </div>
                    )}
                    {template.estimatedResolutionTime && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Est. Resolution:</span>
                        <span className="font-medium text-gray-900">{template.estimatedResolutionTime}h</span>
                      </div>
                    )}
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-1 gap-3 mb-4">
                    <div className="text-center p-2 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        {template.customFieldDefinitions.length}
                      </div>
                      <div className="text-xs text-purple-700">Custom Fields</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleManageFields(template)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                    >
                      <Cog6ToothIcon className="h-4 w-4 mr-1" />
                      Fields ({template.customFieldDefinitions.length})
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(template)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Edit template"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(template)}
                        disabled={template.customFieldDefinitions.length > 0}
                        className={`p-2 rounded-md ${
                          template.customFieldDefinitions.length > 0
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title={
                          template.customFieldDefinitions.length > 0
                            ? 'Cannot delete - contains custom fields'
                            : 'Delete template'
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
              <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Service Templates</h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first service template in "{selectedServiceItem?.name}".
              </p>
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create First Service Template
              </button>
            </div>
          )}
        </>
      )}

      {/* Service Template Editor Modal */}
      {showEditor && selectedServiceItem && (
        <ServiceTemplateEditor
          template={editingTemplate}
          serviceItemId={selectedServiceItem.id}
          onSave={handleSave}
          onCancel={handleCloseEditor}
        />
      )}

      {/* Custom Field Designer Modal */}
      {showFieldDesigner && selectedTemplate && (
        <CustomFieldDesigner
          template={selectedTemplate}
          onSave={() => {
            setShowFieldDesigner(false);
            setSelectedTemplate(null);
            loadTemplates();
          }}
          onCancel={() => {
            setShowFieldDesigner(false);
            setSelectedTemplate(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Delete Service Template</h3>
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
    </div>
  );
};

// Service Template Editor Component
interface ServiceTemplateEditorProps {
  template: ServiceTemplate | null;
  serviceItemId: number;
  onSave: () => void;
  onCancel: () => void;
}

const ServiceTemplateEditor: React.FC<ServiceTemplateEditorProps> = ({
  template,
  serviceItemId,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateType: 'standard',
    isKasdaTemplate: false,
    requiresBusinessApproval: false,
    isVisible: true,
    sortOrder: 0,
    estimatedResolutionTime: '',
    defaultRootCause: '',
    defaultIssueType: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = template !== null;

  // Load form data if editing
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || '',
        templateType: template.templateType,
        isKasdaTemplate: template.isKasdaTemplate,
        requiresBusinessApproval: template.requiresBusinessApproval,
        isVisible: template.isVisible,
        sortOrder: template.sortOrder,
        estimatedResolutionTime: template.estimatedResolutionTime?.toString() || '',
        defaultRootCause: template.defaultRootCause || '',
        defaultIssueType: template.defaultIssueType || ''
      });
    }
  }, [template]);

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
      newErrors.name = 'Service template name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Service template name must be at least 3 characters';
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
        templateType: formData.templateType,
        isKasdaTemplate: formData.isKasdaTemplate,
        requiresBusinessApproval: formData.requiresBusinessApproval,
        isVisible: formData.isVisible,
        sortOrder: formData.sortOrder,
        estimatedResolutionTime: formData.estimatedResolutionTime ? parseInt(formData.estimatedResolutionTime) : null,
        defaultRootCause: formData.defaultRootCause || null,
        defaultIssueType: formData.defaultIssueType || null
      };

      const url = isEditing 
        ? `http://localhost:3001/api/service-catalog-admin/templates/${template.id}`
        : `http://localhost:3001/api/service-catalog-admin/items/${serviceItemId}/templates`;
      
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
        throw new Error(result.message || `Failed to ${isEditing ? 'update' : 'create'} service template`);
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving service template:', error);
      toast.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} service template`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <DocumentTextIcon className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">
              {isEditing ? 'Edit Service Template' : 'Create New Service Template'}
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
                Service Template Name *
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
                placeholder="Enter service template name"
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
                placeholder="Describe the service template"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <h4 className="text-md font-medium text-gray-900">Configuration</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Template Type */}
              <div>
                <label htmlFor="templateType" className="block text-sm font-medium text-gray-700 mb-1">
                  Template Type
                </label>
                <select
                  id="templateType"
                  name="templateType"
                  value={formData.templateType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="standard">Standard</option>
                  <option value="government">Government</option>
                  <option value="kasda_specific">KASDA Specific</option>
                  <option value="internal_only">Internal Only</option>
                </select>
              </div>

              {/* Estimated Resolution Time */}
              <div>
                <label htmlFor="estimatedResolutionTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Resolution Time (hours)
                </label>
                <input
                  type="number"
                  id="estimatedResolutionTime"
                  name="estimatedResolutionTime"
                  value={formData.estimatedResolutionTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="24"
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <option value="">Select default root cause</option>
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
                  <option value="">Select default issue type</option>
                  <option value="request">Request</option>
                  <option value="complaint">Complaint</option>
                  <option value="problem">Problem</option>
                </select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isKasdaTemplate"
                  name="isKasdaTemplate"
                  checked={formData.isKasdaTemplate}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isKasdaTemplate" className="ml-2 text-sm text-gray-700">
                  KASDA Template
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requiresBusinessApproval"
                  name="requiresBusinessApproval"
                  checked={formData.requiresBusinessApproval}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="requiresBusinessApproval" className="ml-2 text-sm text-gray-700">
                  Requires Business Approval
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isVisible"
                  name="isVisible"
                  checked={formData.isVisible}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isVisible" className="ml-2 text-sm text-gray-700">
                  Visible (visible to users)
                </label>
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
                isEditing ? 'Update Template' : 'Create Template'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Custom Field Designer - Placeholder for now
interface CustomFieldDesignerProps {
  template: ServiceTemplate;
  onSave: () => void;
  onCancel: () => void;
}

const CustomFieldDesigner: React.FC<CustomFieldDesignerProps> = ({
  template,
  onSave,
  onCancel
}) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Cog6ToothIcon className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">
              Custom Field Designer - "{template.name}"
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="text-center py-12">
            <Cog6ToothIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Custom Field Designer
            </h3>
            <p className="text-gray-600 mb-6">
              Advanced field designer with drag-and-drop, validation rules, and conditional logic coming soon...
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Current fields: {template.customFieldDefinitions.length}</p>
              {template.customFieldDefinitions.map((field, index) => (
                <div key={field.id} className="text-sm bg-gray-50 p-2 rounded">
                  {index + 1}. {field.fieldLabel} ({field.fieldType})
                  {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                </div>
              ))}
            </div>
            <div className="mt-6 space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={onSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceTemplateList;