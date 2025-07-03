// ServiceItem Custom Fields Management Component
import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { serviceCatalogAdminService, CustomFieldDefinition } from '../../services/serviceCatalogAdmin';
import toast from 'react-hot-toast';

interface ServiceItemCustomFieldsProps {
  serviceItemId: number;
  serviceItemName: string;
  onFieldsChange?: () => void; // Callback to refresh parent data
}

interface CustomFieldFormData {
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  isRequired: boolean;
  isVisible: boolean;
  sortOrder: number;
  placeholder: string;
  defaultValue: string;
  options: any;
  validationRules: any;
  isKasdaSpecific: boolean;
}

const defaultFormData: CustomFieldFormData = {
  fieldName: '',
  fieldLabel: '',
  fieldType: 'text',
  isRequired: false,
  isVisible: true,
  sortOrder: 0,
  placeholder: '',
  defaultValue: '',
  options: null,
  validationRules: null,
  isKasdaSpecific: false
};

const fieldTypeOptions = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Select Dropdown' },
  { value: 'multiselect', label: 'Multi-Select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'Date & Time' },
  { value: 'file', label: 'File Upload' }
];

const ServiceItemCustomFields: React.FC<ServiceItemCustomFieldsProps> = ({
  serviceItemId,
  serviceItemName,
  onFieldsChange
}) => {
  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);
  const [formData, setFormData] = useState<CustomFieldFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    loadCustomFields();
  }, [serviceItemId]);

  const loadCustomFields = async () => {
    try {
      setLoading(true);
      setError(null);
      const fieldsData = await serviceCatalogAdminService.getServiceItemCustomFields(serviceItemId.toString());
      setFields(fieldsData);
    } catch (error: any) {
      console.error('Error loading custom fields:', error);
      setError(error.message || 'Failed to load custom fields');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateField = () => {
    setEditingField(null);
    setFormData(defaultFormData);
    setShowForm(true);
  };

  const handleEditField = (field: CustomFieldDefinition) => {
    setEditingField(field);
    setFormData({
      fieldName: field.fieldName,
      fieldLabel: field.fieldLabel,
      fieldType: field.fieldType,
      isRequired: field.isRequired,
      isVisible: field.isVisible,
      sortOrder: field.sortOrder,
      placeholder: field.placeholder || '',
      defaultValue: field.defaultValue || '',
      options: field.options,
      validationRules: field.validationRules,
      isKasdaSpecific: field.isKasdaSpecific
    });
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fieldName.trim() || !formData.fieldLabel.trim()) {
      toast.error('Field name and label are required');
      return;
    }

    try {
      setSubmitting(true);
      
      const submitData = {
        ...formData,
        fieldName: formData.fieldName.trim(),
        fieldLabel: formData.fieldLabel.trim(),
        placeholder: formData.placeholder.trim() || undefined,
        defaultValue: formData.defaultValue.trim() || undefined
      };

      if (editingField) {
        await serviceCatalogAdminService.updateServiceItemCustomField(
          editingField.id.toString(),
          submitData
        );
        toast.success('Custom field updated successfully');
      } else {
        await serviceCatalogAdminService.createServiceItemCustomField(
          serviceItemId.toString(),
          submitData
        );
        toast.success('Custom field created successfully');
      }

      setShowForm(false);
      setEditingField(null);
      setFormData(defaultFormData);
      await loadCustomFields();
      onFieldsChange?.();
    } catch (error: any) {
      console.error('Error saving custom field:', error);
      toast.error(error.message || 'Failed to save custom field');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteField = async (fieldId: number) => {
    try {
      await serviceCatalogAdminService.deleteServiceItemCustomField(fieldId.toString());
      toast.success('Custom field deleted successfully');
      setDeleteConfirm(null);
      await loadCustomFields();
      onFieldsChange?.();
    } catch (error: any) {
      console.error('Error deleting custom field:', error);
      toast.error(error.message || 'Failed to delete custom field');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading custom fields...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-700">Error: {error}</p>
        </div>
        <button
          onClick={loadCustomFields}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-blue-600 mr-2" />
            Custom Fields for "{serviceItemName}"
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {fields.length} custom field{fields.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <button
          onClick={handleCreateField}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Custom Field
        </button>
      </div>

      {/* Custom Fields List */}
      {fields.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <AdjustmentsHorizontalIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No custom fields</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a custom field for this service item.
          </p>
          <div className="mt-6">
            <button
              onClick={handleCreateField}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Custom Field
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Field
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Settings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fields.map((field) => (
                  <tr key={field.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {field.fieldLabel}
                        </div>
                        <div className="text-sm text-gray-500">
                          {field.fieldName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {field.fieldType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {field.isRequired && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Required
                          </span>
                        )}
                        {field.isVisible ? (
                          <EyeIcon className="h-4 w-4 text-green-500" title="Visible" />
                        ) : (
                          <EyeSlashIcon className="h-4 w-4 text-gray-400" title="Hidden" />
                        )}
                        {field.isKasdaSpecific && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            KASDA
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {field.sortOrder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditField(field)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit field"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(field.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete field"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingField ? 'Edit Custom Field' : 'Create Custom Field'}
              </h3>
              
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Field Name *
                    </label>
                    <input
                      type="text"
                      value={formData.fieldName}
                      onChange={(e) => setFormData({...formData, fieldName: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., customer_name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Field Label *
                    </label>
                    <input
                      type="text"
                      value={formData.fieldLabel}
                      onChange={(e) => setFormData({...formData, fieldLabel: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Customer Name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Field Type
                    </label>
                    <select
                      value={formData.fieldType}
                      onChange={(e) => setFormData({...formData, fieldType: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {fieldTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Placeholder Text
                    </label>
                    <input
                      type="text"
                      value={formData.placeholder}
                      onChange={(e) => setFormData({...formData, placeholder: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Enter customer name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Default Value
                    </label>
                    <input
                      type="text"
                      value={formData.defaultValue}
                      onChange={(e) => setFormData({...formData, defaultValue: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isRequired}
                      onChange={(e) => setFormData({...formData, isRequired: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Required field</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isVisible}
                      onChange={(e) => setFormData({...formData, isVisible: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Visible</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isKasdaSpecific}
                      onChange={(e) => setFormData({...formData, isKasdaSpecific: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">KASDA specific</span>
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingField(null);
                      setFormData(defaultFormData);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : (editingField ? 'Update Field' : 'Create Field')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="text-lg font-medium text-gray-900 mt-2">Delete Custom Field</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this custom field? This action cannot be undone.
              </p>
              <div className="flex items-center justify-center space-x-3 mt-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteField(deleteConfirm)}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Delete Field
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceItemCustomFields;