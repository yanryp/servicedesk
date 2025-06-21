// BSG Create Ticket Page with Template System
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { BuildingOfficeIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { BSGTemplateSelector } from '../components';
import { TicketPriority } from '../types';
import toast from 'react-hot-toast';

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
  const [attachments, setAttachments] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<BSGTicketFormData>({
    defaultValues: {
      priority: 'medium',
    },
  });

  const handleTemplateSelect = useCallback((template: BSGTemplate | null) => {
    setSelectedTemplate(template);
    
    if (template) {
      // Auto-populate title and description based on template
      const autoTitle = `${template.category_display_name} - ${template.name}`;
      setValue('title', autoTitle);
      setValue('description', template.description || '');
    } else {
      setValue('title', '');
      setValue('description', '');
    }
  }, [setValue]);

  const onSubmit = async (data: BSGTicketFormData) => {
    if (!selectedTemplate) {
      toast.error('Please select a BSG template for your ticket');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call to create BSG ticket
      console.log('Creating BSG ticket:', {
        ...data,
        templateId: selectedTemplate.id,
        templateNumber: selectedTemplate.template_number,
        category: selectedTemplate.category_name,
        attachments: attachments
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('BSG ticket created successfully!');
      // TODO: Navigate to actual ticket detail page
      navigate('/tickets');
      
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Template Selection */}
        <div className="space-y-6">
          <BSGTemplateSelector
            onTemplateSelect={handleTemplateSelect}
            selectedTemplate={selectedTemplate}
            disabled={isSubmitting}
          />
        </div>

        {/* Ticket Form */}
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

            {/* Template Info Display */}
            {selectedTemplate && (
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
            )}

            {/* User Info Display */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h4 className="font-semibold text-slate-800 mb-2">Requester Information</h4>
              <div className="text-sm text-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div><strong>Name:</strong> {user?.username}</div>
                <div><strong>Email:</strong> {user?.email}</div>
                <div><strong>Department:</strong> {user?.department?.name || 'Not specified'}</div>
                <div><strong>Role:</strong> {user?.role}</div>
              </div>
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
                    <span>Create BSG Support Ticket</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BSGCreateTicketPage;