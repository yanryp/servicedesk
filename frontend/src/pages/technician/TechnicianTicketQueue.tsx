// frontend/src/pages/technician/TechnicianTicketQueue.tsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ticketsService } from '../../services';
import { Ticket, TicketStatus } from '../../types';
import {
  QueueListIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';

const TechnicianTicketQueue: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('filter') || 'all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      
      const filters: any = {
        assignedToUserId: user?.id,
        limit: 50
      };

      // Apply status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'overdue') {
          // Handle overdue logic - tickets past due date
          filters.overdue = true;
        } else if (statusFilter === 'urgent') {
          filters.priority = 'urgent';
        } else {
          filters.status = statusFilter;
        }
      }

      // Apply priority filter
      if (priorityFilter !== 'all') {
        filters.priority = priorityFilter;
      }

      const response = await ticketsService.getTickets(filters);
      setTickets(response.tickets || []);
      
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (ticketId: number, newStatus: TicketStatus) => {
    try {
      await ticketsService.updateTicket(ticketId, { status: newStatus });
      loadTickets(); // Reload tickets
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.id?.toString().includes(searchTerm) ||
    ticket.createdBy?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'assigned':
        return PlayIcon;
      case 'in_progress':
        return ArrowPathIcon;
      case 'pending':
        return PauseIcon;
      case 'resolved':
        return CheckCircleIcon;
      default:
        return ClockIcon;
    }
  };

  const getQuickActions = (ticket: Ticket) => {
    const actions = [];
    
    if (ticket.status === 'assigned') {
      actions.push({
        label: 'Start Work',
        action: () => handleStatusUpdate(ticket.id, 'in_progress' as TicketStatus),
        color: 'bg-blue-600 hover:bg-blue-700 text-white'
      });
    }
    
    if (ticket.status === 'in_progress') {
      actions.push({
        label: 'Mark Pending',
        action: () => handleStatusUpdate(ticket.id, 'pending' as TicketStatus),
        color: 'bg-yellow-600 hover:bg-yellow-700 text-white'
      });
      actions.push({
        label: 'Resolve',
        action: () => handleStatusUpdate(ticket.id, 'resolved' as TicketStatus),
        color: 'bg-green-600 hover:bg-green-700 text-white'
      });
    }
    
    if (ticket.status === 'pending') {
      actions.push({
        label: 'Resume',
        action: () => handleStatusUpdate(ticket.id, 'in_progress' as TicketStatus),
        color: 'bg-indigo-600 hover:bg-indigo-700 text-white'
      });
    }
    
    return actions;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <QueueListIcon className="w-8 h-8 mr-3 text-slate-600" />
            My Ticket Queue
          </h1>
          <p className="text-slate-600 mt-1">
            Manage your assigned tickets and track progress
          </p>
        </div>
        <button
          onClick={loadTickets}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-4 h-4 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="all">All Status</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="urgent">Urgent Priority</option>
                <option value="overdue">Overdue SLA</option>
              </select>
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Queue ({filteredTickets.length} tickets)
            </h2>
            <div className="text-sm text-slate-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
              <p className="ml-3 text-slate-600">Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <QueueListIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No tickets found</p>
              <p className="text-slate-400">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => {
                const StatusIcon = getStatusIcon(ticket.status);
                const quickActions = getQuickActions(ticket);
                
                return (
                  <div key={ticket.id} className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="font-bold text-slate-900">#{ticket.id}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority?.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)} flex items-center`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {ticket.status?.replace('_', ' ').toUpperCase()}
                          </span>
                          {/* SLA Warning */}
                          {ticket.slaDueDate && new Date() > new Date(ticket.slaDueDate) && ticket.status !== 'resolved' && (
                            <span className="flex items-center text-red-600 text-xs">
                              <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                              SLA Overdue
                            </span>
                          )}
                        </div>

                        {/* Title and Description */}
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">{ticket.title}</h3>
                        <p className="text-slate-600 mb-3 line-clamp-2">{ticket.description}</p>

                        {/* Meta Information */}
                        <div className="flex items-center space-x-6 text-sm text-slate-500">
                          <span>By: {ticket.createdBy?.name || 'Unknown'}</span>
                          <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                          <span>Updated: {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                          {ticket.slaDueDate && (
                            <span>Due: {new Date(ticket.slaDueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-6">
                        {quickActions.map((action, index) => (
                          <button
                            key={index}
                            onClick={action.action}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${action.color}`}
                          >
                            {action.label}
                          </button>
                        ))}
                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="flex items-center space-x-1 px-3 py-1 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <EyeIcon className="w-4 h-4" />
                          <span>View</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicianTicketQueue;