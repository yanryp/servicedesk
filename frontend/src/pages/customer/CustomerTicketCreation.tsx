// frontend/src/pages/customer/CustomerTicketCreation.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TicketIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  PaperClipIcon,
  ArrowLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface ServiceCategory {
  id: number;
  name: string;
  description: string;
  services: Service[];
}

interface Service {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  estimatedTime: string;
  priority: string;
}

interface TicketForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  branchLocation: string;
  serviceId: number | null;
  priority: string;
  subject: string;
  description: string;
  urgency: string;
  impact: string;
  attachments: File[];
}

const CustomerTicketCreation: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState<TicketForm>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    branchLocation: '',
    serviceId: null,
    priority: 'medium',
    subject: '',
    description: '',
    urgency: 'medium',
    impact: 'medium',
    attachments: []
  });

  // Mock service catalog data
  useEffect(() => {
    setServiceCategories([
      {
        id: 1,
        name: 'IT Support',
        description: 'Computer, network, and software support',
        services: [
          {
            id: 1,
            name: 'Password Reset',
            description: 'Reset forgotten passwords for email, BSGDirect, or system access',
            categoryId: 1,
            estimatedTime: '30 minutes',
            priority: 'medium'
          },
          {
            id: 2,
            name: 'Email Issues',
            description: 'Email access problems, configuration, or delivery issues',
            categoryId: 1,
            estimatedTime: '1-2 hours',
            priority: 'medium'
          },
          {
            id: 3,
            name: 'BSGDirect Login Problems',
            description: 'Unable to access BSGDirect online banking system',
            categoryId: 1,
            estimatedTime: '2-4 hours',
            priority: 'high'
          }
        ]
      },
      {
        id: 2,
        name: 'Banking Operations',
        description: 'Account, transaction, and banking service support',
        services: [
          {
            id: 4,
            name: 'Account Access',
            description: 'Issues accessing customer accounts or account information',
            categoryId: 2,
            estimatedTime: '1-3 hours',
            priority: 'high'
          },
          {
            id: 5,
            name: 'Transaction Issues',
            description: 'Problems with transfers, payments, or transaction history',
            categoryId: 2,
            estimatedTime: '2-6 hours',
            priority: 'high'
          },
          {
            id: 6,
            name: 'Mobile Banking',
            description: 'Mobile app issues, installation, or configuration problems',
            categoryId: 2,
            estimatedTime: '1-2 hours',
            priority: 'medium'
          }
        ]
      },
      {
        id: 3,
        name: 'Hardware Support',
        description: 'Computer, printer, and equipment support',
        services: [
          {
            id: 7,
            name: 'Computer Problems',
            description: 'Desktop or laptop hardware and software issues',
            categoryId: 3,
            estimatedTime: '2-4 hours',
            priority: 'medium'
          },
          {
            id: 8,
            name: 'Printer Issues',
            description: 'Printer connectivity, driver, or printing problems',
            categoryId: 3,
            estimatedTime: '1-2 hours',
            priority: 'low'
          }
        ]
      }
    ]);
  }, []);

  const branches = [
    'Jakarta - Kantor Pusat',
    'Manado - Kantor Cabang Utama',
    'Gorontalo - Kantor Cabang',
    'Bitung - Kantor Cabang Pembantu',
    'Tomohon - Kantor Cabang Pembantu',
    'Kotamobagu - Kantor Cabang Pembantu'
  ];

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
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles]
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 2000);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

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
              <strong>Ticket ID:</strong> #BSG-2024-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}
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
                  customerName: '',
                  customerEmail: '',
                  customerPhone: '',
                  branchLocation: '',
                  serviceId: null,
                  priority: 'medium',
                  subject: '',
                  description: '',
                  urgency: 'medium',
                  impact: 'medium',
                  attachments: []
                });
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
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        {/* Step 1: Service Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Select Service Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {serviceCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category)}
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
              <div className="mt-8">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Select Specific Service</h3>
                <div className="space-y-3">
                  {selectedCategory.services.map((service) => (
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
          </div>
        )}

        {/* Step 2: Contact Information */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Contact Information</h2>
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
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
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