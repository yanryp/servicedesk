// src/pages/CreateTicketPage.tsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { DocumentPlusIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { ticketsService } from '../services';
import { CategorySelector, TemplateSelector } from '../components';
import { CustomFieldsForm, useCustomFieldsValidation } from '../components/CustomFields';
import { Item, TicketTemplate, TicketPriority, CreateTicketRequest } from '../types';
import toast from 'react-hot-toast';

interface TicketFormData {
  title: string;
  description: string;
  priority: TicketPriority;
}

const CreateTicketPage: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TicketTemplate | null>(null);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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
    setCustomFieldValues({});
    setCustomFieldErrors({});
  }, []);

  const handleTemplateSelect = useCallback((template: TicketTemplate | null) => {
    setSelectedTemplate(template);
    setCustomFieldValues({});
    setCustomFieldErrors({});
  }, []);

  const handleCustomFieldsChange = (values: Record<string, string>) => {
    setCustomFieldValues(values);
    // Clear errors for changed fields
    const newErrors = { ...customFieldErrors };
    Object.keys(values).forEach(fieldId => {
      if (newErrors[fieldId]) {
        delete newErrors[fieldId];
      }
    });
    setCustomFieldErrors(newErrors);
  };

  const onSubmit = async (data: TicketFormData) => {
    if (!selectedItem) {
      toast.error('Please select an item for your ticket');
      return;
    }

    // Validate custom fields
    const fieldErrors = validateFields(customFieldValues);
    if (Object.keys(fieldErrors).length > 0) {
      setCustomFieldErrors(fieldErrors);
      toast.error('Please fix the errors in the custom fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketData: CreateTicketRequest = {
        title: data.title,
        description: data.description,
        itemId: selectedItem.id,
        priority: data.priority,
        templateId: selectedTemplate?.id,
        customFieldValues: convertToApiFormat(customFieldValues),
      };


      const createdTicket = await ticketsService.createTicket(ticketData, attachments || undefined);
      
      toast.success('Ticket created successfully!');
      navigate(`/tickets/${createdTicket.id}`);
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      // Error is already handled by the API interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    setSelectedItem(null);
    setSelectedTemplate(null);
    setCustomFieldValues({});
    setCustomFieldErrors({});
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

          {/* Template Selection */}
          {selectedItem && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Template Selection</h2>
              <TemplateSelector
                selectedItem={selectedItem}
                onTemplateSelect={handleTemplateSelect}
                disabled={isSubmitting}
              />
            </div>
          )}

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
                      onChange={(e) => setAttachments(e.target.files)}
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
            </div>
          )}

          {/* Custom Fields */}
          {selectedTemplate && selectedTemplate.customFields && selectedTemplate.customFields.length > 0 && (
            <CustomFieldsForm
              fields={selectedTemplate.customFields}
              values={customFieldValues}
              onChange={handleCustomFieldsChange}
              errors={customFieldErrors}
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
