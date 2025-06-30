// Service Catalog V2 - Built with Proven BSG Architecture
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  ArrowLeftIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon, 
  LifebuoyIcon,
  UsersIcon,
  ServerIcon,
  ServerStackIcon,
  WifiIcon,
  CreditCardIcon,
  ReceiptPercentIcon,
  DocumentTextIcon,
  DocumentPlusIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  ComputerDesktopIcon,
  QrCodeIcon,
  UserIcon,
  BanknotesIcon,
  CircleStackIcon,
  DocumentChartBarIcon,
  ShieldCheckIcon,
  PhoneIcon,
  DevicePhoneMobileIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  WrenchScrewdriverIcon,
  GlobeAltIcon,
  KeyIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import BSGDynamicFieldRenderer from '../components/BSGDynamicFieldRenderer';
import { serviceCatalogService, ServiceCategory, Service, ServiceTemplate } from '../services/serviceCatalog';
import { TicketPriority, RootCauseType, IssueCategoryType } from '../types';
import toast from 'react-hot-toast';

// Enhanced icon mapping for categories
const iconMap = {
  // Core Banking
  'users': UsersIcon,
  'credit-card': CreditCardIcon,
  'banknotes': BanknotesIcon,
  'currency-dollar': CurrencyDollarIcon,
  'circle-stack': CircleStackIcon, // For actual cash stacks
  'atm': CreditCardIcon, // ATM services - better represents card operations
  
  // Technology & Hardware  
  'hard-drive': ServerIcon,
  'computer-desktop': ComputerDesktopIcon,
  'server': ServerIcon,
  'server-stack': ServerStackIcon, // For banking systems/OLIB
  'wifi': WifiIcon,
  'globe-alt': GlobeAltIcon,
  
  // Digital Services
  'receipt': ReceiptPercentIcon,
  'qr-code': QrCodeIcon,
  'device-phone-mobile': DevicePhoneMobileIcon,
  
  // Support & Admin
  'document-text': DocumentTextIcon,
  'clipboard-document-list': ClipboardDocumentListIcon,
  'building-office': BuildingOfficeIcon,
  'phone': PhoneIcon,
  'shield-check': ShieldCheckIcon,
  'key': KeyIcon,
  
  // Operations
  'cog': CogIcon,
  'wrench-screwdriver': WrenchScrewdriverIcon,
  'chart-bar': ChartBarIcon,
  'document-chart-bar': DocumentChartBarIcon,
  'presentation-chart-line': PresentationChartLineIcon,
  
  // Alerts & Issues
  'siren': ExclamationTriangleIcon,
  'exclamation-triangle': ExclamationTriangleIcon,

  // Fallback
  'default': DocumentTextIcon
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
      console.log('⚠️ Cannot auto-fill department fields: User has no department assigned');
      // Try to auto-fill with user's unit if available
      if (user?.unit?.name) {
        const unitName = user.unit.name;
        console.log(`🏢 Will auto-fill unit fields with: ${unitName}`);
        
        fields.forEach(field => {
          const fieldName = field.fieldName.toLowerCase();
          const fieldLabel = field.fieldLabel.toLowerCase();
          
          // Check if this is a unit field
          if (fieldName.includes('unit') || fieldName.includes('cabang') || fieldName.includes('capem') ||
              fieldLabel.includes('unit') || fieldLabel.includes('cabang') || fieldLabel.includes('capem')) {
            console.log(`🎯 Auto-filling unit field: ${field.fieldLabel} with "${unitName}"`);
            handleFieldChange(field.fieldName, unitName);
          }
        });
      } else {
        console.log('⚠️ User has no department or unit assigned - skipping auto-fill');
      }
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
    const category = categoryName.toLowerCase();
    const service = serviceName.toLowerCase();
    const template = templateName.toLowerCase();
    
    // BSG-specific template classifications
    if (
      category.includes('kasda') || 
      category.includes('treasury') ||
      service.includes('kasda') ||
      template.includes('kasda') ||
      template.includes('treasury')
    ) {
      setRootCause('external_factor' as RootCauseType);
      setIssueCategory('request' as IssueCategoryType);
    } else if (
      category.includes('atm') ||
      service.includes('atm') ||
      template.includes('atm')
    ) {
      setRootCause('system_error' as RootCauseType);
      setIssueCategory('problem' as IssueCategoryType);
    } else if (
      category.includes('qris') ||
      service.includes('qris') ||
      template.includes('qris') ||
      template.includes('payment')
    ) {
      setRootCause('system_error' as RootCauseType);
      setIssueCategory('problem' as IssueCategoryType);
    } else if (
      category.includes('olibs') ||
      service.includes('olibs') ||
      template.includes('olibs') ||
      template.includes('online banking')
    ) {
      setRootCause('system_error' as RootCauseType);
      setIssueCategory('problem' as IssueCategoryType);
    } else if (
      category.includes('xcard') ||
      category.includes('card') ||
      service.includes('card') ||
      template.includes('card') ||
      template.includes('xcard')
    ) {
      setRootCause('system_error' as RootCauseType);
      setIssueCategory('complaint' as IssueCategoryType);
    } else if (
      category.includes('klaim') ||
      category.includes('claim') ||
      service.includes('klaim') ||
      service.includes('claim') ||
      template.includes('klaim') ||
      template.includes('claim')
    ) {
      setRootCause('external_factor' as RootCauseType);
      setIssueCategory('request' as IssueCategoryType);
    } else if (
      category.includes('switching') ||
      service.includes('switching') ||
      template.includes('switching')
    ) {
      setRootCause('system_error' as RootCauseType);
      setIssueCategory('problem' as IssueCategoryType);
    } else if (
      // Hardware & Infrastructure
      category.includes('hardware') || 
      category.includes('infrastructure') ||
      category.includes('network') ||
      category.includes('technical') ||
      service.includes('hardware') ||
      service.includes('network') ||
      service.includes('server') ||
      template.includes('hardware') ||
      template.includes('network') ||
      template.includes('maintenance')
    ) {
      setRootCause('system_error' as RootCauseType);
      setIssueCategory('problem' as IssueCategoryType);
    } else if (
      // User-related requests
      category.includes('user') || 
      category.includes('account') ||
      category.includes('transfer') ||
      service.includes('user') ||
      service.includes('account') ||
      service.includes('bsgtouch') ||
      service.includes('transfer') ||
      template.includes('user') ||
      template.includes('transfer')
    ) {
      setRootCause('human_error' as RootCauseType);
      setIssueCategory('request' as IssueCategoryType);
    } else if (
      // Software & Applications
      category.includes('software') || 
      category.includes('application') ||
      service.includes('software') ||
      service.includes('application') ||
      template.includes('software') ||
      template.includes('instalasi')
    ) {
      setRootCause('system_error' as RootCauseType);
      setIssueCategory('problem' as IssueCategoryType);
    } else if (
      // General requests
      category.includes('general') ||
      service.includes('general') ||
      service.includes('lainnya') ||
      service.includes('other') ||
      template.includes('general')
    ) {
      setRootCause('undetermined' as RootCauseType);
      setIssueCategory('request' as IssueCategoryType);
    }
    
    console.log(`🎯 Auto-classification applied:`, {
      category: categoryName,
      service: serviceName,
      template: templateName,
      rootCause: rootCause,
      issueCategory: issueCategory
    });
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
          
          // Enhanced validation for different field types
          if (!value || (typeof value === 'string' && !value.trim())) {
            // Special handling for dropdown fields with no options available
            if (field.fieldType.includes('dropdown') && value === 'NO_OPTIONS_AVAILABLE') {
              // Don't mark as error if no options are available
              console.log(`⚠️ Skipping validation for ${field.fieldLabel} - no options available`);
              return;
            }
            
            errors[field.fieldName] = `${field.fieldLabel} is required`;
          }
          
          // Additional validation for specific field types
          if (field.fieldType === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors[field.fieldName] = `${field.fieldLabel} must be a valid email address`;
            }
          }
          
          if (field.fieldType === 'phone' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
              errors[field.fieldName] = `${field.fieldLabel} must be a valid phone number`;
            }
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
        <div key={index} className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-slate-300 rounded-3xl blur-lg opacity-50 animate-pulse"></div>
          <div className="relative bg-white/70 backdrop-blur-md border border-white/30 p-8 rounded-3xl animate-pulse">
            <div className="bg-slate-300 rounded-2xl w-16 h-16 mb-6 animate-pulse"></div>
            <div className="bg-slate-300 h-5 rounded-lg mb-3 animate-pulse"></div>
            <div className="bg-slate-300 h-4 rounded-lg w-3/4 animate-pulse"></div>
          </div>
        </div>
      ));
    }

    return categories.map((category, index) => {
      // Enhanced category icon selection with fallback logic
      const getCategoryIcon = () => {
        // First try the category's icon field
        if (category.icon && iconMap[category.icon as keyof typeof iconMap]) {
          return iconMap[category.icon as keyof typeof iconMap];
        }
        
        // Fallback to name-based detection
        const categoryName = category.name.toLowerCase();
        if (categoryName.includes('atm') || categoryName.includes('hardware')) {
          return CreditCardIcon; // Better representation for ATM services
        } else if (categoryName.includes('claims') || categoryName.includes('dispute')) {
          return ClipboardDocumentListIcon;
        } else if (categoryName.includes('core') || categoryName.includes('banking') || categoryName.includes('financial')) {
          return ServerStackIcon; // Better for core banking systems/OLIB
        } else if (categoryName.includes('corporate') || categoryName.includes('employee') || categoryName.includes('support')) {
          return UsersIcon;
        } else if (categoryName.includes('digital') || categoryName.includes('channel')) {
          return QrCodeIcon;
        } else if (categoryName.includes('general') || categoryName.includes('default')) {
          return DocumentTextIcon;
        } else if (categoryName.includes('kasda') || categoryName.includes('treasury')) {
          return BanknotesIcon;
        } else {
          return DocumentTextIcon; // Final fallback
        }
      };
      
      const IconComponent = getCategoryIcon();
      
      return (
        <div
          key={category.id}
          className="relative group cursor-pointer"
          style={{ animationDelay: `${index * 100}ms` }}
          onClick={() => loadServicesForCategory(category)}
        >
          {/* Glassmorphism glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-105"></div>
          
          {/* Main card */}
          <div className="relative bg-white/80 backdrop-blur-md border border-white/30 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:bg-white/90">
            {/* Icon container with gradient */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-md opacity-15 group-hover:opacity-25 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl w-16 h-16 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <IconComponent className="w-8 h-8" />
              </div>
            </div>
            
            {/* Content */}
            <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-slate-900 transition-colors">
              {category.name}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed h-12 group-hover:text-slate-700 transition-colors">
              {category.description}
            </p>
            
            {/* Tags */}
            <div className="flex items-center justify-between mt-6">
              <span className="text-xs font-medium text-blue-700 bg-blue-100/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-blue-200/50">
                {category.serviceCount} service{category.serviceCount !== 1 ? 's' : ''}
              </span>
              {category.type === 'bsg_category' && (
                <span className="text-xs font-medium text-emerald-700 bg-emerald-100/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-emerald-200/50">
                  BSG Template
                </span>
              )}
            </div>
            
            {/* Subtle hover indicator */}
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ArrowRightIcon className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>
      );
    });
  };

  // Render services view
  const renderServices = (servicesToRender: Service[]) => {
    if (loadingServices) {
      return Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-slate-300 rounded-3xl blur-lg opacity-50 animate-pulse"></div>
          <div className="relative bg-white/70 backdrop-blur-md border border-white/30 p-8 rounded-3xl animate-pulse">
            <div className="bg-slate-300 rounded-2xl w-16 h-16 mb-6 animate-pulse"></div>
            <div className="bg-slate-300 h-5 rounded-lg mb-3 animate-pulse"></div>
            <div className="bg-slate-300 h-4 rounded-lg w-3/4 animate-pulse"></div>
          </div>
        </div>
      ));
    }

    return servicesToRender.map((service, index) => {
      // Enhanced dynamic icon selection based on service name/category
      const getServiceIcon = () => {
        const serviceName = service.name.toLowerCase();
        
        // ATM & Cash Services
        if (serviceName.includes('atm') || serviceName.includes('cash') || serviceName.includes('tunai')) {
          return CreditCardIcon; // Better representation for ATM card operations
        }
        // EDC & Payment Terminals
        else if (serviceName.includes('edc') || serviceName.includes('terminal') || serviceName.includes('pos')) {
          return CreditCardIcon;
        }
        // KASDA & Treasury Services
        else if (serviceName.includes('kasda') || serviceName.includes('treasury') || serviceName.includes('bendahara')) {
          return BanknotesIcon;
        }
        // Core Banking & Financial Systems (OLIB)
        else if (serviceName.includes('core') || serviceName.includes('banking') || serviceName.includes('financial') || serviceName.includes('keuangan') || serviceName.includes('olib')) {
          return ServerStackIcon; // Better for core banking systems/OLIB
        }
        // QRIS & Digital Payments
        else if (serviceName.includes('qris') || serviceName.includes('digital') || serviceName.includes('payment') || serviceName.includes('pembayaran')) {
          return QrCodeIcon;
        }
        // Network & Communication
        else if (serviceName.includes('network') || serviceName.includes('wifi') || serviceName.includes('internet') || serviceName.includes('jaringan')) {
          return WifiIcon;
        }
        // User Management & Accounts
        else if (serviceName.includes('user') || serviceName.includes('account') || serviceName.includes('pengguna') || serviceName.includes('akun')) {
          return UsersIcon;
        }
        // Reports & Analytics
        else if (serviceName.includes('report') || serviceName.includes('laporan') || serviceName.includes('analytic') || serviceName.includes('chart')) {
          return DocumentChartBarIcon;
        }
        // Hardware & Equipment
        else if (serviceName.includes('hardware') || serviceName.includes('equipment') || serviceName.includes('perangkat')) {
          return ComputerDesktopIcon;
        }
        // Server & System Infrastructure
        else if (serviceName.includes('server') || serviceName.includes('system') || serviceName.includes('infrastruktur')) {
          return ServerIcon;
        }
        // Branch & Office Services
        else if (serviceName.includes('branch') || serviceName.includes('cabang') || serviceName.includes('office') || serviceName.includes('kantor')) {
          return BuildingOfficeIcon;
        }
        // Support & Help Services
        else if (serviceName.includes('support') || serviceName.includes('help') || serviceName.includes('bantuan') || serviceName.includes('dukungan')) {
          return PhoneIcon;
        }
        // Security & Access
        else if (serviceName.includes('security') || serviceName.includes('access') || serviceName.includes('keamanan') || serviceName.includes('akses')) {
          return ShieldCheckIcon;
        }
        // Configuration & Settings
        else if (serviceName.includes('config') || serviceName.includes('setting') || serviceName.includes('pengaturan') || serviceName.includes('konfigurasi')) {
          return CogIcon;
        }
        // Maintenance & Repair
        else if (serviceName.includes('maintenance') || serviceName.includes('repair') || serviceName.includes('pemeliharaan') || serviceName.includes('perbaikan')) {
          return WrenchScrewdriverIcon;
        }
        // Mobile & Apps
        else if (serviceName.includes('mobile') || serviceName.includes('app') || serviceName.includes('aplikasi') || serviceName.includes('handphone')) {
          return DevicePhoneMobileIcon;
        }
        // Claims & Disputes
        else if (serviceName.includes('claim') || serviceName.includes('dispute') || serviceName.includes('klaim') || serviceName.includes('sengketa')) {
          return ClipboardDocumentListIcon;
        }
        // Default fallback
        else {
          return DocumentTextIcon;
        }
      };

      const ServiceIcon = getServiceIcon();

      return (
        <div
          key={service.id}
          className="relative group cursor-pointer"
          style={{ animationDelay: `${index * 100}ms` }}
          onClick={() => loadServiceTemplate(service)}
        >
          {/* Glassmorphism glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-105"></div>
          
          {/* Main card */}
          <div className="relative bg-white/80 backdrop-blur-md border border-white/30 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:bg-white/90">
            {/* Icon container with gradient */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-md opacity-15 group-hover:opacity-25 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl w-16 h-16 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ServiceIcon className="w-8 h-8" />
              </div>
            </div>
          
          {/* Content */}
          <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-slate-900 transition-colors">
            {service.name}
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed h-12 group-hover:text-slate-700 transition-colors">
            {service.description}
          </p>
          
          {/* Tags */}
          <div className="flex items-center justify-between mt-6">
            {service.hasFields && (
              <span className="text-xs font-medium text-purple-700 bg-purple-100/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-purple-200/50">
                {service.fieldCount} field{(service.fieldCount || 0) !== 1 ? 's' : ''}
              </span>
            )}
            {service.type === 'bsg_service' && (
              <span className="text-xs font-medium text-emerald-700 bg-emerald-100/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-emerald-200/50">
                BSG Service
              </span>
            )}
          </div>
          
          {/* Subtle hover indicator */}
          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ArrowRightIcon className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      </div>
    )});
  };

  // Render breadcrumb navigation
  const renderBreadcrumb = () => {
    return (
      <div className="mb-8">
        <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center space-x-3">
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
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              {currentView !== 'categories' && <ArrowLeftIcon className="w-4 h-4" />}
              <span>{currentView === 'create' ? 'Back to Services' : 'All Categories'}</span>
            </button>
            {currentCategory && currentView !== 'create' && (
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 text-lg">/</span>
                <span className="text-slate-700 font-medium px-3 py-1 bg-slate-100/80 backdrop-blur-sm rounded-lg border border-slate-200/50">
                  {currentCategory.name}
                </span>
              </div>
            )}
            {searchTerm && currentView !== 'create' && (
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 text-lg">/</span>
                <span className="text-slate-700 font-medium px-3 py-1 bg-amber-100/80 backdrop-blur-sm rounded-lg border border-amber-200/50">
                  Search results for "{searchTerm}"
                </span>
              </div>
            )}
            {selectedService && currentView === 'create' && (
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 text-lg">/</span>
                <span className="text-slate-700 font-medium px-3 py-1 bg-green-100/80 backdrop-blur-sm rounded-lg border border-green-200/50">
                  {selectedService.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Main render logic
  if (currentView === 'create' && selectedService && selectedTemplate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <header className="mb-8">
            {renderBreadcrumb()}
            <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-xl rounded-3xl p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {selectedService.name}
                  </h1>
                  <p className="mt-2 text-xl text-slate-600">{selectedService.description}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <DocumentTextIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Ticket Information */}
            <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-3xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mr-3 flex items-center justify-center">
                  <DocumentPlusIcon className="w-5 h-5 text-white" />
                </div>
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
                  className="block w-full px-5 py-4 bg-white/70 backdrop-blur-sm border border-white/30 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/90 transition-all duration-300 text-slate-700 placeholder-slate-500"
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
                  className="block w-full px-5 py-4 bg-white/70 backdrop-blur-sm border border-white/30 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/90 transition-all duration-300 text-slate-700"
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
                  className="block w-full px-5 py-4 bg-white/70 backdrop-blur-sm border border-white/30 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/90 transition-all duration-300 text-slate-700 placeholder-slate-500 resize-none"
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
              <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-3xl p-12 shadow-xl">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-lg opacity-20 animate-pulse"></div>
                  </div>
                  <span className="ml-4 text-slate-600 text-lg font-medium">Loading template fields...</span>
                </div>
              </div>
            ) : templateFields.length > 0 ? (
              <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-3xl p-8 shadow-xl">
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
            <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-3xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg mr-3 flex items-center justify-center">
                  <span className="w-3 h-3 bg-white rounded-full"></span>
                </div>
                Issue Classification
              </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What caused this issue?
                </label>
                <select
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value as RootCauseType | '')}
                  disabled={isSubmitting}
                  className="block w-full px-5 py-4 bg-white/70 backdrop-blur-sm border border-white/30 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/90 transition-all duration-300 text-slate-700"
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
                  className="block w-full px-5 py-4 bg-white/70 backdrop-blur-sm border border-white/30 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/90 transition-all duration-300 text-slate-700"
                >
                  <option value="">Select issue type...</option>
                  <option value="request">Service Request - I need something new or changed</option>
                  <option value="complaint">Service Complaint - I'm not satisfied with service quality</option>
                  <option value="problem">Technical Problem - Something is broken or not working</option>
                </select>
              </div>
            </div>

              <div className="mt-6 p-4 bg-blue-100/50 backdrop-blur-sm rounded-2xl border border-blue-200/50">
                <p className="text-sm text-blue-800">
                  <strong>Why do we ask for this information?</strong> This classification helps our technicians prioritize and route your ticket to the right team faster. You can leave these blank if you're unsure.
                </p>
              </div>
          </div>

            {/* File Attachments */}
            <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-3xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <div className="w-6 h-6 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-lg mr-3 flex items-center justify-center">
                  <span className="w-3 h-3 bg-white rounded-full"></span>
                </div>
                File Attachments
              </h3>
            
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-white/40 bg-white/30 backdrop-blur-sm rounded-2xl p-8 text-center hover:border-white/60 hover:bg-white/40 transition-all duration-300 group">
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
            <div className="bg-gradient-to-r from-blue-100/80 to-indigo-100/80 backdrop-blur-md border border-white/30 rounded-3xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-blue-800 flex items-center">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mr-3 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
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
            <div className="flex justify-end space-x-6">
              <button
                type="button"
                onClick={() => setCurrentView(currentCategory ? 'services' : 'categories')}
                disabled={isSubmitting}
                className="px-8 py-4 bg-white/70 backdrop-blur-sm border border-white/30 rounded-2xl text-slate-700 hover:bg-white/90 font-semibold transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-sm opacity-15"></div>
                <div className="relative flex items-center">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                      Creating Ticket...
                    </>
                  ) : (
                    'Create Ticket'
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Categories and Services browsing view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="mb-8">
          {renderBreadcrumb()}
          <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-xl rounded-3xl p-8 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  IT Service Catalog
                </h1>
                <p className="mt-2 text-xl text-slate-600">How can we help you today?</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <LifebuoyIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="mt-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/8 to-indigo-600/8 rounded-2xl blur-md"></div>
              <div className="relative bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl overflow-hidden shadow-lg">
                <input
                  type="text"
                  placeholder="Search for a service (e.g., 'password', 'new user', 'printer')..."
                  className="w-full p-5 pl-14 bg-transparent border-0 text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-0 text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="w-6 h-6 text-slate-500" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Quick Access - General Ticket Option */}
        {!searchTerm && currentView === 'categories' && (
          <div className="mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/8 to-indigo-600/8 rounded-3xl blur-md group-hover:blur-lg transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-md border border-white/30 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-sm opacity-10"></div>
                      <div className="relative w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                        <DocumentPlusIcon className="w-8 h-8" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800">Create General Ticket</h3>
                      <p className="text-slate-600 mt-2 text-lg">
                        Can't find a specific template? Create a general support request for any issue not covered by our service catalog.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      // Create a mock general service object and load it
                      const generalService: Service = {
                        id: 'req_other',
                        name: 'Permintaan Lainnya',
                        description: 'Other general requests not covered by specific categories',
                        categoryId: 'general_requests',
                        templateId: undefined,
                        popularity: 0,
                        usageCount: 0,
                        hasFields: false,
                        fieldCount: 0,
                        type: 'static_service'
                      };
                      loadServiceTemplate(generalService);
                    }}
                    className="relative group/btn px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-3"
                  >
                    <span className="text-lg">Get Started</span>
                    <ArrowRightIcon className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <main>
          {/* Content Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {searchTerm ? (
              searchResults.length > 0 ? (
                renderServices(searchResults)
              ) : (
                <div className="col-span-full text-center py-20">
                  <div className="relative mx-auto w-20 h-20 mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-400 to-slate-600 rounded-2xl blur-sm opacity-15"></div>
                    <div className="relative bg-white/80 backdrop-blur-md border border-white/30 rounded-2xl p-4 flex items-center justify-center shadow-lg">
                      <MagnifyingGlassIcon className="w-12 h-12 text-slate-500" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">No Services Found</h3>
                  <p className="text-slate-600 text-lg">
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
    </div>
  );
};

export default ServiceCatalogV2Page;