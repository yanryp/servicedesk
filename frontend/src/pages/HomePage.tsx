// src/pages/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  TicketIcon, 
  PlusCircleIcon, 
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
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

      {/* BSG Template Discovery Section */}
      {isAuthenticated && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200/50">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <BuildingOffice2Icon className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              BSG Banking Templates
            </h2>
            <p className="text-slate-600 mt-2">
              Quick access to banking-specific support templates for faster processing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Popular Templates */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Most Popular
              </h3>
              <div className="space-y-3">
                <Link
                  to="/bsg-create?category=OLIBS&template=1"
                  className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-blue-800 text-sm">OLIBS</div>
                      <div className="text-xs text-blue-600">Menu & Limit Changes</div>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
                <Link
                  to="/bsg-create?category=BSGTouch&template=7"
                  className="block p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-purple-800 text-sm">BSGTouch</div>
                      <div className="text-xs text-purple-600">System Issues</div>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
                <Link
                  to="/bsg-create?category=ATM&template=23"
                  className="block p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-green-800 text-sm">ATM</div>
                      <div className="text-xs text-green-600">Hardware Support</div>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-green-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>

            {/* Categories Overview */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                All Categories
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-slate-50 rounded text-center">
                  <div className="font-medium text-slate-700">OLIBS</div>
                  <div className="text-xs text-slate-500">5 templates</div>
                </div>
                <div className="p-2 bg-slate-50 rounded text-center">
                  <div className="font-medium text-slate-700">BSGTouch</div>
                  <div className="text-xs text-slate-500">4 templates</div>
                </div>
                <div className="p-2 bg-slate-50 rounded text-center">
                  <div className="font-medium text-slate-700">BSG QRIS</div>
                  <div className="text-xs text-slate-500">3 templates</div>
                </div>
                <div className="p-2 bg-slate-50 rounded text-center">
                  <div className="font-medium text-slate-700">SMS Banking</div>
                  <div className="text-xs text-slate-500">4 templates</div>
                </div>
                <div className="p-2 bg-slate-50 rounded text-center">
                  <div className="font-medium text-slate-700">KLAIM</div>
                  <div className="text-xs text-slate-500">2 templates</div>
                </div>
                <div className="p-2 bg-slate-50 rounded text-center">
                  <div className="font-medium text-slate-700">More...</div>
                  <div className="text-xs text-slate-500">6 others</div>
                </div>
              </div>
              <Link
                to="/bsg-create"
                className="mt-4 block text-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Browse All Templates
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                BSG Support Stats
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">24+</div>
                  <div className="text-xs text-slate-600">Available Templates</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">70.6%</div>
                  <div className="text-xs text-slate-600">Field Optimization</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">&lt;1s</div>
                  <div className="text-xs text-slate-600">Template Loading</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-white text-center">
                <div className="text-sm font-medium">Ready for Production</div>
                <div className="text-xs opacity-90">All systems operational</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-200/50 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
            <TicketIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800">Smart Ticketing</h3>
          <p className="text-slate-600">
            Create, track, and manage support tickets with intelligent categorization and routing.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-200/50 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800">Approval Workflow</h3>
          <p className="text-slate-600">
            Streamlined approval processes with manager oversight and escalation management.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-200/50 text-center space-y-4">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto">
            <ClockIcon className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800">SLA Management</h3>
          <p className="text-slate-600">
            Built-in SLA tracking with automated escalations and performance metrics.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      {isAuthenticated && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-6">Your Support Portal</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-3xl font-bold">0</div>
              <div className="text-blue-100">Open Tickets</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">0</div>
              <div className="text-blue-100">Pending Approval</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">0</div>
              <div className="text-blue-100">Resolved This Month</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
