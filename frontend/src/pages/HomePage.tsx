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

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto px-4">
        {/* Professional Hero Section */}
        <div className="text-center space-y-8">
          {/* Clean Logo and Title */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TicketIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-slate-800">
                BSG Helpdesk
              </h1>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">System Online • {formatTime(currentTime)}</span>
              </div>
            </div>
            
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Professional banking support portal for BSG staff and authorized personnel
            </p>
          </div>

        {!isAuthenticated ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-700">🏦 Bank Sulutgo Official Portal</span>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-slate-800">
                    Staff Portal Access
                  </h3>
                  <p className="text-sm text-slate-600">
                    Secure access for BSG employees and authorized banking personnel
                  </p>
                </div>
                
                <Link
                  to="/login"
                  className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors"
                >
                  Sign In to BSG Helpdesk
                </Link>
                
                <p className="text-xs text-slate-500">
                  Contact your system administrator for access credentials
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  Welcome, {user?.name || user?.username}!
                </h3>
                <p className="text-sm text-slate-600">
                  Access your workspace and manage your tickets
                </p>
                <div className="space-y-2">
                  <Link
                    to="/tickets"
                    className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    My Tickets
                  </Link>
                  <Link
                    to="/service-catalog-v2"
                    className="block w-full bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Service Catalog
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
