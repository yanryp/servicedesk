import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  UserGroupIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui';

interface SupportingGroup {
  id?: number;
  name: string;
  description: string;
  departmentType: string;
  isServiceOwner: boolean;
}

interface SupportingGroupEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: SupportingGroup) => Promise<void>;
  group?: SupportingGroup | null;
  mode: 'create' | 'edit';
}

const SupportingGroupEditor: React.FC<SupportingGroupEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  group,
  mode
}) => {
  const [formData, setFormData] = useState<SupportingGroup>({
    name: '',
    description: '',
    departmentType: 'support',
    isServiceOwner: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (group && mode === 'edit') {
      setFormData({
        id: group.id,
        name: group.name,
        description: group.description,
        departmentType: group.departmentType,
        isServiceOwner: group.isServiceOwner
      });
    } else {
      setFormData({
        name: '',
        description: '',
        departmentType: 'support',
        isServiceOwner: false
      });
    }
    setErrors({});
  }, [group, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Supporting group name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters long';
    }

    if (!formData.departmentType) {
      newErrors.departmentType = 'Group type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to save supporting group'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SupportingGroup, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {mode === 'create' ? 'Create Supporting Group' : 'Edit Supporting Group'}
              </h3>
              <p className="text-sm text-gray-600">
                {mode === 'create' 
                  ? 'Add a new technical support team' 
                  : 'Update supporting group details'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Supporting Group Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., IT Operations, General Support"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the responsibilities and scope of this supporting group..."
            />
          </div>

          {/* Department Type */}
          <div>
            <label htmlFor="departmentType" className="block text-sm font-medium text-gray-700 mb-2">
              Group Type *
            </label>
            <select
              id="departmentType"
              value={formData.departmentType}
              onChange={(e) => handleInputChange('departmentType', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.departmentType ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="support">Technical Support</option>
              <option value="operations">Operations</option>
              <option value="maintenance">Maintenance</option>
              <option value="security">Security</option>
              <option value="facilities">Facilities</option>
              <option value="helpdesk">Help Desk</option>
              <option value="infrastructure">Infrastructure</option>
            </select>
            {errors.departmentType && (
              <p className="mt-1 text-sm text-red-600">{errors.departmentType}</p>
            )}
          </div>

          {/* Service Owner */}
          <div className="flex items-start space-x-3">
            <div className="flex items-center h-5">
              <input
                id="isServiceOwner"
                type="checkbox"
                checked={formData.isServiceOwner}
                onChange={(e) => handleInputChange('isServiceOwner', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            <div className="text-sm">
              <label htmlFor="isServiceOwner" className="font-medium text-gray-700">
                Service Owner
              </label>
              <p className="text-gray-500">
                This group owns and manages specific services in the catalog
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckIcon className="w-4 h-4" />
              )}
              <span>{mode === 'create' ? 'Create Group' : 'Save Changes'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupportingGroupEditor;