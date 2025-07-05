// frontend/src/pages/customer/CustomerTicketCreation.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  TicketIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  PaperClipIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { serviceCatalogService } from '../../services/serviceCatalog';
import { authService } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  services: Service[];
}

interface Service {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  estimatedTime: string;
  priority: string;
}

interface TicketForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  branchLocation: string;
  serviceId: string | null;
  priority: string;
  subject: string;
  description: string;
  urgency: string;
  impact: string;
  attachments: File[];
}

interface Branch {
  id: number;
  name: string;
  code: string;
  type: string;
  address?: string;
}

const CustomerTicketCreation: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  
  // Ref for scrolling to services section
  const servicesRef = useRef<HTMLDivElement>(null);
  
  // Determine if user needs contact info step (only for external customers)
  const isAuthenticatedUser = user && user.id;
  const needsContactStep = !isAuthenticatedUser;

  const [formData, setFormData] = useState<TicketForm>({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: '',
    branchLocation: user?.unit?.name || '',
    serviceId: null,
    priority: 'medium',
    subject: '',
    description: '',
    urgency: 'medium',
    impact: 'medium',
    attachments: []
  });

  // Load service catalog data and branches
  useEffect(() => {
    loadServiceCatalog();
    loadBranches();
  }, []);
  
  useEffect(() => {
    // Check if a service was pre-selected from the service catalog
    const preSelectedServiceId = searchParams.get('serviceId');
    if (preSelectedServiceId && serviceCategories.length > 0) {
      // Find the service in the loaded categories
      for (const category of serviceCategories) {
        const service = category.services.find(s => s.id === preSelectedServiceId);
        if (service) {
          setSelectedCategory(category);
          setSelectedService(service);
          handleInputChange('serviceId', service.id);
          // Auto-fill subject if service name is available
          if (!formData.subject) {
            handleInputChange('subject', `Request for ${service.name}`);
          }
          break;
        }
      }
    }
  }, [serviceCategories, searchParams]);
  
  const loadServiceCatalog = async () => {
    setLoadingServices(true);
    try {
      // Get service catalog categories from the real API
      const categoriesResponse = await serviceCatalogService.getCategories();
      
      // Transform and load services for each category
      const transformedCategories: ServiceCategory[] = [];
      
      for (const category of categoriesResponse) {
        try {
          const servicesResponse = await serviceCatalogService.getServicesByCategory(category.id);
          
          // Transform services to match UI format
          const services: Service[] = servicesResponse.map((service: any) => ({
            id: service.id,
            name: service.name,
            description: service.description || 'Service request',
            categoryId: category.id,
            estimatedTime: service.estimatedResolutionTime || '1-2 hours',
            priority: 'medium' // Default priority
          }));
          
          transformedCategories.push({
            id: category.id,
            name: category.name,
            description: category.description || `${category.name} services`,
            services: services
          });
        } catch (error) {
          console.error(`Error loading services for category ${category.id}:`, error);
        }
      }
      
      setServiceCategories(transformedCategories);
    } catch (error) {
      console.error('Error loading service catalog:', error);
      setServiceCategories([]);
    } finally {
      setLoadingServices(false);
    }
  };

  // Load BSG branches data
  const loadBranches = async () => {
    try {
      setLoadingBranches(true);
      const branchData = await authService.getAllBranches();
      setBranches(branchData);
    } catch (error) {
      console.error('Error loading branches:', error);
      // Fallback to basic branches if API fails
      setBranches([
        { id: 1, name: 'Jakarta - Kantor Pusat', code: 'JKT001', type: 'CABANG' },
        { id: 2, name: 'Manado - Kantor Cabang Utama', code: 'MDO001', type: 'CABANG' },
        { id: 3, name: 'Gorontalo - Kantor Cabang', code: 'GTO001', type: 'CABANG' }
      ]);
    } finally {
      setLoadingBranches(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low', description: 'Non-urgent, can wait', color: 'green' },
    { value: 'medium', label: 'Medium', description: 'Normal business priority', color: 'yellow' },
    { value: 'high', label: 'High', description: 'Urgent, affects work', color: 'red' }
  ];

  const handleInputChange = (field: keyof TicketForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      // Validate files (max 5MB each, supported formats)
      const validFiles = newFiles.filter(file => {
        const validTypes = ['image/png', 'image/jpeg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (!validTypes.includes(file.type) && !file.name.match(/\.(png|jpg|jpeg|pdf|doc|docx|txt)$/i)) {
          alert(`File "${file.name}" is not a supported format. Please upload PNG, JPG, PDF, DOC, or TXT files.`);
          return false;
        }
        
        if (file.size > maxSize) {
          alert(`File "${file.name}" is too large. Maximum file size is 5MB.`);
          return false;
        }
        
        return true;
      });
      
      if (validFiles.length > 0) {
        setFormData(prev => ({
          ...prev,
          attachments: [...prev.attachments, ...validFiles]
        }));
      }
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.serviceId) {
      console.error('No service selected');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create ticket using the real API with proper field mapping (matching ServiceCatalogPage)
      const ticketData = {
        serviceId: formData.serviceId,
        title: formData.subject,
        description: formData.description,
        priority: formData.priority as 'low' | 'medium' | 'high' | 'urgent',
        fieldValues: {}, // Empty fieldValues (customer portal doesn't have dynamic fields yet)
        attachments: formData.attachments.length > 0 ? formData.attachments : undefined,
        // Add optional classification fields
        rootCause: undefined,
        issueCategory: undefined
      };

      console.log('Customer Portal - Submitting ticket:', ticketData);
      const response = await serviceCatalogService.createTicket(ticketData);
      
      // Handle the API response format
      const ticketId = response.data?.ticketId;
      setTicketId(ticketId?.toString() || 'UNKNOWN');
      setSubmitted(true);
    } catch (error) {
      console.error('Error creating ticket:', error);
      // Show error message to user
      alert('Error submitting ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    const maxStep = needsContactStep ? 4 : 4; // Keep maxStep as 4 for consistent logic
    if (needsContactStep) {
      setCurrentStep(prev => Math.min(prev + 1, maxStep));
    } else {
      // Skip step 2 for authenticated users
      setCurrentStep(prev => {
        if (prev === 1) return 3; // Service -> Details
        if (prev === 3) return 4; // Details -> Review
        return Math.min(prev + 1, maxStep);
      });
    }
  };
  
  const prevStep = () => {
    if (needsContactStep) {
      setCurrentStep(prev => Math.max(prev - 1, 1));
    } else {
      // Skip step 2 for authenticated users going back
      setCurrentStep(prev => {
        if (prev === 4) return 3; // Review -> Details
        if (prev === 3) return 1; // Details -> Service
        return Math.max(prev - 1, 1);
      });
    }
  };
  
  const handleServiceSelection = (category: ServiceCategory, service: Service) => {
    setSelectedCategory(category);
    setSelectedService(service);
    handleInputChange('serviceId', service.id);
    
    // Auto-fill subject if not already filled
    if (!formData.subject) {
      handleInputChange('subject', `Request for ${service.name}`);
    }
    
    // Skip contact step for authenticated users
    nextStep();
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Request Submitted Successfully!</h1>
          <p className="text-slate-600 mb-6">
            Your support request has been submitted and is awaiting approval from your branch manager. 
            You'll receive an email notification once it's approved and assigned to a technician.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Ticket ID:</strong> #{ticketId || 'BSG-2024-XXXX'}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Estimated Response Time:</strong> {selectedService?.estimatedTime || '2-4 hours'}
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/customer/track-tickets')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
            >
              Track Your Request
            </button>
            <button
              onClick={() => {
                setSubmitted(false);
                setCurrentStep(1);
                setFormData({
                  customerName: user?.name || '',
                  customerEmail: user?.email || '',
                  customerPhone: '',
                  branchLocation: user?.unit?.name || '',
                  serviceId: null,
                  priority: 'medium',
                  subject: '',
                  description: '',
                  urgency: 'medium',
                  impact: 'medium',
                  attachments: []
                });
                setSelectedCategory(null);
                setSelectedService(null);
                setTicketId(null);
              }}
              className="w-full border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition-all duration-200"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/customer')}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Submit Support Request</h1>
        <p className="text-slate-600">Get help with IT services, banking operations, or general support</p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        {needsContactStep ? (
          // Full 4-step process for external customers
          <>
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                      step <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`w-24 h-1 mx-2 ${
                        step < currentStep ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-slate-600 mt-2">
              <span>Service</span>
              <span>Contact Info</span>
              <span>Details</span>
              <span>Review</span>
            </div>
          </>
        ) : (
          // Simplified 3-step process for authenticated users
          <>
            <div className="flex items-center justify-center space-x-8">
              {[1, 3, 4].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                      (index + 1 <= (currentStep === 3 ? 2 : currentStep === 4 ? 3 : 1))
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < 2 && (
                    <div
                      className={`w-24 h-1 mx-2 ${
                        index + 1 < (currentStep === 3 ? 2 : currentStep === 4 ? 3 : 1) ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-24 text-sm text-slate-600 mt-2">
              <span>Service</span>
              <span>Details</span>
              <span>Review</span>
            </div>
          </>
        )}
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        {/* Step 1: Service Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Select Service Category</h2>
              {isAuthenticatedUser && (
                <div className="text-sm text-slate-600">
                  Logged in as: <span className="font-medium">{user.name}</span> ({user.unit?.name || 'No branch assigned'})
                </div>
              )}
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search services and categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {loadingServices ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="ml-4 text-slate-600">Loading services...</p>
              </div>
            ) : serviceCategories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 mb-4">No services available at the moment.</p>
                <button
                  onClick={loadServiceCatalog}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Retry Loading
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviceCategories
                    .filter(category => 
                      searchTerm === '' || 
                      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      category.services.some(service => 
                        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        service.description.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                    )
                    .map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category);
                      // Scroll to services section after a short delay to allow state update
                      setTimeout(() => {
                        servicesRef.current?.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'start',
                          inline: 'nearest'
                        });
                      }, 100);
                    }}
                    className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                      selectedCategory?.id === category.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <h3 className="font-medium text-slate-900 mb-2">{category.name}</h3>
                    <p className="text-sm text-slate-600">{category.description}</p>
                    <p className="text-xs text-blue-600 mt-2">{category.services.length} services available</p>
                  </button>
                ))}
                </div>

                {selectedCategory && (
                  <div ref={servicesRef} className="mt-8 scroll-mt-8">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-blue-900 mb-2">
                            📋 {selectedCategory.name} Services
                          </h3>
                          <p className="text-sm text-blue-700">
                            {selectedCategory.description} • {selectedCategory.services.filter(service =>
                              searchTerm === '' ||
                              service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              service.description.toLowerCase().includes(searchTerm.toLowerCase())
                            ).length} services available
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-100 transition-all duration-200"
                        >
                          Back to Categories
                        </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Choose Your Service</h3>
                    <div className="space-y-3">
                      {selectedCategory.services
                        .filter(service =>
                          searchTerm === '' ||
                          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((service) => (
                        <button
                          key={service.id}
                          onClick={() => {
                            setSelectedService(service);
                            handleInputChange('serviceId', service.id);
                          }}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                            selectedService?.id === service.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900 mb-1">{service.name}</h4>
                              <p className="text-sm text-slate-600 mb-2">{service.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-slate-500">
                                <span className="flex items-center space-x-1">
                                  <ClockIcon className="w-3 h-3" />
                                  <span>{service.estimatedTime}</span>
                                </span>
                                <span className={`px-2 py-1 rounded ${
                                  service.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  service.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {service.priority} priority
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 2: Contact Information (only for external customers) */}
        {currentStep === 2 && needsContactStep && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Contact Information</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This step is for external customers. BSG staff members are automatically logged in.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@bsg.co.id"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+62-XXX-XXXX-XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Branch Location *
                </label>
                <select
                  value={formData.branchLocation}
                  onChange={(e) => handleInputChange('branchLocation', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select your branch</option>
                  {loadingBranches ? (
                    <option disabled>Loading branches...</option>
                  ) : (
                    branches.map((branch) => (
                      <option key={branch.id} value={branch.name}>
                        {branch.name} ({branch.type})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Request Details */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Request Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Priority Level *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleInputChange('priority', option.value)}
                    className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                      formData.priority === option.value
                        ? `border-${option.color}-500 bg-${option.color}-50`
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <div className={`w-3 h-3 rounded-full bg-${option.color}-500`}></div>
                      <span className="font-medium text-slate-900">{option.label}</span>
                    </div>
                    <p className="text-xs text-slate-600">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Subject/Summary *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of your issue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Detailed Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Please provide as much detail as possible about your issue, including any error messages, steps you've tried, and when the problem occurs..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Attachments (Optional)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <PaperClipIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 mb-2">Drag files here or click to upload</p>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer"
                >
                  Choose Files
                </label>
                <p className="text-xs text-slate-500 mt-2">Max 5MB per file. PNG, JPG, PDF, DOC accepted.</p>
              </div>
              {formData.attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                      <span className="text-sm text-slate-700">{file.name}</span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Review and Submit */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Review Your Request</h2>
            
            <div className="bg-slate-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Service</h3>
                  <p className="text-sm text-slate-600">{selectedService?.name}</p>
                  <p className="text-xs text-slate-500">{selectedCategory?.name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Contact</h3>
                  <p className="text-sm text-slate-600">{formData.customerName}</p>
                  <p className="text-xs text-slate-500">{formData.customerEmail}</p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Branch</h3>
                  <p className="text-sm text-slate-600">{formData.branchLocation}</p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Priority</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    formData.priority === 'high' ? 'bg-red-100 text-red-800' :
                    formData.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {formData.priority.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-slate-900 mb-2">Subject</h3>
                <p className="text-sm text-slate-600">{formData.subject}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-slate-900 mb-2">Description</h3>
                <p className="text-sm text-slate-600">{formData.description}</p>
              </div>

              {formData.attachments.length > 0 && (
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Attachments</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.attachments.map((file, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {file.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Your request will be sent to your branch manager for approval</li>
                <li>2. Once approved, it will be assigned to the appropriate support team</li>
                <li>3. You'll receive email notifications at each step</li>
                <li>4. Our team will work to resolve your issue within the estimated timeframe</li>
              </ol>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              currentStep === 1
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-slate-700 hover:bg-slate-100 border border-slate-300'
            }`}
          >
            Previous
          </button>
          
          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              disabled={
                (currentStep === 1 && !selectedService) ||
                (currentStep === 2 && (!formData.customerName || !formData.customerEmail || !formData.branchLocation)) ||
                (currentStep === 3 && (!formData.subject || !formData.description))
              }
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <TicketIcon className="w-4 h-4" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerTicketCreation;