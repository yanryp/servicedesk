// frontend/src/pages/customer/CustomerServiceCatalog.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  TicketIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

interface ServiceCategory {
  id: number;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  serviceCount: number;
  services: Service[];
}

interface Service {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  estimatedTime: string;
  priority: string;
  cost: string;
  availability: string;
  requirements: string[];
  tags: string[];
  popular: boolean;
}

const CustomerServiceCatalog: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    priority: 'all',
    estimatedTime: 'all',
    cost: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServiceCatalog();
  }, []);

  const loadServiceCatalog = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockServices: Service[] = [
        // IT Support Services
        {
          id: 1,
          name: 'Password Reset',
          description: 'Reset forgotten passwords for email, BSGDirect, or system access',
          categoryId: 1,
          estimatedTime: '30 minutes',
          priority: 'Medium',
          cost: 'Free',
          availability: '24/7',
          requirements: ['Valid employee ID', 'Security questions verification'],
          tags: ['password', 'security', 'account', 'urgent'],
          popular: true
        },
        {
          id: 2,
          name: 'Email Configuration',
          description: 'Set up or troubleshoot email access on desktop or mobile devices',
          categoryId: 1,
          estimatedTime: '1-2 hours',
          priority: 'Medium',
          cost: 'Free',
          availability: 'Business hours',
          requirements: ['Device access', 'Email credentials'],
          tags: ['email', 'outlook', 'mobile', 'configuration'],
          popular: true
        },
        {
          id: 3,
          name: 'Software Installation',
          description: 'Install approved business software on your work computer',
          categoryId: 1,
          estimatedTime: '2-4 hours',
          priority: 'Low',
          cost: 'Free',
          availability: 'Business hours',
          requirements: ['Manager approval', 'Software license availability'],
          tags: ['software', 'installation', 'applications'],
          popular: false
        },
        // Banking Operations Services
        {
          id: 4,
          name: 'BSGDirect Support',
          description: 'Troubleshoot BSGDirect online banking login and functionality issues',
          categoryId: 2,
          estimatedTime: '2-4 hours',
          priority: 'High',
          cost: 'Free',
          availability: '24/7',
          requirements: ['Account verification', 'Security information'],
          tags: ['bsgdirect', 'online banking', 'login', 'critical'],
          popular: true
        },
        {
          id: 5,
          name: 'Account Management',
          description: 'Assistance with customer account access, updates, and maintenance',
          categoryId: 2,
          estimatedTime: '1-3 hours',
          priority: 'High',
          cost: 'Free',
          availability: 'Business hours',
          requirements: ['Customer verification', 'Valid ID'],
          tags: ['account', 'customer service', 'maintenance'],
          popular: true
        },
        {
          id: 6,
          name: 'Transaction Support',
          description: 'Help with failed transactions, transaction history, and payment issues',
          categoryId: 2,
          estimatedTime: '2-6 hours',
          priority: 'High',
          cost: 'Free',
          availability: 'Business hours',
          requirements: ['Transaction details', 'Account verification'],
          tags: ['transactions', 'payments', 'banking'],
          popular: false
        },
        // Mobile Banking Services
        {
          id: 7,
          name: 'Mobile App Installation',
          description: 'Guide for downloading and setting up the BSG mobile banking app',
          categoryId: 3,
          estimatedTime: '30-60 minutes',
          priority: 'Medium',
          cost: 'Free',
          availability: '24/7',
          requirements: ['Smartphone', 'App store access'],
          tags: ['mobile', 'app', 'installation', 'setup'],
          popular: true
        },
        {
          id: 8,
          name: 'Mobile Banking Training',
          description: 'Personal training session on using mobile banking features',
          categoryId: 3,
          estimatedTime: '1-2 hours',
          priority: 'Low',
          cost: 'Free',
          availability: 'By appointment',
          requirements: ['BSG mobile app installed', 'Active account'],
          tags: ['training', 'mobile', 'education'],
          popular: false
        },
        // Hardware Support Services
        {
          id: 9,
          name: 'Computer Repair',
          description: 'Hardware diagnostics and repair for desktop and laptop computers',
          categoryId: 4,
          estimatedTime: '2-8 hours',
          priority: 'Medium',
          cost: 'Parts cost applies',
          availability: 'Business hours',
          requirements: ['Manager approval for parts cost', 'Backup data if possible'],
          tags: ['hardware', 'repair', 'computer', 'maintenance'],
          popular: false
        },
        {
          id: 10,
          name: 'Printer Setup',
          description: 'Install, configure, and troubleshoot network and local printers',
          categoryId: 4,
          estimatedTime: '1-2 hours',
          priority: 'Low',
          cost: 'Free',
          availability: 'Business hours',
          requirements: ['Printer model information', 'Network access'],
          tags: ['printer', 'setup', 'network', 'configuration'],
          popular: false
        },
        // Security Services
        {
          id: 11,
          name: 'Security Incident Response',
          description: 'Immediate response to suspected security breaches or malware',
          categoryId: 5,
          estimatedTime: '1-4 hours',
          priority: 'High',
          cost: 'Free',
          availability: '24/7',
          requirements: ['Immediate device isolation', 'Incident details'],
          tags: ['security', 'incident', 'malware', 'emergency'],
          popular: false
        },
        {
          id: 12,
          name: 'Security Training',
          description: 'Personal or group training on cybersecurity best practices',
          categoryId: 5,
          estimatedTime: '2-4 hours',
          priority: 'Medium',
          cost: 'Free',
          availability: 'By appointment',
          requirements: ['Group booking (minimum 5 people)', 'Training schedule coordination'],
          tags: ['training', 'security', 'education', 'awareness'],
          popular: false
        }
      ];

      const mockCategories: ServiceCategory[] = [
        {
          id: 1,
          name: 'IT Support',
          description: 'Computer, email, and software support services',
          icon: ComputerDesktopIcon,
          color: 'blue',
          serviceCount: 3,
          services: mockServices.filter(s => s.categoryId === 1)
        },
        {
          id: 2,
          name: 'Banking Operations',
          description: 'Online banking, account, and transaction support',
          icon: BuildingOfficeIcon,
          color: 'green',
          serviceCount: 3,
          services: mockServices.filter(s => s.categoryId === 2)
        },
        {
          id: 3,
          name: 'Mobile Banking',
          description: 'Mobile app installation and support services',
          icon: DevicePhoneMobileIcon,
          color: 'purple',
          serviceCount: 2,
          services: mockServices.filter(s => s.categoryId === 3)
        },
        {
          id: 4,
          name: 'Hardware Support',
          description: 'Computer, printer, and equipment repair services',
          icon: WrenchScrewdriverIcon,
          color: 'red',
          serviceCount: 2,
          services: mockServices.filter(s => s.categoryId === 4)
        },
        {
          id: 5,
          name: 'Security Services',
          description: 'Cybersecurity incident response and training',
          icon: ShieldCheckIcon,
          color: 'yellow',
          serviceCount: 2,
          services: mockServices.filter(s => s.categoryId === 5)
        }
      ];

      setCategories(mockCategories);
      setLoading(false);
    }, 1000);
  };

  // Filter services based on search and filters
  useEffect(() => {
    if (!selectedCategory) return;

    let filtered = selectedCategory.services;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(service =>
        service.priority.toLowerCase() === filters.priority.toLowerCase()
      );
    }

    // Apply estimated time filter
    if (filters.estimatedTime !== 'all') {
      filtered = filtered.filter(service => {
        const timeText = service.estimatedTime.toLowerCase();
        switch (filters.estimatedTime) {
          case 'quick':
            return timeText.includes('30') || timeText.includes('1 hour') || timeText.includes('1-2');
          case 'medium':
            return timeText.includes('2-4') || timeText.includes('2-6');
          case 'long':
            return timeText.includes('4+') || timeText.includes('8');
          default:
            return true;
        }
      });
    }

    // Apply cost filter
    if (filters.cost !== 'all') {
      filtered = filtered.filter(service => {
        if (filters.cost === 'free') return service.cost === 'Free';
        if (filters.cost === 'paid') return service.cost !== 'Free';
        return true;
      });
    }

    setFilteredServices(filtered);
  }, [selectedCategory, searchTerm, filters]);

  const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCostColor = (cost: string): string => {
    return cost === 'Free' 
      ? 'bg-green-100 text-green-800'
      : 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Category view
  if (selectedCategory) {
    return (
      <div className="space-y-6">
        {/* Back button and category header */}
        <div>
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ChevronRightIcon className="w-4 h-4 rotate-180" />
            <span>Back to Service Categories</span>
          </button>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className={`w-12 h-12 bg-${selectedCategory.color}-100 rounded-lg flex items-center justify-center`}>
              <selectedCategory.icon className={`w-6 h-6 text-${selectedCategory.color}-600`} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{selectedCategory.name}</h1>
              <p className="text-slate-600">{selectedCategory.description}</p>
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-slate-900">Find Services</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <FunnelIcon className="w-4 h-4" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Time</label>
                <select
                  value={filters.estimatedTime}
                  onChange={(e) => setFilters(prev => ({ ...prev, estimatedTime: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Any Duration</option>
                  <option value="quick">Quick (Under 2 hours)</option>
                  <option value="medium">Medium (2-6 hours)</option>
                  <option value="long">Long (Over 6 hours)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cost</label>
                <select
                  value={filters.cost}
                  onChange={(e) => setFilters(prev => ({ ...prev, cost: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Any Cost</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Services list */}
        <div className="space-y-4">
          {filteredServices.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
              <MagnifyingGlassIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No services found</h3>
              <p className="text-slate-600">Try adjusting your search criteria or filters.</p>
            </div>
          ) : (
            filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-slate-900">{service.name}</h3>
                      {service.popular && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                          Popular
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded border text-xs font-medium ${getPriorityColor(service.priority)}`}>
                        {service.priority} Priority
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCostColor(service.cost)}`}>
                        {service.cost}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-3">{service.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-slate-700">Estimated Time:</span>
                        <span className="text-slate-600 ml-2 flex items-center">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {service.estimatedTime}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">Availability:</span>
                        <span className="text-slate-600 ml-2">{service.availability}</span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">Cost:</span>
                        <span className="text-slate-600 ml-2">{service.cost}</span>
                      </div>
                    </div>

                    {service.requirements.length > 0 && (
                      <div className="mt-3">
                        <span className="font-medium text-slate-700 text-sm">Requirements:</span>
                        <ul className="text-xs text-slate-600 mt-1 ml-4">
                          {service.requirements.map((req, index) => (
                            <li key={index} className="list-disc">{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1 mt-3">
                      {service.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="ml-6">
                    <Link
                      to={`/customer/create-ticket?service=${service.id}`}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2"
                    >
                      <TicketIcon className="w-4 h-4" />
                      <span>Request Service</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Main categories view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Service Catalog</h1>
        <p className="text-slate-600 text-lg">Browse available IT and business services</p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search for services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Service Categories */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Service Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`w-12 h-12 bg-${category.color}-100 rounded-lg flex items-center justify-center group-hover:bg-${category.color}-200 transition-all duration-200`}>
                    <Icon className={`w-6 h-6 text-${category.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-slate-900 group-hover:text-blue-600 transition-all duration-200">
                      {category.name}
                    </h3>
                    <p className="text-sm text-slate-600">{category.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    {category.serviceCount} services available
                  </span>
                  <ChevronRightIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-all duration-200" />
                </div>

                {/* Popular services preview */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-700 mb-2">Popular services:</p>
                  <div className="flex flex-wrap gap-1">
                    {category.services
                      .filter(s => s.popular)
                      .slice(0, 2)
                      .map((service) => (
                        <span
                          key={service.id}
                          className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs"
                        >
                          {service.name}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick access to popular services */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Need Immediate Help?</h2>
          <p className="text-blue-100">
            Quick access to our most requested services
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/customer/create-ticket?service=1"
            className="bg-white/20 backdrop-blur-sm rounded-lg p-4 hover:bg-white/30 transition-all duration-200"
          >
            <h3 className="font-medium mb-1">Password Reset</h3>
            <p className="text-sm text-blue-100">Get back into your accounts quickly</p>
          </Link>
          
          <Link
            to="/customer/create-ticket?service=4"
            className="bg-white/20 backdrop-blur-sm rounded-lg p-4 hover:bg-white/30 transition-all duration-200"
          >
            <h3 className="font-medium mb-1">BSGDirect Support</h3>
            <p className="text-sm text-blue-100">Online banking issues resolved fast</p>
          </Link>
          
          <Link
            to="/customer/create-ticket?service=2"
            className="bg-white/20 backdrop-blur-sm rounded-lg p-4 hover:bg-white/30 transition-all duration-200"
          >
            <h3 className="font-medium mb-1">Email Configuration</h3>
            <p className="text-sm text-blue-100">Set up email on any device</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerServiceCatalog;