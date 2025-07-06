// frontend/src/pages/customer/CustomerPortalPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { 
  TicketIcon, 
  UserIcon, 
  ClockIcon, 
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import CustomerTicketCreation from './CustomerTicketCreation';
import CustomerTicketTracking from './CustomerTicketTracking';
import CustomerKnowledgeBase from './CustomerKnowledgeBase';
import CustomerServiceCatalog from './CustomerServiceCatalog';
import CustomerSatisfactionSurvey from './CustomerSatisfactionSurvey';
import CustomerDashboard from './CustomerDashboard';

const CustomerPortalPage: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigationItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: HomeIcon,
      path: '/customer/dashboard',
      description: 'Overview of your tickets and status'
    },
    {
      id: 'create-ticket',
      name: 'Submit Request',
      icon: TicketIcon,
      path: '/customer/create-ticket',
      description: 'Create a new support ticket'
    },
    {
      id: 'track-tickets',
      name: 'Track Requests',
      icon: ClockIcon,
      path: '/customer/track-tickets',
      description: 'View and track your existing tickets'
    },
    {
      id: 'knowledge-base',
      name: 'Help Articles',
      icon: DocumentTextIcon,
      path: '/customer/knowledge-base',
      description: 'Browse help articles and solutions'
    },
    {
      id: 'service-catalog',
      name: 'Services',
      icon: MagnifyingGlassIcon,
      path: '/customer/services',
      description: 'Browse available IT and business services'
    },
    {
      id: 'feedback',
      name: 'Feedback',
      icon: StarIcon,
      path: '/customer/feedback',
      description: 'Rate our service and provide feedback'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Customer Portal Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-blue-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top row - Logo and User */}
          <div className="flex justify-between items-center h-16 border-b border-slate-100">
            <Link to="/customer" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                <TicketIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  BSG Support Portal
                </span>
                <span className="text-xs text-slate-500 -mt-1">Customer Self-Service</span>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <UserIcon className="w-4 h-4" />
                <span>Customer Portal</span>
              </div>
              {isAuthenticated && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{user.name || user.username}</span>
                      <span className="text-xs text-slate-500 capitalize">{user.role}</span>
                    </div>
                    <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-900">{user.name || user.username}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                        <p className="text-xs text-blue-600 capitalize">{user.role} Access</p>
                      </div>
                      {user.role !== 'requester' && (
                        <Link
                          to="/login"
                          className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <UserIcon className="w-4 h-4 mr-2" />
                          Staff Portal
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Staff Login
                </Link>
              )}
            </div>
          </div>
          
          {/* Navigation row */}
          <div className="flex space-x-8 overflow-x-auto py-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<CustomerDashboard />} />
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/create-ticket" element={<CustomerTicketCreation />} />
          <Route path="/track-tickets" element={<CustomerTicketTracking />} />
          <Route path="/knowledge-base" element={<CustomerKnowledgeBase />} />
          <Route path="/knowledge-base/articles/:id" element={<CustomerKnowledgeBase />} />
          <Route path="/services" element={<CustomerServiceCatalog />} />
          <Route path="/feedback" element={<CustomerSatisfactionSurvey />} />
          <Route path="*" element={<Navigate to="/customer/dashboard" replace />} />
        </Routes>
      </main>

      {/* Customer Portal Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Contact Support</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p>Email: support@bsg.co.id</p>
                <p>Phone: +62-431-123-4567</p>
                <p>Hours: Mon-Fri 8:00 AM - 5:00 PM WITA</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Quick Help</h3>
              <div className="space-y-2">
                <Link to="/customer/knowledge-base" className="block text-sm text-blue-600 hover:text-blue-800">
                  Frequently Asked Questions
                </Link>
                <Link to="/customer/services" className="block text-sm text-blue-600 hover:text-blue-800">
                  Service Catalog
                </Link>
                <Link to="/customer/track-tickets" className="block text-sm text-blue-600 hover:text-blue-800">
                  Check Ticket Status
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">About BSG</h3>
              <p className="text-sm text-slate-600">
                Bank Sulutgo provides comprehensive banking services across Sulawesi Utara, 
                Gorontalo, and Jakarta with 51 branch locations.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-center text-sm text-slate-500">
              © 2024 Bank Sulawesi Utara Gorontalo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerPortalPage;