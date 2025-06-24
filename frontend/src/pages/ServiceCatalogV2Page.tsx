// Service Catalog V2 - Built with Proven BSG Architecture
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  ArrowLeftIcon,
  MagnifyingGlassIcon, 
  LifebuoyIcon,
  UsersIcon,
  ServerIcon,
  WifiIcon,
  CreditCardIcon,
  ReceiptPercentIcon,
  DocumentTextIcon,
  DocumentPlusIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  ComputerDesktopIcon,
  QrCodeIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import BSGDynamicFieldRenderer from '../components/BSGDynamicFieldRenderer';
import { serviceCatalogService, ServiceCategory, Service, ServiceTemplate } from '../services/serviceCatalog';
import { TicketPriority, RootCauseType, IssueCategoryType } from '../types';
import toast from 'react-hot-toast';

// Icon mapping for categories
const iconMap = {
  'users': UsersIcon,
  'hard-drive': ServerIcon,
  'computer-desktop': ComputerDesktopIcon,
  'wifi': WifiIcon,
  'credit-card': CreditCardIcon,
  'receipt': ReceiptPercentIcon,
  'document-text': DocumentTextIcon,
  'building-office': BuildingOfficeIcon,
  'qr-code': QrCodeIcon,
  'siren': ExclamationTriangleIcon,
};

interface ServiceCatalogFormData {
  title: string;
  description: string;
  priority: TicketPriority;
}

