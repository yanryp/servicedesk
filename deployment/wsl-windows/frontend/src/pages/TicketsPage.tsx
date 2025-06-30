// src/pages/TicketsPage.tsx
// Enhanced requester "My Tickets" page with better status visibility and progress indicators
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFileDownloader } from '../hooks/useFileDownloader';
import { ticketsService } from '../services';
import { Ticket as TicketType } from '../types';
import { 
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayCircleIcon,
  PauseCircleIcon,
  EyeIcon,
  ChatBubbleBottomCenterTextIcon,
  BellIcon,
  CalendarDaysIcon,
  TagIcon,
  ArrowPathIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  XCircleIcon as XCircleIconSolid
} from '@heroicons/react/24/solid';

const TicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token, isLoading: authIsLoading } = useAuth();
  const { downloadFile, downloadingId, downloadError } = useFileDownloader();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [refreshing, setRefreshing] = useState(false);

  const isAuthenticated = !!user;
  const isRequester = user?.role === 'requester';
  const isTechnician = user?.role === 'technician';

  // Status workflow configuration
  const statusWorkflow = [
    { key: 'pending_approval', label: 'Pending Approval', description: 'Waiting for manager approval' },
    { key: 'approved', label: 'Approved', description: 'Approved and ready for assignment' },
    { key: 'assigned', label: 'Assigned', description: 'Assigned to technician' },
    { key: 'in_progress', label: 'In Progress', description: 'Being worked on by technician' },
    { key: 'pending', label: 'Pending', description: 'Waiting for your response' },
    { key: 'resolved', label: 'Resolved', description: 'Solution provided, awaiting confirmation' },
    { key: 'closed', label: 'Closed', description: 'Ticket completed' }
  ];

  // Quick filter configurations for requesters
  const quickFilters = [
    { key: 'active', label: 'Active', icon: PlayCircleIcon, statuses: ['pending_approval', 'approved', 'assigned', 'in_progress'] },
    { key: 'pending_me', label: 'Needs My Attention', icon: BellIcon, statuses: ['pending'] },
    { key: 'resolved', label: 'Ready to Close', icon: CheckCircleIcon, statuses: ['resolved'] },
    { key: 'completed', label: 'Completed', icon: CheckCircleIconSolid, statuses: ['closed'] },
    { key: 'urgent', label: 'Urgent', icon: ExclamationTriangleIconSolid, priority: 'urgent' }
  ];

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, priorityFilter, searchTerm]);

  const fetchTickets = async (showRefresh = false) => {
    if (authIsLoading) return;
    if (!isAuthenticated || !token) {
      setError('You must be logged in to view tickets.');
      setLoading(false);
      return;
    }

    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Build filters object for enhanced ticketsService
      const filters: any = {
        page: currentPage.toString(),
        limit: '12', // Increased for card view
      };
      
      // For requesters, only show their own tickets
      if (isRequester) {
        filters.createdByUserId = user.id;
      }
      
      if (statusFilter) filters.status = statusFilter;
      if (priorityFilter) filters.priority = priorityFilter;
      if (searchTerm) filters.search = searchTerm;

      console.log('TicketsPage: Fetching tickets with enhanced service');
      
      const response = await ticketsService.getTickets(filters);
      setTickets(response.tickets);
      setTotalPages(response.totalPages);
      setError(null);
    } catch (err: any) {
      console.error('TicketsPage: Failed to fetch tickets:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch tickets.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTickets();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [isAuthenticated, token, authIsLoading, currentPage, statusFilter, priorityFilter, searchTerm]);

  // Auto-refresh every 30 seconds for requesters to see status updates
  useEffect(() => {
    if (isRequester) {
      const interval = setInterval(() => {
        fetchTickets(true);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isRequester]);

  const getStatusProgress = (status: string) => {
    const currentIndex = statusWorkflow.findIndex(s => s.key === status);
    const totalSteps = statusWorkflow.length;
    const progress = currentIndex >= 0 ? ((currentIndex + 1) / totalSteps) * 100 : 0;
    return { currentIndex, totalSteps, progress };
  };

  const getStatusIcon = (status: string, size = 'w-5 h-5') => {
    switch (status) {
      case 'pending_approval':
      case 'awaiting_approval':
        return <ClockIconSolid className={`${size} text-amber-500`} />;
      case 'approved':
        return <CheckCircleIconSolid className={`${size} text-emerald-500`} />;
      case 'assigned':
        return <UserIcon className={`${size} text-blue-500`} />;
      case 'in_progress':
        return <PlayCircleIcon className={`${size} text-purple-500`} />;
      case 'pending':
        return <ExclamationTriangleIconSolid className={`${size} text-orange-500`} />;
      case 'resolved':
        return <CheckCircleIcon className={`${size} text-green-500`} />;
      case 'closed':
        return <CheckCircleIconSolid className={`${size} text-gray-500`} />;
      case 'cancelled':
      case 'rejected':
        return <XCircleIconSolid className={`${size} text-red-500`} />;
      default:
        return <ClockIcon className={`${size} text-gray-400`} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval': 
      case 'awaiting_approval': 
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'approved': 
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'assigned': 
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': 
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pending': 
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'resolved': 
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': 
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
      case 'rejected': 
        return 'bg-red-100 text-red-800 border-red-200';
      default: 
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  const handleQuickFilter = (filter: any) => {
    if (filter.statuses) {
      setStatusFilter(filter.statuses[0]); // For simplicity, use first status
    } else if (filter.priority) {
      setPriorityFilter(filter.priority);
      setStatusFilter('');
    } else if (filter.key === 'active') {
      setStatusFilter('');
      setPriorityFilter('');
    }
  };

  const clearFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setSearchTerm('');
  };

  if (authIsLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Tickets</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Authentication Required</h3>
        <p className="text-gray-600">Please log in to view your tickets.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
            <ClipboardDocumentListIcon className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {isRequester ? 'My Support Tickets' : `${user?.department?.name || ''} Support Tickets`}
        </h1>
        <p className="mt-2 text-gray-600">
          {isRequester 
            ? 'Track the progress of your support requests' 
            : `Department tickets for ${user?.department?.name || 'your department'}`
          }
        </p>
      </div>

      {/* Quick Filters & Actions */}
      <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Quick Filters</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchTickets(true)}
              disabled={refreshing}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              title="Refresh tickets"
            >
              <ArrowPathIcon className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-4">
          {quickFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => handleQuickFilter(filter)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-lg border border-gray-200 hover:border-blue-200 transition-all duration-200"
            >
              <filter.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{filter.label}</span>
            </button>
          ))}
          <button
            onClick={clearFilters}
            className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 transition-all duration-200"
          >
            <XCircleIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Clear All</span>
          </button>
        </div>

        {/* Search and detailed filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">All Statuses</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending (Needs My Response)</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Tickets Display */}
      {tickets.length === 0 ? (
        <div className="bg-white shadow-lg rounded-2xl p-12 border border-gray-200 text-center">
          <ClipboardDocumentListIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Tickets Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter || priorityFilter
              ? "No tickets match your current filters. Try adjusting your search criteria."
              : "You haven't created any tickets yet. Create your first support ticket to get started."
            }
          </p>
          {!searchTerm && !statusFilter && !priorityFilter && isRequester && (
            <Link
              to="/service-catalog-v2"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span>Create Your First Ticket</span>
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Tickets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => {
              const statusProgress = getStatusProgress(ticket.status);
              const isOverdue = ticket.slaDueDate && 
                new Date(ticket.slaDueDate) < new Date() && 
                ticket.status !== 'closed';

              return (
                <div
                  key={ticket.id}
                  className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Card Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(ticket.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {ticket.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {ticket.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600">Progress</span>
                        <span className="text-xs text-gray-500">
                          {statusProgress.currentIndex + 1} of {statusProgress.totalSteps}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${statusProgress.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {statusWorkflow[statusProgress.currentIndex]?.description || 'Processing...'}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <CalendarDaysIcon className="w-3 h-3" />
                        <span>Created {formatTimeAgo(ticket.createdAt)}</span>
                      </div>
                      <span className="font-medium">#{ticket.id}</span>
                    </div>

                    {/* SLA Warning */}
                    {isOverdue && (
                      <div className="flex items-center space-x-1 text-xs text-red-600 mb-3 bg-red-50 px-2 py-1 rounded">
                        <ExclamationTriangleIconSolid className="w-3 h-3" />
                        <span>Overdue</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">View Details</span>
                      </Link>
                      
                      {ticket.status === 'pending' && (
                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-lg hover:bg-orange-200 transition-colors"
                        >
                          <ChatBubbleBottomCenterTextIcon className="w-3 h-3" />
                          <span className="text-xs font-medium">Respond</span>
                        </Link>
                      )}

                      {ticket.status === 'resolved' && (
                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <CheckCircleIcon className="w-3 h-3" />
                          <span className="text-xs font-medium">Confirm</span>
                        </Link>
                      )}

                      {ticket.attachments && ticket.attachments.length > 0 && (
                        <div className="flex items-center space-x-1 text-gray-500">
                          <DocumentArrowDownIcon className="w-3 h-3" />
                          <span className="text-xs">{ticket.attachments.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4 py-6">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span>Previous</span>
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TicketsPage;