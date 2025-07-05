// frontend/src/pages/technician/TechnicianPortalPage.tsx
import React, { useState } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { 
  WrenchScrewdriverIcon,
  QueueListIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BoltIcon,
  UserCircleIcon,
  CogIcon,
  HomeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import TechnicianDashboard from './TechnicianDashboard';
import TechnicianTicketQueue from './TechnicianTicketQueue';
import TechnicianQuickActions from './TechnicianQuickActions';
import TechnicianKnowledgeBase from './TechnicianKnowledgeBase';
import TechnicianProfile from './TechnicianProfile';

const TechnicianPortalPage: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');

  const navigationItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: HomeIcon,
      path: '/technician/portal/dashboard',
      description: 'Overview of your assigned tickets and performance'
    },
    {
      id: 'queue',
      name: 'My Queue',
      icon: QueueListIcon,
      path: '/technician/portal/queue',
      description: 'View and manage your assigned tickets'
    },
    {
      id: 'quick-actions',
      name: 'Quick Actions',
      icon: BoltIcon,
      path: '/technician/portal/quick-actions',
      description: 'Fast ticket operations and bulk actions'
    },
    {
      id: 'knowledge-base',
      name: 'Tech Docs',
      icon: DocumentTextIcon,
      path: '/technician/portal/knowledge-base',
      description: 'Technical documentation and troubleshooting guides'
    },
    {
      id: 'profile',
      name: 'Profile',
      icon: UserCircleIcon,
      path: '/technician/portal/profile',
      description: 'Manage your profile and preferences'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <Link 
                to="/technician/workspace"
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Workspace</span>
              </Link>
              <div className="h-6 w-px bg-slate-300"></div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-800 rounded-lg flex items-center justify-center shadow-lg">
                  <WrenchScrewdriverIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent">
                    Technician Portal
                  </span>
                  <span className="text-xs text-slate-500 -mt-1">Self-Service Dashboard</span>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium text-slate-900">Technical Support</div>
                <div className="text-xs text-slate-500">Logged in as Technician</div>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-slate-400 to-slate-600 rounded-lg flex items-center justify-center">
                <CogIcon className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto py-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-slate-600 to-slate-800 text-white shadow-lg'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/80'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          {/* Default redirect to dashboard */}
          <Route path="/" element={<Navigate to="/technician/portal/dashboard" replace />} />
          
          {/* Portal Pages */}
          <Route path="/dashboard" element={<TechnicianDashboard />} />
          <Route path="/queue" element={<TechnicianTicketQueue />} />
          <Route path="/quick-actions" element={<TechnicianQuickActions />} />
          <Route path="/knowledge-base" element={<TechnicianKnowledgeBase />} />
          <Route path="/profile" element={<TechnicianProfile />} />
          
          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/technician/portal/dashboard" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white/30 backdrop-blur-sm border-t border-slate-200/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-slate-500 text-sm">
            <p>&copy; 2024 BSG Enterprise Ticketing System - Technician Portal</p>
            <p className="mt-1">Streamlined interface for technical support operations</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TechnicianPortalPage;