const ServiceCatalogV2Page: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Navigation state
  const [currentView, setCurrentView] = useState<'categories' | 'services' | 'create'>('categories');
  const [currentCategory, setCurrentCategory] = useState<ServiceCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Data state
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchResults, setSearchResults] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);

  // Selected service/template state
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ServiceTemplate | null>(null);
  const [templateFields, setTemplateFields] = useState<any[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Issue classification state
  const [rootCause, setRootCause] = useState<RootCauseType | ''>('');
  const [issueCategory, setIssueCategory] = useState<IssueCategoryType | ''>('');

  // File attachments
  const [attachments, setAttachments] = useState<File[]>([]);

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<ServiceCatalogFormData>({
    defaultValues: {
      priority: 'medium',
    },
  });

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await serviceCatalogService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
        toast.error('Failed to load service categories');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Search services effect
  useEffect(() => {
    const searchServices = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const results = await serviceCatalogService.searchServices(searchTerm);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching services:', error);
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(searchServices, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Handle field changes (React state - no global storage issues)
  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    setFieldValues(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error when user starts typing
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  }, [fieldErrors]);

  // Load services for category
  const loadServicesForCategory = async (category: ServiceCategory) => {
    try {
      setLoadingServices(true);
      const servicesData = await serviceCatalogService.getServicesByCategory(category.id);
      setServices(servicesData);
      setCurrentCategory(category);
      setCurrentView('services');
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Failed to load services for this category');
    } finally {
      setLoadingServices(false);
    }
  };

  // Load service template and switch to create view
  const loadServiceTemplate = async (service: Service) => {
    try {
      setLoadingTemplate(true);
      const template = await serviceCatalogService.getServiceTemplate(service.id);
      
      setSelectedService(service);
      setSelectedTemplate(template);
      
      // Auto-populate form fields
      setValue('title', service.name);
      setValue('description', service.description || '');
      
      // Transform and set template fields
      const transformedFields = transformServiceFieldsToBSGFields(template.fields || []);
      setTemplateFields(transformedFields);
      
      // Reset form state
      setFieldValues({});
      setFieldErrors({});
      setAttachments([]);
      
      // Set smart defaults for issue classification (pass transformed fields)
      setSmartDefaults(template, service, transformedFields);
      
      // Switch to create view
      setCurrentView('create');
      
    } catch (error) {
      console.error('Error loading service template:', error);
      toast.error('Failed to load service details');
    } finally {
      setLoadingTemplate(false);
    }
  };

  // Transform ServiceField to BSGTemplateField format
  const transformServiceFieldsToBSGFields = (serviceFields: any[]): any[] => {
    return serviceFields.map(field => {
      // Debug field transformation
      console.log(`🔍 Transforming field: ${field.label}`, {
        originalType: field.originalFieldType,
        type: field.type,
        isDropdownField: field.isDropdownField,
        hasOptions: !!field.options?.length
      });
      
      let fieldType = field.originalFieldType || field.type;
      
      // Special handling for date fields that might be misidentified
      const fieldLabel = field.label?.toLowerCase() || '';
      const fieldName = field.name?.toLowerCase() || '';
      
      // More aggressive date field detection
      if (fieldLabel.includes('tanggal') || fieldLabel.includes('tgl') || 
          fieldLabel.includes('date') || fieldName.includes('tanggal') || 
          fieldName.includes('tgl') || fieldName.includes('date')) {
        console.log(`📅 Correcting field type for ${field.label} from ${fieldType} to date`);
        fieldType = 'date';
      }
      
      // Currency field detection
      if (fieldLabel.includes('nominal') || fieldLabel.includes('jumlah') || 
          fieldLabel.includes('amount') || fieldName.includes('nominal') || 
          fieldName.includes('jumlah') || fieldName.includes('amount')) {
        console.log(`💰 Correcting field type for ${field.label} from ${fieldType} to currency`);
        fieldType = 'currency';
      }
      
      // Convert Cabang/Capem fields to searchable Unit fields
      let finalFieldLabel = field.label;
      let finalFieldName = field.name;
      if (fieldLabel.includes('cabang') || fieldLabel.includes('capem') || 
          fieldName.includes('cabang') || fieldName.includes('capem')) {
        console.log(`🏢 Converting ${field.label} from ${fieldType} to searchable Unit field`);
        fieldType = 'searchable_dropdown';
        finalFieldLabel = 'Unit'; // Change the label to "Unit"
        finalFieldName = 'Unit'; // Also change the field name for consistency
      }
      
      return {
        id: field.id,
        fieldName: finalFieldName,
        fieldLabel: finalFieldLabel,
        fieldType: fieldType,
        isRequired: field.required,
        description: field.description,
        placeholderText: field.placeholder,
        helpText: field.helpText,
        maxLength: field.maxLength,
        validationRules: field.validationRules,
        sortOrder: field.id,
        options: field.options || [],
        category: field.isDropdownField ? 'location' : 'reference'
      };
    });
  };

  // Set smart defaults with master data for better dropdown matching
  const setSmartDefaultsWithMasterData = (template: ServiceTemplate, service: Service, fields: any[], masterData: Record<string, any[]>) => {
    const categoryName = template.category?.name?.toLowerCase() || '';
    const serviceName = service.name.toLowerCase();
    const templateName = template.name?.toLowerCase() || '';
    
    // Debug user and department info
    console.log('👤 User info for auto-fill:', {
      user: user?.username,
      department: user?.department?.name,
      departmentId: user?.departmentId,
      hasUser: !!user,
      hasDepartment: !!user?.department
    });
    
    // Auto-fill department/unit fields with user's department
    if (user?.department?.name) {
      const departmentName = user.department.name;
      console.log(`🏢 Will auto-fill department/unit fields with: ${departmentName}`);
      
      fields.forEach(field => {
        const fieldName = field.fieldName.toLowerCase();
        const fieldLabel = field.fieldLabel.toLowerCase();
        
        console.log(`🔍 Checking field: ${field.fieldLabel} (${field.fieldName})`);
        
        // Check if this is a department/unit field
        if (fieldName.includes('unit') || fieldName.includes('department') || 
            fieldName.includes('divisi') || fieldName.includes('bagian') ||
            fieldName.includes('organisasi') || fieldName.includes('instansi') ||
            fieldName.includes('cabang') || fieldName.includes('capem') ||
            fieldLabel.includes('unit') || fieldLabel.includes('department') ||
            fieldLabel.includes('divisi') || fieldLabel.includes('bagian') ||
            fieldLabel.includes('organisasi') || fieldLabel.includes('instansi') ||
            fieldLabel.includes('unit kerja') || fieldLabel.includes('satuan kerja') ||
            fieldLabel === 'unit') {
          
          // Get the options for this field
          const fieldOptions = masterData[field.fieldName] || [];
          console.log(`📋 Field ${field.fieldLabel} has ${fieldOptions.length} options`);
          
          // Try to find a matching option
          const matchingOption = findBestMatch(departmentName, fieldOptions);
          
          if (matchingOption) {
            console.log(`✅ Auto-filling ${field.fieldLabel} with ${matchingOption.label} (value: ${matchingOption.value})`);
            // For searchable dropdowns, set the display label, not the value
            const valueToSet = field.fieldType === 'searchable_dropdown' ? matchingOption.label : matchingOption.value;
            // Add small delay to ensure field is ready
            setTimeout(() => handleFieldChange(field.fieldName, valueToSet), 100);
          } else {
            console.log(`❌ No matching option found for ${departmentName} in ${field.fieldLabel}`);
          }
        }
        
        // Fallback: Also check Cabang/Capem fields but warn about mismatch
        else if (fieldName.includes('cabang') || fieldName.includes('capem') || 
                 fieldName.includes('branch') ||
                 fieldLabel.includes('cabang') || fieldLabel.includes('capem') ||
                 fieldLabel.includes('branch')) {
          
          console.log(`⚠️ Warning: ${field.fieldLabel} appears to be a branch field, but user has department "${departmentName}"`);
          console.log(`   Branch fields typically contain physical locations, not organizational departments`);
          
          // Still try to match but with lower confidence
          const fieldOptions = masterData[field.fieldName] || [];
          const matchingOption = findBestMatch(departmentName, fieldOptions);
          
          if (matchingOption) {
            console.log(`🎯 Found potential match: ${matchingOption.label} (low confidence)`);
            // For searchable dropdowns, set the display label, not the value
            const valueToSet = field.fieldType === 'searchable_dropdown' ? matchingOption.label : matchingOption.value;
            // Add small delay to ensure field is ready
            setTimeout(() => handleFieldChange(field.fieldName, valueToSet), 100);
          } else {
            console.log(`❌ No branch match found for department "${departmentName}"`);
          }
        }
      });
    } else {
      console.log('❌ Cannot auto-fill: User has no department assigned');
    }
    
    // Set issue classification defaults (same as before)
    setIssueClassificationDefaults(categoryName, serviceName, templateName);
  };

  // Helper function to find best matching option in dropdown
  const findBestMatch = (searchValue: string, options: any[]): any | null => {
    if (!searchValue || !options.length) return null;
    
    const search = searchValue.toLowerCase();
    
    // Try exact match first
    for (const option of options) {
      const optionText = (option.label || option.displayName || option.name || '').toLowerCase();
      if (optionText === search) {
        console.log(`🎯 Exact match found: ${option.label}`);
        return option;
      }
    }
    
    // Try partial match (search term contains option or vice versa)
    for (const option of options) {
      const optionText = (option.label || option.displayName || option.name || '').toLowerCase();
      if (optionText.includes(search) || search.includes(optionText)) {
        console.log(`🎯 Partial match found: ${option.label}`);
        return option;
      }
    }
    
    // Try word-based matching
    const searchWords = search.split(' ');
    for (const option of options) {
      const optionText = (option.label || option.displayName || option.name || '').toLowerCase();
      const optionWords = optionText.split(' ');
      
      const commonWords = searchWords.filter(word => 
        optionWords.some((optionWord: string) => 
          optionWord.includes(word) || word.includes(optionWord)
        )
      );
      
      if (commonWords.length > 0) {
        console.log(`🎯 Word-based match found: ${option.label} (${commonWords.length} common words)`);
        return option;
      }
    }
    
    console.log(`❌ No match found for "${searchValue}" in options:`, options.slice(0, 3));
    return null;
  };

  // Extract issue classification logic for reuse
  const setIssueClassificationDefaults = (categoryName: string, serviceName: string, templateName: string) => {
    // Smart mapping logic
    if (
      categoryName.includes('hardware') || 
      categoryName.includes('infrastructure') ||
      categoryName.includes('network') ||
      categoryName.includes('technical') ||
      serviceName.includes('hardware') ||
      serviceName.includes('network') ||
      serviceName.includes('server') ||
      templateName.includes('hardware') ||
      templateName.includes('network')
    ) {
      setRootCause('system_error' as RootCauseType);
      setIssueCategory('problem' as IssueCategoryType);
    } else if (
      categoryName.includes('user') || 
      categoryName.includes('account') ||
      categoryName.includes('transfer') ||
      categoryName.includes('klaim') ||
      serviceName.includes('user') ||
      serviceName.includes('account') ||
      serviceName.includes('bsgtouch') ||
      serviceName.includes('transfer') ||
      templateName.includes('user') ||
      templateName.includes('transfer')
    ) {
      setRootCause('human_error' as RootCauseType);
      setIssueCategory('request' as IssueCategoryType);
    } else if (
      categoryName.includes('software') || 
      categoryName.includes('application') ||
      serviceName.includes('software') ||
      serviceName.includes('application') ||
      templateName.includes('software')
    ) {
      setRootCause('system_error' as RootCauseType);
      setIssueCategory('problem' as IssueCategoryType);
    }
  };

  // Original smart defaults function (fallback for when master data isn't available)
  const setSmartDefaults = (template: ServiceTemplate, service: Service, fields: any[]) => {
    const categoryName = template.category?.name?.toLowerCase() || '';
    const serviceName = service.name.toLowerCase();
    const templateName = template.name?.toLowerCase() || '';
    
    // Just set issue classification defaults without branch auto-fill
    setIssueClassificationDefaults(categoryName, serviceName, templateName);
  };

  // Validate template fields
  const validateFields = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (templateFields) {
      templateFields.forEach(field => {
        if (field.isRequired) {
          const value = fieldValues[field.fieldName];
          if (!value || (typeof value === 'string' && !value.trim())) {
            errors[field.fieldName] = `${field.fieldLabel} is required`;
          }
        }
      });
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form
  const onSubmit = async (data: ServiceCatalogFormData) => {
    if (!selectedService || !selectedTemplate) return;

    if (!validateFields()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await serviceCatalogService.createTicket({
        serviceId: selectedService.id,
        title: data.title,
        description: data.description,
        priority: data.priority,
        fieldValues: fieldValues,
        attachments: attachments,
        rootCause: rootCause === '' ? undefined : rootCause,
        issueCategory: issueCategory === '' ? undefined : issueCategory
      });

      toast.success(`Ticket #${response.data.ticketId} created successfully!`);
      
      // Navigate to tickets page
      navigate('/tickets');
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      // Validate file size (max 10MB per file)
      const maxSize = 10 * 1024 * 1024;
      const validFiles = newFiles.filter(file => {
        if (file.size > maxSize) {
          toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
          return false;
        }
        return true;
      });
      
      setAttachments(prev => [...prev, ...validFiles]);
    }
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Render categories view
  const renderCategories = () => {
    if (loading) {
      return Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="bg-gray-200 p-6 rounded-2xl animate-pulse">
          <div className="bg-gray-300 rounded-xl w-14 h-14 mb-4"></div>
          <div className="bg-gray-300 h-4 rounded mb-2"></div>
          <div className="bg-gray-300 h-3 rounded w-3/4"></div>
        </div>
      ));
    }

    return categories.map((category, index) => {
      const IconComponent = iconMap[category.icon as keyof typeof iconMap] || DocumentTextIcon;
      
      return (
        <div
          key={category.id}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          onClick={() => loadServicesForCategory(category)}
        >
          <div className="flex items-center justify-center bg-blue-100 text-blue-600 rounded-xl w-14 h-14 mb-4">
            <IconComponent className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
          <p className="text-sm text-gray-500 mt-1 h-10">{category.description}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {category.serviceCount} service{category.serviceCount !== 1 ? 's' : ''}
            </span>
            {category.type === 'bsg_category' && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                BSG Template
              </span>
            )}
          </div>
        </div>
      );
    });
  };

  // Render services view
  const renderServices = (servicesToRender: Service[]) => {
    if (loadingServices) {
      return Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-gray-200 p-6 rounded-2xl animate-pulse">
          <div className="bg-gray-300 rounded-xl w-14 h-14 mb-4"></div>
          <div className="bg-gray-300 h-4 rounded mb-2"></div>
          <div className="bg-gray-300 h-3 rounded w-3/4"></div>
        </div>
      ));
    }

    return servicesToRender.map((service, index) => (
      <div
        key={service.id}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        onClick={() => loadServiceTemplate(service)}
      >
        <div className="flex items-center justify-center bg-blue-100 text-blue-600 rounded-xl w-14 h-14 mb-4">
          <DocumentTextIcon className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
        <p className="text-sm text-gray-500 mt-1 h-10">{service.description}</p>
        <div className="flex items-center justify-between mt-3">
          {service.hasFields && (
            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              {service.fieldCount} field{(service.fieldCount || 0) !== 1 ? 's' : ''}
            </span>
          )}
          {service.type === 'bsg_service' && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              BSG Service
            </span>
          )}
        </div>
      </div>
    ));
  };

  // Render breadcrumb navigation
  const renderBreadcrumb = () => {
    return (
      <div className="mb-6 flex items-center space-x-2">
        <button
          onClick={() => {
            if (currentView === 'create') {
              setCurrentView(currentCategory ? 'services' : 'categories');
            } else if (currentView === 'services') {
              setCurrentView('categories');
              setCurrentCategory(null);
              setSearchTerm('');
            }
          }}
          className="text-blue-600 hover:underline font-medium flex items-center"
        >
          {currentView !== 'categories' && <ArrowLeftIcon className="w-4 h-4 mr-1" />}
          {currentView === 'create' ? 'Back to Services' : 'All Categories'}
        </button>
        {currentCategory && currentView !== 'create' && (
          <span className="text-gray-500">
            <span className="mx-2 text-gray-400">/</span>
            {currentCategory.name}
          </span>
        )}
        {searchTerm && currentView !== 'create' && (
          <span className="text-gray-500">
            <span className="mx-2 text-gray-400">/</span>
            Search results for "{searchTerm}"
          </span>
        )}
        {selectedService && currentView === 'create' && (
          <span className="text-gray-500">
            <span className="mx-2 text-gray-400">/</span>
            {selectedService.name}
          </span>
        )}
      </div>
    );
  };

  // Main render logic
  if (currentView === 'create' && selectedService && selectedTemplate) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="mb-8">
          {renderBreadcrumb()}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedService.name}</h1>
              <p className="mt-1 text-lg text-gray-600">{selectedService.description}</p>
            </div>
            <div className="p-3 bg-blue-600 rounded-full text-white">
              <DocumentTextIcon className="w-7 h-7" />
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Ticket Information */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <DocumentPlusIcon className="w-6 h-6 mr-2 text-blue-600" />
              Ticket Details
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Request Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  {...register('title', { 
                    required: 'Title is required',
                    minLength: { value: 5, message: 'Title must be at least 5 characters' }
                  })}
                  disabled={isSubmitting}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of your request"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  id="priority"
                  {...register('priority', { required: 'Priority is required' })}
                  disabled={isSubmitting}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                {errors.priority && (
                  <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows={4}
                  {...register('description', { 
                    required: 'Description is required',
                    minLength: { value: 10, message: 'Description must be at least 10 characters' }
                  })}
                  disabled={isSubmitting}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide detailed description of your request"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Template Fields */}
          {loadingTemplate ? (
            <div className="flex items-center justify-center py-12 bg-gray-50 rounded-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading template fields...</span>
            </div>
          ) : templateFields.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <BSGDynamicFieldRenderer
                templateId={selectedTemplate.templateId || 0}
                fields={templateFields}
                values={fieldValues}
                onChange={handleFieldChange}
                errors={fieldErrors}
                disabled={isSubmitting}
                showCategories={templateFields.length > 6}
                onMasterDataLoaded={(masterData) => setSmartDefaultsWithMasterData(selectedTemplate, selectedService, templateFields, masterData)}
              />
            </div>
          ) : null}

          {/* Issue Classification */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Issue Classification</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What caused this issue?
                </label>
                <select
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value as RootCauseType | '')}
                  disabled={isSubmitting}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select root cause...</option>
                  <option value="human_error">User/Process Error</option>
                  <option value="system_error">Technical/System Error</option>
                  <option value="external_factor">External Issue</option>
                  <option value="undetermined">Not Sure / Need Investigation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What type of issue is this?
                </label>
                <select
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value as IssueCategoryType | '')}
                  disabled={isSubmitting}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select issue type...</option>
                  <option value="request">Service Request - I need something new or changed</option>
                  <option value="complaint">Service Complaint - I'm not satisfied with service quality</option>
                  <option value="problem">Technical Problem - Something is broken or not working</option>
                </select>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Why do we ask for this information?</strong> This classification helps our technicians prioritize and route your ticket to the right team faster. You can leave these blank if you're unsure.
              </p>
            </div>
          </div>

          {/* File Attachments */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">File Attachments</h3>
            
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.txt"
                disabled={isSubmitting}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PDF, DOC, XLS, Images (max 10MB each)
                  </span>
                </div>
              </label>
            </div>

            {/* Attached Files List */}
            {attachments.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Attached Files ({attachments.length})
                </h4>
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        disabled={isSubmitting}
                        className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                        title="Remove file"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-blue-800 flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                User Information
              </h4>
            </div>
            <div className="text-sm text-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col">
                <span className="font-medium text-gray-600">Name:</span>
                <span className="text-gray-800">{user?.username}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-600">Email:</span>
                <span className="text-gray-800">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setCurrentView(currentCategory ? 'services' : 'categories')}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Ticket...
                </>
              ) : (
                'Create Ticket'
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Categories and Services browsing view
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="mb-8">
        {renderBreadcrumb()}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">IT Service Catalog</h1>
            <p className="mt-1 text-lg text-gray-600">How can we help you today?</p>
          </div>
          <div className="p-3 bg-blue-600 rounded-full text-white">
            <LifebuoyIcon className="w-7 h-7" />
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mt-6 relative">
          <input
            type="text"
            placeholder="Search for a service (e.g., 'password', 'new user', 'printer')..."
            className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </header>

      <main>
        {/* Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {searchTerm ? (
            searchResults.length > 0 ? (
              renderServices(searchResults)
            ) : (
              <div className="col-span-full text-center py-16">
                <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">No Services Found</h3>
                <p className="text-gray-500 mt-1">
                  We couldn't find any services matching your search. Try using different keywords.
                </p>
              </div>
            )
          ) : currentView === 'categories' ? (
            renderCategories()
          ) : currentView === 'services' && currentCategory ? (
            renderServices(services)
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default ServiceCatalogV2Page;