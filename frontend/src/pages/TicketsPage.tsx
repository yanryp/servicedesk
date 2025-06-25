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
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const isAuthenticated = !!user;

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, priorityFilter, templateCategoryFilter, skillFilter, searchTerm]);

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
      if (templateCategoryFilter) filters.templateCategory = templateCategoryFilter;
      if (skillFilter) filters.skill = skillFilter;
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
  }, [isAuthenticated, token, authIsLoading, currentPage, statusFilter, priorityFilter, templateCategoryFilter, skillFilter, searchTerm]);

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
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending_approval': 
      case 'awaiting_approval': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'approved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'assigned': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'duplicate': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'rejected': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getSlaStatus = (slaDueDate: string | null | undefined, status: string) => {
    if (!slaDueDate || status === 'closed') return null;
    
    const now = new Date();
    const due = new Date(slaDueDate);
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) {
      return { status: 'overdue', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    } else if (diffHours < 2) {
      return { status: 'critical', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    } else if (diffHours < 8) {
      return { status: 'warning', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    } else {
      return { status: 'ok', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    }
  };

  const formatTimeRemaining = (slaDueDate: string | null | undefined) => {
    if (!slaDueDate) return '';
    
    const now = new Date();
    const due = new Date(slaDueDate);
    const diffMs = due.getTime() - now.getTime();
    
    if (diffMs < 0) {
      const overdue = Math.abs(diffMs);
      const hours = Math.floor(overdue / (1000 * 60 * 60));
      const minutes = Math.floor((overdue % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m overdue`;
    } else {
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m remaining`;
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
            <option value="pending_approval">Pending Approval</option>
            <option value="awaiting_approval">Awaiting Approval</option>
            <option value="approved">Approved</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
            <option value="duplicate">Duplicate</option>
            <option value="rejected">Rejected</option>
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
          
          <select 
            value={templateCategoryFilter} 
            onChange={(e) => setTemplateCategoryFilter(e.target.value)}
            className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">All Templates</option>
            <option value="KASDA">KASDA (Treasury)</option>
            <option value="ATM">ATM Operations</option>
            <option value="OLIBS">Core Banking</option>
            <option value="BSGTouch">Mobile Banking</option>
            <option value="BSG QRIS">QR Payments</option>
            <option value="XCard">Card Management</option>
            <option value="Network">Network Issues</option>
            <option value="Switching">Payment Switching</option>
          </select>
          
          {user?.role === 'technician' && (
            <select 
              value={skillFilter} 
              onChange={(e) => setSkillFilter(e.target.value)}
              className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Skills</option>
              <option value="KASDA Support">KASDA Support</option>
              <option value="ATM Specialist">ATM Specialist</option>
              <option value="Core Banking">Core Banking</option>
              <option value="Mobile Banking">Mobile Banking</option>
              <option value="Network Admin">Network Admin</option>
              <option value="Payment Systems">Payment Systems</option>
              <option value="Technical Support">Technical Support</option>
            </select>
          )}
        </div>
        
        {/* Quick Filter Buttons for Technicians */}
        {user?.role === 'technician' && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
            <span className="text-sm font-medium text-slate-600 flex items-center">Quick Filters:</span>
            <button
              onClick={() => {
                setStatusFilter('assigned');
                setSkillFilter(user.primarySkill || '');
                setTemplateCategoryFilter('');
              }}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
            >
              My Assigned Tasks
            </button>
            <button
              onClick={() => {
                setStatusFilter('in_progress');
                setSkillFilter('');
                setTemplateCategoryFilter('');
              }}
              className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors"
            >
              In Progress
            </button>
            <button
              onClick={() => {
                setStatusFilter('');
                setSkillFilter('');
                setTemplateCategoryFilter('KASDA');
              }}
              className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
            >
              KASDA Issues
            </button>
            <button
              onClick={() => {
                setStatusFilter('');
                setSkillFilter('');
                setTemplateCategoryFilter('ATM');
              }}
              className="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded-full hover:bg-orange-200 transition-colors"
            >
              ATM Problems
            </button>
            <button
              onClick={() => {
                setStatusFilter('');
                setSkillFilter('');
                setTemplateCategoryFilter('');
                setPriorityFilter('urgent');
              }}
              className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors"
            >
              Urgent Only
            </button>
            <button
              onClick={() => {
                setStatusFilter('');
                setPriorityFilter('');
                setTemplateCategoryFilter('');
                setSkillFilter('');
                setSearchTerm('');
              }}
              className="px-3 py-1 text-xs bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
      {/* Tickets Display */}
      {tickets.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-12 border border-slate-200/50 text-center">
          <ClipboardDocumentListIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No Tickets Found</h3>
          <p className="text-slate-600 mb-6">
            {searchTerm || statusFilter || priorityFilter || templateCategoryFilter || skillFilter
              ? "No tickets match your current filters. Try adjusting your search criteria or use the 'Clear All' quick filter."
              : "You haven't created any tickets yet. Create your first support ticket to get started."
            }
          </p>
          {!searchTerm && !statusFilter && !priorityFilter && !templateCategoryFilter && !skillFilter && (
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
                          (() => {
                            const slaStatus = getSlaStatus(ticket.slaDueDate, ticket.status);
                            return (
                              <div className={`text-sm p-2 rounded-lg border ${slaStatus?.bg || 'bg-slate-50'} ${slaStatus?.border || 'border-slate-200'}`}>
                                <div className={`flex items-center space-x-1 ${slaStatus?.color || 'text-slate-900'} font-medium`}>
                                  {slaStatus?.status === 'overdue' && <ExclamationTriangleIcon className="w-4 h-4" />}
                                  {slaStatus?.status === 'critical' && <ClockIcon className="w-4 h-4" />}
                                  <span>{new Date(ticket.slaDueDate).toLocaleDateString()}</span>
                                </div>
                                <div className={`text-xs ${slaStatus?.color || 'text-slate-500'} font-medium`}>
                                  {formatTimeRemaining(ticket.slaDueDate)}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {new Date(ticket.slaDueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            );
                          })()
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
