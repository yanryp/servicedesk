// BSG Create Ticket Page with Template System
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { BuildingOffice2Icon as BuildingOfficeIcon, DocumentPlusIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { BSGTemplateSelector } from '../components';
import BSGDynamicFieldRenderer from '../components/BSGDynamicFieldRenderer';
import { TicketPriority } from '../types';
import toast from 'react-hot-toast';
import BSGTemplateService from '../services/bsgTemplate';

interface BSGTemplate {
  id: number;
  template_number: number;
  name: string;
  display_name: string;
  description?: string;
  popularity_score: number;
  usage_count: number;
  category_name: string;
  category_display_name: string;
}

interface BSGTicketFormData {
  title: string;
  description: string;
  priority: TicketPriority;
}

const BSGCreateTicketPage: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<BSGTemplate | null>(null);
  const [templateFields, setTemplateFields] = useState<any[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<BSGTicketFormData>({
    defaultValues: {
      priority: 'medium',
    },
  });

  const handleTemplateSelect = useCallback(async (template: BSGTemplate | null) => {
    setSelectedTemplate(template);
    setTemplateFields([]);
    setFieldValues({});
    setFieldErrors({});
    
    if (template) {
      // Auto-populate title and description based on template
      const autoTitle = `${template.category_display_name} - ${template.name}`;
      setValue('title', autoTitle);
      setValue('description', template.description || '');
      
      // Load template fields
      setLoadingFields(true);
      try {
        const token = localStorage.getItem('authToken');
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${baseUrl}/bsg-templates/${template.id}/fields`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const result = await response.json();
          setTemplateFields(result.data || []);
          
          // Initialize field values with defaults
          const initialValues: Record<string, any> = {};
          (result.data || []).forEach((field: any) => {
            if (field.options?.find((opt: any) => opt.isDefault)) {
              initialValues[field.fieldName] = field.options.find((opt: any) => opt.isDefault).value;
            }
          });
          setFieldValues(initialValues);
        } else {
          toast.error('Failed to load template fields');
        }
      } catch (error) {
        console.error('Error loading template fields:', error);
        toast.error('Error loading template fields');
      } finally {
        setLoadingFields(false);
      }
    } else {
      setValue('title', '');
      setValue('description', '');
    }
  }, [setValue]);

  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  }, [fieldErrors]);

  const validateFields = (): boolean => {
    const errors: Record<string, string> = {};
    
    templateFields.forEach(field => {
      if (field.isRequired && !fieldValues[field.fieldName]) {
        errors[field.fieldName] = `${field.fieldLabel} is required`;
      }
      
      // Validate max length
      if (field.maxLength && fieldValues[field.fieldName]?.length > field.maxLength) {
        errors[field.fieldName] = `${field.fieldLabel} must not exceed ${field.maxLength} characters`;
      }
      
      // Validate field type specific rules
      if (field.fieldType === 'number' && fieldValues[field.fieldName] && isNaN(fieldValues[field.fieldName])) {
        errors[field.fieldName] = `${field.fieldLabel} must be a valid number`;
      }
    });
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (data: BSGTicketFormData) => {
    if (!selectedTemplate) {
      toast.error('Please select a BSG template for your ticket');
      return;
    }

    // Validate template fields
    if (!validateFields()) {
      toast.error('Please fix the field errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create BSG ticket with dynamic fields
      const ticketData = {
        ...data,
        templateId: selectedTemplate.id,
        templateNumber: selectedTemplate.template_number,
        category: selectedTemplate.category_name,
        customFields: fieldValues,
        attachments: attachments
      };

      console.log('Creating BSG ticket with custom fields:', ticketData);

      // Call the API to create BSG ticket
      const response = await BSGTemplateService.createBSGTicket({
        title: data.title,
        description: data.description,
        priority: data.priority,
        templateId: selectedTemplate.id,
        templateNumber: selectedTemplate.template_number,
        category: selectedTemplate.category_name,
        customFields: fieldValues,
        attachments: attachments || undefined
      });
      
      toast.success('BSG ticket created successfully with custom fields!');
      
      // Navigate to the ticket detail page if we have the ticket ID
      if (response?.data?.id) {
        navigate(`/tickets/${response.data.id}`);
      } else {
        navigate('/tickets');
      }
      
    } catch (error: any) {
      console.error('Error creating BSG ticket:', error);
      toast.error('Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    setSelectedTemplate(null);
    setTemplateFields([]);
    setFieldValues({});
    setFieldErrors({});
    setAttachments(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to create a BSG ticket.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
            <BuildingOfficeIcon className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          BSG Banking System Support
        </h1>
        <p className="mt-2 text-slate-600">
          Create a support ticket using BSG-specific templates for faster processing
        </p>
      </div>

      <div className="space-y-8">
        {/* Enhanced Template Selection */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-slate-200/50">
          <BSGTemplateSelector
            onTemplateSelect={handleTemplateSelect}
            selectedTemplate={selectedTemplate}
            disabled={isSubmitting}
          />
        </div>

        {/* Ticket Form - Only show when template is selected */}
        {selectedTemplate && (
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-slate-200/50">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
            <DocumentPlusIcon className="h-5 w-5 mr-2" />
            Ticket Details
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  {...register('title', { 
                    required: 'Title is required',
                    minLength: { value: 5, message: 'Title must be at least 5 characters' }
                  })}
                  disabled={isSubmitting}
                  className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
                  placeholder="Ticket title will be auto-filled when you select a template"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  rows={4}
                  {...register('description', { 
                    required: 'Description is required',
                    minLength: { value: 10, message: 'Description must be at least 10 characters' }
                  })}
                  disabled={isSubmitting}
                  className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
                  placeholder="Detailed description will be auto-filled from template"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-2">
                  Priority *
                </label>
                <select
                  id="priority"
                  {...register('priority', { required: 'Priority is required' })}
                  disabled={isSubmitting}
                  className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
                >
                  <option value="low">Low - Minor issue, no immediate impact</option>
                  <option value="medium">Medium - Moderate impact on productivity</option>
                  <option value="high">High - Significant impact, affects multiple users</option>
                  <option value="urgent">Urgent - Critical issue, business operations affected</option>
                </select>
                {errors.priority && (
                  <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="attachments" className="block text-sm font-medium text-slate-700 mb-2">
                  Attachments
                </label>
                <input
                  type="file"
                  id="attachments"
                  multiple
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip"
                  onChange={(e) => setAttachments(e.target.files)}
                  disabled={isSubmitting}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Max 5 files. Supported: JPG, PNG, PDF, DOC, TXT, ZIP (Max 10MB each)
                </p>
              </div>
            </div>

            {/* BSG Template Custom Fields */}
            {selectedTemplate && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Selected BSG Template</h4>
                  <div className="text-sm text-blue-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div><strong>Category:</strong> {selectedTemplate.category_display_name}</div>
                      <div><strong>Template #:</strong> {selectedTemplate.template_number}</div>
                      <div className="sm:col-span-2"><strong>Type:</strong> {selectedTemplate.name}</div>
                    </div>
                  </div>
                </div>

                {/* Dynamic Template Fields */}
                {loadingFields ? (
                  <div className="flex items-center justify-center py-8 bg-gray-50 rounded-xl">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading template fields...</span>
                  </div>
                ) : templateFields.length > 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <BSGDynamicFieldRenderer
                      templateId={selectedTemplate.id}
                      fields={templateFields}
                      values={fieldValues}
                      onChange={handleFieldChange}
                      errors={fieldErrors}
                      disabled={isSubmitting}
                      showCategories={templateFields.length > 6}
                    />
                  </div>
                ) : null}
              </>
            )}

            {/* User Info Display */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-blue-800 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2" />
                  BSG Employee Information
                </h4>
                {user?.role === 'technician' && (
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    onClick={() => setShowUserSelector(!showUserSelector)}
                  >
                    {showUserSelector ? 'Cancel' : 'Create for another user'}
                  </button>
                )}
              </div>
              <div className="text-sm text-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <span className="font-medium text-slate-600">Employee Name:</span>
                  <span className="text-slate-800">{user?.username}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-slate-600">Email Address:</span>
                  <span className="text-slate-800">{user?.email}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-slate-600">Department/Branch:</span>
                  <span className="text-slate-800">
                    {user?.department?.name || 'Not specified'}
                    {user?.department?.departmentType && (
                      <span className="ml-1 text-xs text-slate-500">
                        ({user.department.departmentType === 'business' ? 'Business Unit' :
                          user.department.departmentType === 'government' ? 'Government' :
                          'Internal Dept.'})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-slate-600">Position:</span>
                  <span className="text-slate-800 capitalize">{user?.role}</span>
                </div>
                <div className="sm:col-span-2">
                  <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <BuildingOfficeIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h5 className="font-medium text-blue-800 mb-1">Smart Ticket Routing</h5>
                        <p className="text-sm text-blue-700 leading-relaxed">
                          Select any category based on your issue type. 
                          The system will automatically route your ticket to the appropriate department:
                        </p>
                        <ul className="text-xs text-blue-600 mt-2 space-y-1">
                          <li>• <strong>KASDA/BSGDirect categories</strong> → Dukungan dan Layanan Department</li>
                          <li>• <strong>OLIBS/Core Banking/ATM categories</strong> → Information Technology Department</li>
                          <li>• <strong>Routing based on category selection</strong>, not user type</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* User Selector for Technicians */}
              {showUserSelector && user?.role === 'technician' && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h5 className="font-medium text-yellow-800 mb-2">Create ticket on behalf of:</h5>
                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Search by username or email..."
                        className="block w-full px-3 py-2 border border-yellow-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        onChange={(e) => {
                          // TODO: Implement user search functionality
                          console.log('Searching for:', e.target.value);
                        }}
                      />
                    </div>
                    {selectedUser && (
                      <div className="p-3 bg-white border border-yellow-300 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{selectedUser.username}</div>
                            <div className="text-sm text-gray-600">{selectedUser.email}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedUser(null)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-yellow-700">
                      Note: The ticket will be created under the selected user's name, but you will be noted as the technician who created it.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                className="px-6 py-3 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedTemplate}
                className="px-8 py-3 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating BSG Ticket...</span>
                  </>
                ) : (
                  <>
                    <DocumentPlusIcon className="h-4 w-4" />
                    <span>
                      Create BSG Support Ticket
                      {templateFields.length > 0 && ` (${templateFields.length} fields)`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        )}
      </div>
    </div>
  );
};

export default BSGCreateTicketPage;