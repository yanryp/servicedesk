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
  UserGroupIcon 
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
          <div className="flex justify-center space-x-4">
            <Link
              to="/login"
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span>Get Started</span>
            </Link>
            <Link
              to="/register"
              className="flex items-center space-x-2 border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-xl font-medium hover:bg-blue-50 transition-all duration-200"
            >
              <span>Create Account</span>
            </Link>
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
              <Link
                to="/create-ticket"
                className="flex items-center space-x-3 w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-all duration-200"
              >
                <PlusCircleIcon className="w-5 h-5" />
                <span>Create New Ticket</span>
              </Link>
            </div>
          </div>
        )}
      </div>

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
