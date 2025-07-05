// frontend/src/pages/technician/TechnicianDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ticketsService } from '../../services';
import { Ticket } from '../../types';
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  QueueListIcon,
  BoltIcon,
  TrophyIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  assignedTickets: number;
  completedToday: number;
  avgResolutionTime: string;
  pendingApprovals: number;
  overdueSLA: number;
  totalResolved: number;
}

const TechnicianDashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    assignedTickets: 0,
    completedToday: 0,
    avgResolutionTime: '0h',
    pendingApprovals: 0,
    overdueSLA: 0,
    totalResolved: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load recent tickets assigned to technician
      const response = await ticketsService.getTickets({
        assignedToUserId: user?.id,
        limit: 10
      });
      
      setRecentTickets(response.tickets || []);
      
      // Calculate stats from tickets
      const allTickets = response.tickets || [];
      const today = new Date().toDateString();
      
      const assignedTickets = allTickets.filter(t => 
        ['assigned', 'in_progress', 'pending'].includes(t.status)
      ).length;
      
      const completedToday = allTickets.filter(t => 
        t.status === 'resolved' && 
        new Date(t.updatedAt).toDateString() === today
      ).length;
      
      const overdueSLA = allTickets.filter(t => 
        t.status !== 'resolved' && t.status !== 'closed' &&
        t.slaDueDate && new Date() > new Date(t.slaDueDate)
      ).length;
      
      const totalResolved = allTickets.filter(t => 
        t.status === 'resolved' || t.status === 'closed'
      ).length;
      
      setStats({
        assignedTickets,
        completedToday,
        avgResolutionTime: '2.3h', // Placeholder
        pendingApprovals: 0, // Technicians don't have pending approvals
        overdueSLA,
        totalResolved
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'assigned':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'in_progress':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'resolved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'closed':
        return 'text-slate-600 bg-slate-50 border-slate-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
        <p className="ml-4 text-slate-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-slate-600 to-slate-800 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name || 'Technician'}! 👨‍🔧
            </h1>
            <p className="text-slate-200 text-lg">
              You have {stats.assignedTickets} active tickets in your queue
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.completedToday}</div>
              <div className="text-sm text-slate-300">Completed Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.avgResolutionTime}</div>
              <div className="text-sm text-slate-300">Avg Resolution</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Tickets</p>
              <p className="text-3xl font-bold text-slate-900">{stats.assignedTickets}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <QueueListIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/technician/portal/queue"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View Queue →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Completed Today</p>
              <p className="text-3xl font-bold text-green-600">{stats.completedToday}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">
              Great progress! 🎉
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">SLA Overdue</p>
              <p className="text-3xl font-bold text-red-600">{stats.overdueSLA}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/technician/portal/queue?filter=overdue"
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Review Now →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Resolved</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalResolved}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <TrophyIcon className="w-6 h-6 text-slate-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-slate-600 font-medium">
              Keep it up! 💪
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
          <BoltIcon className="w-6 h-6 mr-2 text-yellow-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/technician/portal/queue?filter=urgent"
            className="flex items-center space-x-3 p-4 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
          >
            <FireIcon className="w-8 h-8 text-red-500" />
            <div>
              <div className="font-medium text-slate-900">Urgent Tickets</div>
              <div className="text-sm text-slate-600">Handle critical issues</div>
            </div>
          </Link>

          <Link
            to="/technician/portal/quick-actions"
            className="flex items-center space-x-3 p-4 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
          >
            <BoltIcon className="w-8 h-8 text-blue-500" />
            <div>
              <div className="font-medium text-slate-900">Bulk Actions</div>
              <div className="text-sm text-slate-600">Update multiple tickets</div>
            </div>
          </Link>

          <Link
            to="/technician/portal/knowledge-base"
            className="flex items-center space-x-3 p-4 rounded-lg border border-green-200 hover:bg-green-50 transition-colors"
          >
            <ArrowTrendingUpIcon className="w-8 h-8 text-green-500" />
            <div>
              <div className="font-medium text-slate-900">Tech Docs</div>
              <div className="text-sm text-slate-600">Access troubleshooting guides</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <ClockIcon className="w-6 h-6 mr-2 text-blue-500" />
              Recent Activity
            </h2>
            <Link
              to="/technician/portal/queue"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View All →
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          {recentTickets.length === 0 ? (
            <div className="text-center py-8">
              <UserGroupIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No recent tickets found</p>
              <p className="text-sm text-slate-400">New assignments will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTickets.slice(0, 5).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-medium text-slate-900">#{ticket.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority?.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                        {ticket.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-medium text-slate-900 mb-1">{ticket.title}</h3>
                    <p className="text-sm text-slate-600">
                      Requested by {ticket.createdBy?.name || 'Unknown'} • 
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;