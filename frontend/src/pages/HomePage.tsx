// src/pages/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  TicketIcon, 
  PlusCircleIcon, 
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  BuildingOffice2Icon,
  ArrowRightIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
            <TicketIcon className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            BSG Helpdesk
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Your comprehensive enterprise support portal for seamless ticket management, 
            issue tracking, and resolution workflows.
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-blue-200/50">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full">
                  <span className="text-sm font-medium text-blue-700">🏦 Bank Sulutgo Official Portal</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">
                  Professional Banking Support System
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Dedicated helpdesk portal for BSG staff and authorized personnel. 
                  Streamlined ticket management with specialized banking templates and 
                  department-specific routing for efficient resolution.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="font-semibold text-blue-800">24+</div>
                    <div className="text-sm text-blue-600">Banking Templates</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="font-semibold text-green-800">70.6%</div>
                    <div className="text-sm text-green-600">Process Efficiency</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <div className="font-semibold text-purple-800">&lt;1s</div>
                    <div className="text-sm text-purple-600">Response Time</div>
                  </div>
                </div>
                <div className="pt-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <span>Access BSG Helpdesk Portal</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </Link>
                </div>
                <p className="text-xs text-slate-500 mt-4">
                  For BSG employees and authorized banking personnel only. 
                  Contact your system administrator for access.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-slate-200/50 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Welcome back, {user?.username}!
            </h3>
            <p className="text-slate-600 mb-4">What would you like to do today?</p>
            <div className="space-y-2">
              <Link
                to="/tickets"
                className="flex items-center space-x-3 w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200"
              >
                <ClipboardDocumentListIcon className="w-5 h-5" />
                <span>View My Tickets</span>
              </Link>
              
              {/* Show appropriate actions based on user role */}
              {user?.role === 'manager' ? (
                <>
                  <Link
                    to="/manager"
                    className="flex items-center space-x-3 w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Pending Approvals</span>
                    <ArrowRightIcon className="w-4 h-4 ml-auto" />
                  </Link>
                  <Link
                    to="/categorization/analytics"
                    className="flex items-center space-x-3 w-full px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-all duration-200"
                  >
                    <ChartBarIcon className="w-5 h-5" />
                    <span>Analytics Dashboard</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/create-ticket"
                    className="flex items-center space-x-3 w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-all duration-200"
                  >
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>Create New Ticket</span>
                  </Link>
                  <Link
                    to="/bsg-create"
                    className="flex items-center space-x-3 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
                  >
                    <BuildingOffice2Icon className="w-5 h-5" />
                    <span>BSG Banking Support</span>
                    <ArrowRightIcon className="w-4 h-4 ml-auto" />
                  </Link>
                </>
              )}
              
              {/* Show technician-specific actions */}
              {user?.role === 'technician' && (
                <Link
                  to="/categorization/queue"
                  className="flex items-center space-x-3 w-full px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-all duration-200"
                >
                  <TicketIcon className="w-5 h-5" />
                  <span>Categorization Queue</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Access Section for Authenticated Users */}
      {isAuthenticated && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200/50">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <BuildingOffice2Icon className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              BSG Banking Support System
            </h2>
            <p className="text-slate-600 mt-2">
              Streamlined banking templates with 70.6% efficiency optimization
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to="/bsg-create"
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 group shadow-lg"
                >
                  <div className="flex items-center space-x-3">
                    <BuildingOffice2Icon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">BSG Banking Support</div>
                      <div className="text-xs opacity-90">24+ specialized templates</div>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  to="/create-ticket"
                  className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-all duration-200 group border border-green-200"
                >
                  <div className="flex items-center space-x-3">
                    <PlusCircleIcon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">General Support Ticket</div>
                      <div className="text-xs opacity-75">Standard ticket creation</div>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  to="/tickets"
                  className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-all duration-200 group border border-slate-200"
                >
                  <div className="flex items-center space-x-3">
                    <ClipboardDocumentListIcon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">My Tickets</div>
                      <div className="text-xs opacity-75">View and track tickets</div>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                System Performance
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">All Systems Operational</span>
                  </div>
                  <div className="text-xs text-green-600">99.9% uptime</div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">24+</div>
                    <div className="text-xs text-blue-600">Templates</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">70.6%</div>
                    <div className="text-xs text-green-600">Efficiency</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">&lt;1s</div>
                    <div className="text-xs text-purple-600">Load Time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default HomePage;
