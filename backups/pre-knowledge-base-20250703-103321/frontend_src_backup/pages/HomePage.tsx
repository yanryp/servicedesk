// src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  TicketIcon, 
  PlusCircleIcon, 
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  BuildingOffice2Icon,
  ArrowRightIcon,
  ChartBarIcon,
  RectangleStackIcon,
  SparklesIcon,
  BoltIcon,
  HeartIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [animatedNumbers, setAnimatedNumbers] = useState({ tickets: 0, efficiency: 0, response: 0 });

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Animate numbers on load
  useEffect(() => {
    const animateNumber = (target: number, key: keyof typeof animatedNumbers, duration: number) => {
      let start = 0;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          start = target;
          clearInterval(timer);
        }
        setAnimatedNumbers(prev => ({ ...prev, [key]: Math.floor(start) }));
      }, 16);
    };

    animateNumber(24, 'tickets', 1000);
    animateNumber(70.6, 'efficiency', 1200);
    animateNumber(1, 'response', 800);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-20">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-20 w-40 h-40 bg-indigo-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative text-center space-y-8">
          <div className="flex justify-center animate-pulse">
            <div className="relative">
              <div className="w-28 h-28 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <TicketIcon className="w-14 h-14 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <SparklesIcon className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
                BSG Helpdesk
              </h1>
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                <span className="text-sm font-medium text-blue-700">System Online • {formatTime(currentTime)}</span>
              </div>
            </div>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Your comprehensive enterprise support portal for seamless ticket management, 
              intelligent routing, and rapid resolution workflows powered by advanced automation.
            </p>
          </div>

        {!isAuthenticated ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-blue-200/50 hover:shadow-3xl transition-all duration-500">
              <div className="text-center space-y-8">
                <div className="flex justify-center space-x-3">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200">
                    <span className="text-sm font-medium text-blue-700">🏦 Bank Sulutgo Official Portal</span>
                  </div>
                  <div className="inline-flex items-center px-3 py-2 bg-green-50 rounded-full border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-xs font-medium text-green-700">Live</span>
                  </div>
                </div>
                
                <h3 className="text-3xl font-bold text-slate-800">
                  Professional Banking Support System
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                  Dedicated helpdesk portal for BSG staff and authorized personnel. 
                  Streamlined ticket management with specialized banking templates and 
                  AI-powered routing for efficient resolution.
                </p>
                
                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
                  <div className="group text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <RectangleStackIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-blue-800">{animatedNumbers.tickets}+</div>
                    <div className="text-sm text-blue-600 font-medium">Banking Templates</div>
                  </div>
                  <div className="group text-center p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <TrophyIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-green-800">{animatedNumbers.efficiency}%</div>
                    <div className="text-sm text-green-600 font-medium">Process Efficiency</div>
                  </div>
                  <div className="group text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <BoltIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-purple-800">&lt;{animatedNumbers.response}s</div>
                    <div className="text-sm text-purple-600 font-medium">Response Time</div>
                  </div>
                </div>
                
                <div className="pt-6">
                  <Link
                    to="/login"
                    className="group inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-5 rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                  >
                    <span className="text-lg">Access BSG Helpdesk Portal</span>
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <p className="text-sm text-slate-500 mt-6">
                  For BSG employees and authorized banking personnel only. 
                  Contact your system administrator for access.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-lg mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-slate-200/50">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                    <span className="text-xl">👋</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-slate-800">
                      {getGreeting()}, {user?.name || user?.username}!
                    </h3>
                    <p className="text-sm text-slate-600">Ready to tackle today's challenges?</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Link
                    to="/tickets"
                    className="group flex items-center space-x-4 w-full px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-2xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-200"
                  >
                    <ClipboardDocumentListIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">My Tickets</div>
                      <div className="text-xs opacity-75">View and track your requests</div>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  {/* Show appropriate actions based on user role */}
                  {user?.role === 'manager' ? (
                    <>
                      <Link
                        to="/manager"
                        className="group flex items-center space-x-4 w-full px-5 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg"
                      >
                        <CheckCircleIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <div className="flex-1 text-left">
                          <div className="font-semibold">Pending Approvals</div>
                          <div className="text-xs opacity-90">Review team requests</div>
                        </div>
                        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <Link
                        to="/categorization/analytics"
                        className="group flex items-center space-x-4 w-full px-5 py-4 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-2xl hover:from-purple-100 hover:to-purple-200 transition-all duration-200 border border-purple-200"
                      >
                        <ChartBarIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <div className="flex-1 text-left">
                          <div className="font-semibold">Analytics Dashboard</div>
                          <div className="text-xs opacity-75">Performance insights</div>
                        </div>
                        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/service-catalog-v2"
                        className="group flex items-center space-x-4 w-full px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
                      >
                        <RectangleStackIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <div className="flex-1 text-left">
                          <div className="font-semibold">Service Catalog</div>
                          <div className="text-xs opacity-90">Browse available services</div>
                        </div>
                        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <Link
                        to="/create-ticket"
                        className="group flex items-center space-x-4 w-full px-5 py-4 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-2xl hover:from-green-100 hover:to-emerald-100 transition-all duration-200 border border-green-200"
                      >
                        <PlusCircleIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <div className="flex-1 text-left">
                          <div className="font-semibold">Create General Ticket</div>
                          <div className="text-xs opacity-75">Quick ticket creation</div>
                        </div>
                        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </>
                  )}
                  
                  {/* Show technician-specific actions */}
                  {user?.role === 'technician' && (
                    <>
                      <Link
                        to="/technician/workspace"
                        className="group flex items-center space-x-4 w-full px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
                      >
                        <ClipboardDocumentListIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <div className="flex-1 text-left">
                          <div className="font-semibold">Technician Workspace</div>
                          <div className="text-xs opacity-90">Manage assigned tickets</div>
                        </div>
                        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <Link
                        to="/categorization/queue"
                        className="group flex items-center space-x-4 w-full px-5 py-4 bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 rounded-2xl hover:from-orange-100 hover:to-orange-200 transition-all duration-200 border border-orange-200"
                      >
                        <TicketIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <div className="flex-1 text-left">
                          <div className="font-semibold">Categorization Queue</div>
                          <div className="text-xs opacity-75">Process uncategorized tickets</div>
                        </div>
                        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </>
                  )}
                  
                  {/* Show admin-specific actions */}
                  {user?.role === 'admin' && (
                    <>
                      <Link
                        to="/admin/register"
                        className="group flex items-center space-x-4 w-full px-5 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg"
                      >
                        <BuildingOffice2Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <div className="flex-1 text-left">
                          <div className="font-semibold">User Management</div>
                          <div className="text-xs opacity-90">Manage system users</div>
                        </div>
                        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <Link
                        to="/service-catalog-admin"
                        className="group flex items-center space-x-4 w-full px-5 py-4 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 rounded-2xl hover:from-indigo-100 hover:to-indigo-200 transition-all duration-200 border border-indigo-200"
                      >
                        <RectangleStackIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <div className="flex-1 text-left">
                          <div className="font-semibold">Service Catalog Admin</div>
                          <div className="text-xs opacity-75">Manage service templates</div>
                        </div>
                        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Enhanced Quick Access Section for Authenticated Users */}
      {isAuthenticated && (
        <div className="relative">
          {/* Background gradient with subtle patterns */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl opacity-60"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/30 to-purple-50/30 rounded-3xl"></div>
          
          <div className="relative bg-white/40 backdrop-blur-sm rounded-3xl p-10 border border-white/50 shadow-2xl">
            <div className="text-center mb-10">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                    <BuildingOffice2Icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <HeartIcon className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                BSG Helpdesk Service Catalog
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Comprehensive service catalog with AI-powered templates, intelligent routing, and automated workflows
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Quick Actions */}
              <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                    Quick Actions
                  </h3>
                  <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    Most Used
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <Link
                    to="/service-catalog-v2"
                    className="group p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <RectangleStackIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform opacity-75" />
                    </div>
                    <div>
                      <div className="text-lg font-bold mb-1">Service Catalog</div>
                      <div className="text-sm opacity-90">Browse 24+ banking templates</div>
                    </div>
                  </Link>
                  
                  <Link
                    to="/create-ticket"
                    className="group p-6 bg-gradient-to-br from-green-50 to-emerald-100 text-green-700 rounded-2xl hover:from-green-100 hover:to-emerald-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-green-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <PlusCircleIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform opacity-75" />
                    </div>
                    <div>
                      <div className="text-lg font-bold mb-1">Quick Ticket</div>
                      <div className="text-sm opacity-75">Fast issue reporting</div>
                    </div>
                  </Link>
                  
                  <Link
                    to="/tickets"
                    className="group p-6 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700 rounded-2xl hover:from-slate-100 hover:to-slate-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-slate-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <ClipboardDocumentListIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform opacity-75" />
                    </div>
                    <div>
                      <div className="text-lg font-bold mb-1">My Tickets</div>
                      <div className="text-sm opacity-75">Track your requests</div>
                    </div>
                  </Link>
                  
                  {(user?.role === 'manager' || user?.role === 'admin') && (
                    <Link
                      to="/manager"
                      className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 rounded-2xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-purple-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <CheckCircleIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform opacity-75" />
                      </div>
                      <div>
                        <div className="text-lg font-bold mb-1">Approvals</div>
                        <div className="text-sm opacity-75">Review pending requests</div>
                      </div>
                    </Link>
                  )}
                  
                  {user?.role === 'technician' && (
                    <Link
                      to="/technician/workspace"
                      className="group p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <ClipboardDocumentListIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform opacity-75" />
                      </div>
                      <div>
                        <div className="text-lg font-bold mb-1">Workspace</div>
                        <div className="text-sm opacity-90">Manage assigned tickets</div>
                      </div>
                    </Link>
                  )}
                  
                  {user?.role === 'admin' && (
                    <Link
                      to="/service-catalog-admin"
                      className="group p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <RectangleStackIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform opacity-75" />
                      </div>
                      <div>
                        <div className="text-lg font-bold mb-1">Service Admin</div>
                        <div className="text-sm opacity-90">Manage service catalog</div>
                      </div>
                    </Link>
                  )}
                </div>
              </div>

              {/* Enhanced System Status */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                    System Health
                  </h3>
                </div>
                
                <div className="space-y-6">
                  {/* System Status */}
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <CheckCircleIcon className="w-6 h-6 text-green-600" />
                        <span className="font-semibold text-green-800">All Systems Online</span>
                      </div>
                    </div>
                    <div className="text-xs text-green-600 font-medium">99.9% uptime • Last 30 days</div>
                  </div>
                  
                  {/* Live Metrics */}
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <div className="text-2xl font-bold text-blue-800">{animatedNumbers.tickets}+</div>
                      <div className="text-xs text-blue-600 font-medium">Active Templates</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200">
                        <div className="text-lg font-bold text-green-800">{animatedNumbers.efficiency}%</div>
                        <div className="text-xs text-green-600">Efficiency</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                        <div className="text-lg font-bold text-purple-800">&lt;{animatedNumbers.response}s</div>
                        <div className="text-xs text-purple-600">Response</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Tips */}
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                    <div className="flex items-start space-x-3">
                      <BoltIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-yellow-800">Pro Tip</div>
                        <div className="text-xs text-yellow-700 mt-1">Use service catalog for faster processing and better routing</div>
                      </div>
                    </div>
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
