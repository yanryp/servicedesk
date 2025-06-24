// src/pages/ServiceCatalogPage.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  MagnifyingGlassIcon, 
  LifebuoyIcon,
  UsersIcon,
  ServerIcon,
  WifiIcon,
  CreditCardIcon,
  ReceiptPercentIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  ComputerDesktopIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { serviceCatalogService, ServiceCategory, Service, ServiceTemplate } from '../services/serviceCatalog';
import BSGDynamicFieldRenderer from '../components/BSGDynamicFieldRenderer';
import GlobalStorageField from '../components/GlobalStorageField';
import { RootCauseType, IssueCategoryType } from '../types';
import { globalFieldStorage } from '../utils/fieldStorage';
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


const ServiceCatalogPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'categories' | 'services'>('categories');
  const [currentCategory, setCurrentCategory] = useState<ServiceCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ServiceTemplate | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Data states
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchResults, setSearchResults] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  
  // Form states
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  
  // Issue Classification states - now handled by GlobalStorageField

  // Load initial categories
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

  // Search services
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

  // Load service template details
  const loadServiceTemplate = async (service: Service) => {
    try {
      setLoadingTemplate(true);
      const template = await serviceCatalogService.getServiceTemplate(service.id);
      setSelectedTemplate(template);
      setSelectedService(service);
      setTicketTitle(service.name);
      setShowModal(true);
      
      // Reset form states
      setFieldValues({});
      setFieldErrors({});
      setTicketDescription('');
      setAttachments([]);
      
      // Clear global storage when loading new template
      globalFieldStorage.clearAll();
      console.log('🗑️ Cleared global storage for new template');
      
      // Set smart defaults after ensuring DOM elements are ready
      setTimeout(() => {
        setSmartDefaults(template, service);
      }, 500); // Increased delay to ensure GlobalStorageField components have created DOM elements
    } catch (error) {
      console.error('Error loading service template:', error);
      toast.error('Failed to load service details');
    } finally {
      setLoadingTemplate(false);
    }
  };

  // Validate required fields
  const validateFields = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Debug: Log current global storage values
    const currentFieldValues = globalFieldStorage.getAllValues();
    console.log('🔍 Current global storage values:', currentFieldValues);
    
    if (!ticketTitle.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!ticketDescription.trim()) {
      errors.description = 'Description is required';
    }

    // Validate template fields using global storage values
    if (selectedTemplate?.fields) {
      selectedTemplate.fields.forEach(field => {
        if (field.required) {
          // Check global storage using field.name (which becomes fieldName in transformation)
          const value = currentFieldValues[field.name];
          console.log(`🔍 Validating field "${field.name}" (${field.label}): value = "${value}", required = ${field.required}`);
          if (!value || (typeof value === 'string' && !value.trim())) {
            errors[field.name] = `${field.label} is required`;
            console.log(`❌ Field "${field.name}" failed validation`);
          } else {
            console.log(`✅ Field "${field.name}" passed validation`);
          }
        }
      });
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Sync global storage with React state
  useEffect(() => {
    const handleStorageChange = (fieldName: string, value: any) => {
      setFieldValues(prev => ({ ...prev, [fieldName]: value }));
      // Clear error when user starts typing
      if (fieldErrors[fieldName]) {
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    };

    globalFieldStorage.addListener(handleStorageChange);
    
    return () => {
      globalFieldStorage.removeListener(handleStorageChange);
    };
  }, [fieldErrors]);

  // This is no longer used since fields use global storage directly
  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    // This should not be called anymore
    console.warn('handleFieldChange called but fields should use global storage');
  }, []);

  // Set smart default values based on template and category (for all service catalog templates)
  const setSmartDefaults = useCallback((template: ServiceTemplate, service: Service) => {
    const categoryName = template.category?.name?.toLowerCase() || '';
    const serviceName = service.name.toLowerCase();
    const templateName = template.name?.toLowerCase() || '';
    
    console.log(`🎯 Analyzing service for smart defaults:`);
    console.log(`   📂 Category: "${categoryName}"`);
    console.log(`   📋 Service: "${serviceName}"`);
    console.log(`   📄 Template: "${templateName}"`);
    console.log(`   🏷️ Template Type: "${template.type}"`);
    
    let defaultRootCause = '';
    let defaultIssueCategory = '';
    let reasonMatched = '';
    
    // Smart mapping based on service/template characteristics
    if (
      categoryName.includes('hardware') || 
      categoryName.includes('infrastructure') ||
      categoryName.includes('network') ||
      categoryName.includes('technical') ||
      serviceName.includes('hardware') ||
      serviceName.includes('network') ||
      serviceName.includes('server') ||
      serviceName.includes('printer') ||
      serviceName.includes('computer') ||
      serviceName.includes('technical') ||
      templateName.includes('hardware') ||
      templateName.includes('network') ||
      templateName.includes('technical')
    ) {
      defaultRootCause = 'system_error';
      defaultIssueCategory = 'problem';
      reasonMatched = 'Hardware/Infrastructure/Network related';
    } else if (
      categoryName.includes('user') || 
      categoryName.includes('account') ||
      categoryName.includes('access') ||
      categoryName.includes('permission') ||
      serviceName.includes('user') ||
      serviceName.includes('account') ||
      serviceName.includes('password') ||
      serviceName.includes('login') ||
      serviceName.includes('access') ||
      serviceName.includes('permission') ||
      templateName.includes('user') ||
      templateName.includes('account') ||
      templateName.includes('access')
    ) {
      defaultRootCause = 'human_error';
      defaultIssueCategory = 'request';
      reasonMatched = 'User/Account/Access related';
    } else if (
      categoryName.includes('software') || 
      categoryName.includes('application') ||
      categoryName.includes('system') ||
      serviceName.includes('software') ||
      serviceName.includes('application') ||
      serviceName.includes('system') ||
      serviceName.includes('app') ||
      templateName.includes('software') ||
      templateName.includes('application') ||
      templateName.includes('system')
    ) {
      defaultRootCause = 'system_error';
      defaultIssueCategory = 'problem';
      reasonMatched = 'Software/Application/System related';
    } else if (
      categoryName.includes('request') ||
      categoryName.includes('service') ||
      categoryName.includes('klaim') ||
      categoryName.includes('transfer') ||
      categoryName.includes('transaksi') ||
      serviceName.includes('request') ||
      serviceName.includes('service') ||
      serviceName.includes('new') ||
      serviceName.includes('klaim') ||
      serviceName.includes('transfer') ||
      serviceName.includes('bsgtouch') ||
      templateName.includes('request') ||
      templateName.includes('service') ||
      templateName.includes('klaim') ||
      templateName.includes('transfer') ||
      templateName.includes('bsgtouch')
    ) {
      defaultRootCause = 'human_error';
      defaultIssueCategory = 'request';
      reasonMatched = 'Service Request/Transaction related';
    }
    // For general/other templates, leave empty (no defaults)
    
    // Set defaults in global storage if we have them
    if (defaultRootCause && reasonMatched) {
      globalFieldStorage.setValue('rootCause', defaultRootCause);
      console.log(`✅ Set default root cause: "${defaultRootCause}" (${reasonMatched})`);
      
      // Verify DOM element was updated
      setTimeout(() => {
        const element = document.getElementById('rootCause');
        if (element && (element as HTMLSelectElement).value !== defaultRootCause) {
          console.log(`🔄 Retrying root cause update - DOM element not ready initially`);
          globalFieldStorage.setValue('rootCause', defaultRootCause);
        }
      }, 200);
    }
    
    if (defaultIssueCategory && reasonMatched) {
      globalFieldStorage.setValue('issueCategory', defaultIssueCategory);
      console.log(`✅ Set default issue category: "${defaultIssueCategory}" (${reasonMatched})`);
      
      // Verify DOM element was updated
      setTimeout(() => {
        const element = document.getElementById('issueCategory');
        if (element && (element as HTMLSelectElement).value !== defaultIssueCategory) {
          console.log(`🔄 Retrying issue category update - DOM element not ready initially`);
          globalFieldStorage.setValue('issueCategory', defaultIssueCategory);
        }
      }, 200);
    }
    
    if (!reasonMatched) {
      console.log(`ℹ️  No pattern match found - leaving issue classification blank for user choice`);
    }
  }, []);

  // Transform ServiceField to BSGTemplateField for the renderer
  const transformServiceFieldsToBSGFields = useCallback((serviceFields: any[]): any[] => {
    return serviceFields.map(field => ({
      id: field.id,
      fieldName: field.name,
      fieldLabel: field.label,
      // Use original field type if available for proper dropdown detection
      fieldType: field.originalFieldType || field.type,
      isRequired: field.required,
      description: field.description,
      placeholderText: field.placeholder,
      helpText: field.helpText,
      maxLength: field.maxLength,
      validationRules: field.validationRules,
      sortOrder: field.id, // Use field ID as sort order if not available
      options: field.options || [],
      category: field.isDropdownField ? 'location' : 'reference' // Use appropriate category
    }));
  }, []);

  // Create ticket from service catalog
  const handleCreateTicket = async () => {
    if (!selectedService || !selectedTemplate) return;

    if (!validateFields()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Get current field values from global storage
      const currentFieldValues = globalFieldStorage.getAllValues();
      
      // Extract issue classification from global storage (for all service catalog templates)
      const rootCauseValue = currentFieldValues['rootCause'] as RootCauseType;
      const issueCategoryValue = currentFieldValues['issueCategory'] as IssueCategoryType;
      
      const response = await serviceCatalogService.createTicket({
        serviceId: selectedService.id,
        title: ticketTitle,
        description: ticketDescription,
        priority: ticketPriority,
        fieldValues: currentFieldValues,
        attachments: attachments,
        rootCause: rootCauseValue || undefined,
        issueCategory: issueCategoryValue || undefined
      });

      toast.success(`Ticket #${response.data.ticketId} created successfully!`);
      
      // Reset and close modal
      setShowModal(false);
      setSelectedService(null);
      setSelectedTemplate(null);
      setFieldValues({});
      setFieldErrors({});
      setTicketTitle('');
      setTicketDescription('');
      setTicketPriority('medium');
      setAttachments([]);
      
      // Clear global storage (includes issue classification)
      globalFieldStorage.clearAll();
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create ticket. Please try again.');
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
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up"
          onClick={() => loadServicesForCategory(category)}
          style={{
            animationDelay: `${index * 100}ms`
          }}
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
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up"
        onClick={() => loadServiceTemplate(service)}
        style={{
          animationDelay: `${index * 100}ms`
        }}
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

  const renderBreadcrumb = () => {
    return (
      <div className="mb-6">
        <button
          onClick={() => {
            setCurrentView('categories');
            setCurrentCategory(null);
            setSearchTerm('');
          }}
          className="text-blue-600 hover:underline font-medium"
        >
          All Categories
        </button>
        {currentCategory && (
          <span className="text-gray-500">
            <span className="mx-2 text-gray-400">/</span>
            {currentCategory.name}
          </span>
        )}
        {searchTerm && (
          <span className="text-gray-500">
            <span className="mx-2 text-gray-400">/</span>
            Search results for "{searchTerm}"
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="mb-8">
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
        {/* Breadcrumb */}
        {renderBreadcrumb()}
        
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
          ) : currentCategory ? (
            renderServices(services)
          ) : null}
        </div>
      </main>

      
      {/* Service Detail Modal */}
      {showModal && selectedService && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedService.name}</h2>
                <p className="text-gray-600 mt-1">{selectedService.description}</p>
                {selectedTemplate.category && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-2">
                    {selectedTemplate.category.displayName || selectedTemplate.category.name}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedService(null);
                  setSelectedTemplate(null);
                  setFieldValues({});
                  setFieldErrors({});
                  setAttachments([]);
                  setTicketTitle('');
                  setTicketDescription('');
                  setTicketPriority('medium');
                }}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {loadingTemplate ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading service details...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Basic Ticket Information */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Request Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Request Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={ticketTitle}
                          onChange={(e) => setTicketTitle(e.target.value)}
                          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Brief description of your request"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Priority
                        </label>
                        <select
                          value={ticketPriority}
                          onChange={(e) => setTicketPriority(e.target.value as any)}
                          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={ticketDescription}
                          onChange={(e) => setTicketDescription(e.target.value)}
                          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Provide detailed description of your request"
                        />
                      </div>
                    </div>
                  </div>

                  {/* File Attachments */}
                  <div className="bg-gray-50 p-4 rounded-xl">
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
                            <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border">
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
                                onClick={() => removeAttachment(index)}
                                className="text-red-500 hover:text-red-700 p-1"
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

                  {/* Dynamic Fields */}
                  {selectedTemplate.fields && selectedTemplate.fields.length > 0 ? (
                    <BSGDynamicFieldRenderer
                      key="dynamic-fields-renderer"
                      templateId={selectedTemplate.templateId || 0}
                      fields={transformServiceFieldsToBSGFields(selectedTemplate.fields)}
                      values={fieldValues}
                      onChange={handleFieldChange}
                      errors={fieldErrors}
                      showCategories={true}
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No additional fields required for this service.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Issue Classification Section - Available for all service catalog templates */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Issue Classification</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <GlobalStorageField
                      field={{
                        id: 999001,
                        fieldName: 'rootCause',
                        fieldLabel: 'What caused this issue?',
                        fieldType: 'dropdown',
                        isRequired: false,
                        placeholderText: 'Select root cause...',
                        helpText: 'Help us understand what you think caused this issue',
                        sortOrder: 1,
                        category: 'classification'
                      }}
                      masterData={[
                        { value: 'human_error', label: 'User/Process Error' },
                        { value: 'system_error', label: 'Technical/System Error' },
                        { value: 'external_factor', label: 'External Issue' },
                        { value: 'undetermined', label: 'Not Sure / Need Investigation' }
                      ]}
                    />
                  </div>

                  <div>
                    <GlobalStorageField
                      field={{
                        id: 999002,
                        fieldName: 'issueCategory',
                        fieldLabel: 'What type of issue is this?',
                        fieldType: 'dropdown',
                        isRequired: false,
                        placeholderText: 'Select issue type...',
                        helpText: 'Choose the category that best describes your issue',
                        sortOrder: 2,
                        category: 'classification'
                      }}
                      masterData={[
                        { value: 'request', label: 'Service Request - I need something new or changed' },
                        { value: 'complaint', label: 'Service Complaint - I\'m not satisfied with service quality' },
                        { value: 'problem', label: 'Technical Problem - Something is broken or not working' }
                      ]}
                    />
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Why do we ask for this information?</strong> This classification helps our technicians prioritize and route your ticket to the right team faster. You can leave these blank if you're unsure.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
              <button 
                onClick={async () => {
                  await handleCreateTicket();
                }}
                disabled={loadingTemplate || !ticketTitle.trim() || !ticketDescription.trim()}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Submit Request
              </button>
              <p className="text-xs text-gray-500 mt-3 text-center">
                This will create a ticket with your service request and custom field data.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCatalogPage;