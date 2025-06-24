// src/pages/TicketsPage.tsx
// Stage 4 Migration: Updated to use unified enhanced endpoints via ticketsService
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
  CalendarIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Using imported Ticket type from ../types instead of local interface
// Enhanced endpoint returns camelCase Prisma format, not snake_case legacy format

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
  const isAuthenticated = !!user;

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, priorityFilter, searchTerm]);

  useEffect(() => {
    const fetchTickets = async () => {
      if (authIsLoading) return;
      if (!isAuthenticated || !token) {
        setError('You must be logged in to view tickets.');
        setLoading(false);
        return;
      }

      // Build filters object for enhanced ticketsService
      const filters: any = {
        page: currentPage.toString(),
        limit: '10',
      };
      if (statusFilter) filters.status = statusFilter;
      if (priorityFilter) filters.priority = priorityFilter;
      if (searchTerm) filters.search = searchTerm;

      try {
        setLoading(true);
        console.log('TicketsPage: Fetching tickets with enhanced service');
        
        // Use unified ticketsService instead of direct axios calls
        const response = await ticketsService.getTickets(filters);
        setTickets(response.tickets);
        setTotalPages(response.totalPages);
        setError(null);
      } catch (err: any) {
        console.error('TicketsPage: Failed to fetch tickets:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch tickets.');
      } finally {
        setLoading(false);
      }
    };

    const handler = setTimeout(() => {
      fetchTickets();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [isAuthenticated, token, authIsLoading, currentPage, statusFilter, priorityFilter, searchTerm]);

  if (authIsLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600">Loading your tickets...</p>
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
        <UserIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Authentication Required</h3>
        <p className="text-slate-600">Please log in to view your tickets.</p>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending-approval': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
            <ClipboardDocumentListIcon className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {user?.role === 'technician' ? `${user.department?.name || ''} Support Tickets` : 'My Support Tickets'}
        </h1>
        <p className="mt-2 text-slate-600">
          {user?.role === 'technician' 
            ? `Department tickets for ${user.department?.name || 'your department'}` 
            : 'Track and manage your support requests'
          }
        </p>
        {user?.role === 'technician' && user.department && (
          <div className="mt-3">
            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              📁 {user.department.name} Department
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-slate-200/50">
        <div className="flex items-center space-x-2 mb-4">
          <FunnelIcon className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-800">Filters & Search</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="pending-approval">Pending Approval</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-12 border border-slate-200/50 text-center">
          <ClipboardDocumentListIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No Tickets Found</h3>
          <p className="text-slate-600 mb-6">
            {searchTerm || statusFilter || priorityFilter 
              ? "No tickets match your current filters. Try adjusting your search criteria."
              : "You haven't created any tickets yet. Create your first support ticket to get started."
            }
          </p>
          {!searchTerm && !statusFilter && !priorityFilter && (
            <Link
              to="/create-ticket"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span>Create Your First Ticket</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-slate-200/50 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">
              {user?.role === 'technician' ? 'Department Tickets' : 'My Tickets'}
            </h3>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 table-auto">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Priority
                  </th>
                  {user?.role === 'technician' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Requester
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    SLA Due
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {tickets.map((ticket) => {
                  const isOverdue = ticket.slaDueDate && 
                    new Date(ticket.slaDueDate) < new Date() && 
                    ticket.status !== 'closed';
                  
                  return (
                    <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Ticket Title & Description */}
                      <td className="px-6 py-4">
                        <div className="max-w-sm">
                          <div className="flex items-center space-x-2 mb-1">
                            <Link 
                              to={`/tickets/${ticket.id}`}
                              className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors truncate"
                              title={ticket.title}
                            >
                              {ticket.title}
                            </Link>
                            <span className="text-xs text-slate-500 flex-shrink-0">#{ticket.id}</span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2" title={ticket.description}>
                            {ticket.description}
                          </p>
                          {ticket.attachments && ticket.attachments.length > 0 && (
                            <div className="mt-1 flex items-center space-x-1">
                              <DocumentArrowDownIcon className="w-3 h-3 text-slate-400" />
                              <span className="text-xs text-slate-500">
                                {ticket.attachments?.length || 0} file(s)
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </td>
                      
                      {/* Priority */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                      </td>
                      
                      {/* Requester (Technician View Only) */}
                      {user?.role === 'technician' && (
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-slate-900">
                              {ticket.createdBy?.username || `User #${ticket.createdByUserId}`}
                            </div>
                            <div className="text-xs text-slate-500">
                              {ticket.createdBy?.department?.name || 'No department'}
                            </div>
                            {ticket.createdBy?.email && (
                              <div className="text-xs text-slate-400">
                                {ticket.createdBy.email}
                              </div>
                            )}
                          </div>
                        </td>
                      )}
                      
                      {/* Category */}
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-slate-900">
                            {ticket.serviceItem?.name || ticket.item?.name || 'Uncategorized'}
                          </div>
                          {ticket.serviceItem?.description && (
                            <div className="text-xs text-slate-500">
                              {ticket.serviceItem.description}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* Created Date */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      
                      {/* SLA Due */}
                      <td className="px-6 py-4">
                        {ticket.slaDueDate ? (
                          <div className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-slate-900'}`}>
                            <div className="flex items-center space-x-1">
                              {isOverdue && <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />}
                              <span>{new Date(ticket.slaDueDate).toLocaleDateString()}</span>
                            </div>
                            <div className="text-xs text-slate-500">
                              {isOverdue ? 'Overdue' : new Date(ticket.slaDueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">Not set</span>
                        )}
                      </td>
                      
                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/tickets/${ticket.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                          >
                            View
                          </Link>
                          {ticket.attachments && ticket.attachments.length > 0 && (
                            <button
                              onClick={() => downloadFile(ticket.attachments![0])}
                              disabled={downloadingId === ticket.attachments![0].id}
                              className="text-slate-600 hover:text-slate-800 text-sm transition-colors disabled:opacity-50"
                              title="Download first attachment"
                            >
                              <DocumentArrowDownIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 pt-8">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            <span>Previous</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600">
              Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
            </span>
          </div>
          
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <span>Next</span>
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TicketsPage;
