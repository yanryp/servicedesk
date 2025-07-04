// frontend/src/pages/customer/CustomerDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface QuickStat {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  change?: string;
}

interface RecentTicket {
  id: number;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  lastUpdate: string;
}

interface PopularArticle {
  id: number;
  title: string;
  category: string;
  views: number;
  helpful: number;
}

const CustomerDashboard: React.FC = () => {
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
  const [popularArticles, setPopularArticles] = useState<PopularArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setRecentTickets([
        {
          id: 1,
          title: 'BSGDirect Login Issue',
          status: 'In Progress',
          priority: 'High',
          createdAt: '2024-07-04',
          lastUpdate: '2 hours ago'
        },
        {
          id: 2,
          title: 'Password Reset Request',
          status: 'Resolved',
          priority: 'Medium',
          createdAt: '2024-07-03',
          lastUpdate: '1 day ago'
        },
        {
          id: 3,
          title: 'Email Access Problem',
          status: 'Pending Approval',
          priority: 'Low',
          createdAt: '2024-07-02',
          lastUpdate: '2 days ago'
        }
      ]);

      setPopularArticles([
        {
          id: 1,
          title: 'How to Reset Your Password',
          category: 'Account Management',
          views: 245,
          helpful: 89
        },
        {
          id: 2,
          title: 'BSGDirect Mobile App Setup',
          category: 'Mobile Banking',
          views: 189,
          helpful: 76
        },
        {
          id: 3,
          title: 'Internet Banking Security Tips',
          category: 'Security',
          views: 156,
          helpful: 92
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const quickStats: QuickStat[] = [
    {
      label: 'Open Tickets',
      value: 2,
      icon: TicketIcon,
      color: 'blue',
      change: '+1 this week'
    },
    {
      label: 'Pending Approval',
      value: 1,
      icon: ClockIcon,
      color: 'yellow',
      change: 'Awaiting manager review'
    },
    {
      label: 'Resolved This Month',
      value: 5,
      icon: CheckCircleIcon,
      color: 'green',
      change: '100% satisfaction'
    },
    {
      label: 'Avg Response Time',
      value: '2.5 hrs',
      icon: ChatBubbleLeftRightIcon,
      color: 'purple',
      change: '15% faster than last month'
    }
  ];

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to BSG Support Portal</h1>
            <p className="text-blue-100 text-lg">
              Get help quickly with our self-service options or submit a new request.
            </p>
          </div>
          <div className="hidden md:block">
            <Link
              to="/customer/create-ticket"
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition-all duration-200 flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Request</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-slate-600 mb-2">{stat.label}</p>
                {stat.change && (
                  <p className="text-xs text-slate-500">{stat.change}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/customer/create-ticket"
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
              <PlusIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Submit New Request</p>
              <p className="text-sm text-slate-500">Create a support ticket</p>
            </div>
          </Link>

          <Link
            to="/customer/knowledge-base"
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-dashed border-green-300 hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
              <DocumentTextIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Browse Help Articles</p>
              <p className="text-sm text-slate-500">Find solutions quickly</p>
            </div>
          </Link>

          <Link
            to="/customer/services"
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200">
              <MagnifyingGlassIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Service Catalog</p>
              <p className="text-sm text-slate-500">View available services</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tickets */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recent Tickets</h2>
            <Link
              to="/customer/track-tickets"
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentTickets.map((ticket) => (
              <div key={ticket.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-slate-900 flex-1">{ticket.title}</h3>
                  <div className="flex space-x-2 ml-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>#{ticket.id} • Created {ticket.createdAt}</span>
                  <span>Updated {ticket.lastUpdate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Help Articles */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Popular Help Articles</h2>
            <Link
              to="/customer/knowledge-base"
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {popularArticles.map((article) => (
              <Link
                key={article.id}
                to={`/customer/knowledge-base/articles/${article.id}`}
                className="block border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200"
              >
                <h3 className="font-medium text-slate-900 mb-2">{article.title}</h3>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span className="bg-slate-100 px-2 py-1 rounded text-xs">{article.category}</span>
                  <div className="flex items-center space-x-4">
                    <span>{article.views} views</span>
                    <span>{article.helpful}% helpful</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;