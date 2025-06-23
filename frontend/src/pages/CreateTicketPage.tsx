// src/pages/CreateTicketPage.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { DocumentPlusIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { ticketsService } from '../services';
import { CategorySelector, TemplateSelector } from '../components';
import { CustomFieldsForm, useCustomFieldsValidation } from '../components/CustomFields';
import { useTemplateFields } from '../hooks/useTemplateFields';
import { Item, TicketTemplate, TicketPriority, CreateTicketRequest, RootCauseType, IssueCategoryType } from '../types';
import { categorizationService } from '../services/categorization';
import toast from 'react-hot-toast';

interface TicketFormData {
  title: string;
  description: string;
  priority: TicketPriority;
}

const CreateTicketPage: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TicketTemplate | null>(null);
  const [attachments, setAttachments] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Categorization state
  const [rootCause, setRootCause] = useState<RootCauseType | ''>('');
  const [issueCategory, setIssueCategory] = useState<IssueCategoryType | ''>('');
  const [suggestions, setSuggestions] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Use new template fields hook
  const {
    fieldsData,
    fields,
    loading: fieldsLoading,
    error: fieldsError,
    fieldValues,
    updateFieldValue,
    resetFieldValues,
    validateFields: validateTemplateFields,
    loadTemplateFields,
    clearTemplate
  } = useTemplateFields();

  // Legacy custom fields validation for backward compatibility
  const { validateFields, convertToApiFormat } = useCustomFieldsValidation(
    selectedTemplate?.customFields || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TicketFormData>({
    defaultValues: {
      priority: 'medium',
    },
  });

  const handleItemSelect = useCallback((item: Item | null) => {
    setSelectedItem(item);
    setSelectedTemplate(null);
    clearTemplate();
    setRootCause('');
    setIssueCategory('');
    setSuggestions(null);
    
    // Load categorization suggestions for the selected item
    if (item) {
      loadSuggestions(item.id);
    }
  }, [clearTemplate]);

  const loadSuggestions = async (itemId: number) => {
    try {
      const data = await categorizationService.getSuggestions(itemId);
      if (data && data.suggestions) {
        setSuggestions(data);
        // Auto-apply suggestions if they exist
        if (data.suggestions.rootCause) {
          setRootCause(data.suggestions.rootCause);
        }
        if (data.suggestions.issueCategory) {
          setIssueCategory(data.suggestions.issueCategory);
        }
      } else {
        setSuggestions(null);
      }
    } catch (error) {
      console.error('Failed to load categorization suggestions:', error);
      // Don't show error to user - categorization suggestions are optional
      setSuggestions(null);
    }
  };

  const handleTemplateSelect = useCallback(async (template: TicketTemplate | null) => {
    setSelectedTemplate(template);
    
    // Load template fields if a template is selected
    if (template?.id) {
      try {
        await loadTemplateFields(template.id);
      } catch (error) {
        console.error('Failed to load template fields:', error);
        toast.error('Failed to load template fields');
      }
    } else {
      clearTemplate();
    }
  }, [loadTemplateFields, clearTemplate]);

  // Handle custom field changes for new template system
  const handleTemplateFieldChange = useCallback((fieldName: string, value: string) => {
    updateFieldValue(fieldName, value);
  }, [updateFieldValue]);

  const onSubmit = async (data: TicketFormData) => {
    if (!selectedItem) {
      toast.error('Please select an item for your ticket');
      return;
    }

    // Validate custom fields based on system type
    if (fieldsData && fields.length > 0) {
      // New template system validation
      const isValid = await validateTemplateFields();
      if (!isValid) {
        toast.error('Please fix the errors in the custom fields');
        return;
      }
    } 
    else if (selectedTemplate?.customFields?.length) {
      // Legacy template system validation
      const fieldValidationErrors = validateFields({});
      if (Object.keys(fieldValidationErrors).length > 0) {
        toast.error('Please fix the errors in the custom fields');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Prepare custom field values based on system type
      let preparedCustomFieldValues;
      if (fieldsData && fields.length > 0) {
        // New template system - convert to API format
        preparedCustomFieldValues = Object.entries(fieldValues).map(([fieldName, value]) => ({
          fieldDefinitionId: fields.find(f => f.fieldName === fieldName)?.id || 0,
          value: value
        }));
      } else if (selectedTemplate?.customFields?.length) {
        // Legacy template system - use empty object since no legacy values collected
        preparedCustomFieldValues = convertToApiFormat({});
      }

      const ticketData: CreateTicketRequest = {
        title: data.title,
        description: data.description,
        itemId: selectedItem.id,
        priority: data.priority,
        templateId: selectedTemplate?.id,
        customFieldValues: preparedCustomFieldValues,
        ...(rootCause && { userRootCause: rootCause }),
        ...(issueCategory && { userIssueCategory: issueCategory }),
      };

      const createdTicket = await ticketsService.createTicket(ticketData, attachments || undefined);
      
      toast.success('Ticket created successfully!');
      navigate(`/tickets/${createdTicket.id}`);
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      if (error.response?.data?.message) {
        toast.error(`Failed to create ticket: ${error.response.data.message}`);
      } else if (error.message) {
        toast.error(`Failed to create ticket: ${error.message}`);
      } else {
        toast.error('Failed to create ticket. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    setSelectedItem(null);
    setSelectedTemplate(null);
    clearTemplate();
    resetFieldValues();
    setAttachments(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to create a ticket.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
            <DocumentPlusIcon className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Create New Support Ticket
        </h1>
        <p className="mt-2 text-slate-600">
          Submit a detailed support request and we'll help you resolve your issue
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-slate-200/50">
          {/* Category Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Category Selection</h2>
            <CategorySelector 
              onItemSelect={handleItemSelect}
              disabled={isSubmitting}
            />
          </div>


          {/* Basic Ticket Information */}
          {selectedItem && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-800">Ticket Details</h2>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
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
                    placeholder="Brief description of your issue"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
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
                    placeholder="Detailed description of your issue, including steps to reproduce, error messages, etc."
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
                  <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-2">
                    Attachments
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="attachments"
                      multiple
                      accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files) {
                          // Validate file count
                          if (files.length > 5) {
                            toast.error('Maximum 5 files allowed');
                            e.target.value = '';
                            return;
                          }
                          
                          // Validate file sizes (10MB each)
                          const maxSize = 10 * 1024 * 1024; // 10MB
                          for (let i = 0; i < files.length; i++) {
                            if (files[i].size > maxSize) {
                              toast.error(`File "${files[i].name}" is too large. Maximum size is 10MB.`);
                              e.target.value = '';
                              return;
                            }
                          }
                        }
                        setAttachments(files);
                      }}
                      disabled={isSubmitting}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                    <PaperClipIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Max 5 files. Supported: JPG, PNG, PDF, DOC, TXT, ZIP (Max 10MB each)
                  </p>
                </div>
              </div>

              {/* Categorization Section */}
              {selectedItem && (
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Issue Classification</h3>
                    {suggestions && (
                      <button
                        type="button"
                        onClick={() => setShowSuggestions(!showSuggestions)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {showSuggestions ? 'Hide' : 'Show'} Suggestions
                      </button>
                    )}
                  </div>

                  {showSuggestions && suggestions && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">AI Suggestions</h4>
                      <div className="text-sm text-blue-800 mb-3">
                        <div>Suggested Root Cause: <strong>{suggestions.suggestions.rootCause.replace('_', ' ')}</strong></div>
                        <div>Suggested Category: <strong>{suggestions.suggestions.issueCategory}</strong></div>
                        <div>Confidence: <strong>{suggestions.suggestions.confidence}</strong></div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setRootCause(suggestions.suggestions.rootCause);
                          setIssueCategory(suggestions.suggestions.issueCategory);
                        }}
                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Apply Suggestions
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        What caused this issue?
                      </label>
                      <select
                        value={rootCause}
                        onChange={(e) => setRootCause(e.target.value as RootCauseType)}
                        disabled={isSubmitting}
                        className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
                      >
                        <option value="">Select root cause...</option>
                        <option value="human_error">User/Process Error</option>
                        <option value="system_error">Technical/System Error</option>
                        <option value="external_factor">External Issue</option>
                        <option value="undetermined">Not Sure / Need Investigation</option>
                      </select>
                      <p className="text-xs text-slate-500 mt-1">
                        Help us understand what you think caused this issue
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        What type of issue is this?
                      </label>
                      <select
                        value={issueCategory}
                        onChange={(e) => setIssueCategory(e.target.value as IssueCategoryType)}
                        disabled={isSubmitting}
                        className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
                      >
                        <option value="">Select issue type...</option>
                        <option value="request">Service Request - I need something new or changed</option>
                        <option value="complaint">Service Complaint - I'm not satisfied with service quality</option>
                        <option value="problem">Technical Problem - Something is broken or not working</option>
                      </select>
                      <p className="text-xs text-slate-500 mt-1">
                        Choose the category that best describes your issue
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">
                      <strong>Why do we ask for this information?</strong> This classification helps our technicians prioritize and route your ticket to the right team faster. You can leave these blank if you're unsure.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Custom Fields - New Template System */}
          {fieldsData && fields.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Template Information</h2>
              {fieldsLoading && (
                <div className="flex items-center space-x-2 text-blue-600 mb-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Loading template fields...</span>
                </div>
              )}
              {fieldsError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  Error loading template fields: {fieldsError}
                </div>
              )}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.fieldName} className={field.fieldType === 'textarea' ? 'sm:col-span-2' : ''}>
                    <label htmlFor={field.fieldName} className="block text-sm font-medium text-slate-700 mb-2">
                      {field.fieldLabel} {field.isRequired && '*'}
                    </label>
                    
                    {field.fieldType === 'dropdown' ? (
                      <select
                        id={field.fieldName}
                        value={fieldValues[field.fieldName] || ''}
                        onChange={(e) => handleTemplateFieldChange(field.fieldName, e.target.value)}
                        disabled={isSubmitting}
                        className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
                      >
                        <option value="">{field.placeholder || `Select ${field.fieldLabel}`}</option>
                        {field.validationRules?.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : field.fieldType === 'textarea' ? (
                      <textarea
                        id={field.fieldName}
                        rows={3}
                        value={fieldValues[field.fieldName] || ''}
                        onChange={(e) => handleTemplateFieldChange(field.fieldName, e.target.value)}
                        disabled={isSubmitting}
                        placeholder={field.placeholder}
                        className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
                      />
                    ) : (
                      <input
                        type={field.fieldType === 'number' ? 'number' : field.fieldType === 'date' ? 'date' : field.fieldType === 'datetime' ? 'datetime-local' : 'text'}
                        id={field.fieldName}
                        value={fieldValues[field.fieldName] || ''}
                        onChange={(e) => handleTemplateFieldChange(field.fieldName, e.target.value)}
                        disabled={isSubmitting}
                        placeholder={field.placeholder}
                        className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
                      />
                    )}
                    
                    {field.helpText && (
                      <p className="mt-1 text-sm text-slate-500">{field.helpText}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Fields - Legacy Template System (fallback) */}
          {!fieldsData && selectedTemplate && selectedTemplate.customFields && selectedTemplate.customFields.length > 0 && (
            <CustomFieldsForm
              fields={selectedTemplate.customFields}
              values={{}}
              onChange={() => {}}
              errors={{}}
              disabled={isSubmitting}
            />
          )}

          {/* Form Actions */}
          {selectedItem && (
            <div className="flex justify-end space-x-4 pt-8 border-t border-slate-200">
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
                disabled={isSubmitting}
                className="px-8 py-3 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Ticket...</span>
                  </>
                ) : (
                  <>
                    <DocumentPlusIcon className="h-4 w-4" />
                    <span>Create Support Ticket</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateTicketPage;
