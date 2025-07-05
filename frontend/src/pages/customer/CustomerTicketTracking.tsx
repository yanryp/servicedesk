// frontend/src/pages/customer/CustomerTicketTracking.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  UserIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { ticketsService } from '../../services/tickets';
import { useAuth } from '../../context/AuthContext';
import type { Ticket } from '../../types';

// Use the existing Ticket type from the system and extend if needed
interface CustomerTicket extends Ticket {
  subject: string; // Map from title
  ticketNumber: string;
  service: string;
  category: string;
  estimatedResolution?: string;
  resolutionNotes?: string;
  customerSatisfaction?: number;
  commentsCount: number;
  attachmentsCount: number;
  assignedToName?: string; // Rename to avoid conflict with Ticket.assignedTo
}

interface TicketFilter {
  status: string;
  priority: string;
  service: string;
  dateRange: string;
  searchTerm: string;
}

const CustomerTicketTracking: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<CustomerTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<CustomerTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<CustomerTicket | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<TicketFilter>({
    status: 'all',
    priority: 'all',
    service: 'all',
    dateRange: 'all',
    searchTerm: ''
  });

  // Load tickets data from API
  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get tickets for the current requester only
      const response = await ticketsService.getTickets({
        page: 1,
        limit: 100 // Get all tickets for the user
      });
      
      // Transform tickets to match CustomerTicket interface
      const customerTickets: CustomerTicket[] = response.tickets.map(ticket => ({
        ...ticket,
        subject: ticket.title, // Map title to subject
        ticketNumber: `BSG-${ticket.id.toString().padStart(4, '0')}`,
        service: ticket.serviceItem?.name || 'General Support',
        category: ticket.serviceItem ? 'Service Request' : 'General',
        estimatedResolution: undefined, // Not available in current API
        resolutionNotes: undefined, // Not available in current API
        customerSatisfaction: undefined, // Not available in current API
        commentsCount: 0, // Not available in current API
        attachmentsCount: ticket.attachments?.length || 0,
        assignedToName: ticket.assignedTo?.name || undefined
      }));
      
      setTickets(customerTickets);
      setFilteredTickets(customerTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
      setError('Failed to load your tickets. Please try again.');
      setTickets([]);
      setFilteredTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshTickets = async () => {
    setRefreshing(true);
    await loadTickets();
    setRefreshing(false);
  };

  // Filter tickets based on criteria
  useEffect(() => {
    let filtered = tickets;

    if (filters.status !== 'all') {
      filtered = filtered.filter(ticket => 
        ticket.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(ticket => 
        ticket.priority.toLowerCase() === filters.priority.toLowerCase()
      );
    }

    if (filters.service !== 'all') {
      filtered = filtered.filter(ticket => 
        ticket.service.toLowerCase().includes(filters.service.toLowerCase())
      );
    }

    if (filters.searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.subject.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    setFilteredTickets(filtered);
  }, [filters, tickets]);

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending approval':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in progress':
        return <ArrowPathIcon className="w-4 h-4" />;
      case 'pending approval':
        return <ClockIcon className="w-4 h-4" />;
      case 'resolved':
      case 'closed':
        return <CheckCircleIcon className="w-4 h-4" />;
      default:
        return <TicketIcon className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Less than an hour ago';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-${i < rating ? 'yellow' : 'gray'}-400 text-sm`}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-slate-600">Loading your tickets...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Tickets</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadTickets}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Track Your Requests</h1>
          <p className="text-slate-600 mt-1">Monitor the status of your support tickets</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshTickets}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-all duration-200 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/customer/create-ticket"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2"
          >
            <TicketIcon className="w-4 h-4" />
            <span>New Request</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-900">Search & Filter</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
          >
            <FunnelIcon className="w-4 h-4" />
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ticket number, subject, or description..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending approval">Pending Approval</option>
                <option value="open">Open</option>
                <option value="in progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Service</label>
              <select
                value={filters.service}
                onChange={(e) => setFilters(prev => ({ ...prev, service: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Services</option>
                <option value="password">Password Reset</option>
                <option value="email">Email Support</option>
                <option value="bsgdirect">BSGDirect Support</option>
                <option value="mobile">Mobile Banking</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>
          Showing {filteredTickets.length} of {tickets.length} tickets
        </span>
        {filters.searchTerm && (
          <button
            onClick={() => setFilters(prev => ({ ...prev, searchTerm: '' }))}
            className="text-blue-600 hover:text-blue-800"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
            <TicketIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No tickets found</h3>
            <p className="text-slate-600 mb-6">
              {filters.searchTerm || filters.status !== 'all' || filters.priority !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'You haven\'t submitted any support requests yet.'}
            </p>
            <Link
              to="/customer/create-ticket"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
            >
              <TicketIcon className="w-4 h-4" />
              <span>Submit Your First Request</span>
            </Link>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-slate-900">{ticket.subject}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded border text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(ticket.status)}
                          <span>{ticket.status}</span>
                        </div>
                      </span>
                      <span className={`px-2 py-1 rounded border text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{ticket.description}</p>
                  <div className="flex items-center space-x-6 text-xs text-slate-500">
                    <span className="flex items-center space-x-1">
                      <TicketIcon className="w-3 h-3" />
                      <span>{ticket.ticketNumber}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <CalendarIcon className="w-3 h-3" />
                      <span>Created {formatDate(ticket.createdAt)}</span>
                    </span>
                    <span>Updated {getTimeAgo(ticket.updatedAt)}</span>
                    {ticket.assignedToName && (
                      <span className="flex items-center space-x-1">
                        <UserIcon className="w-3 h-3" />
                        <span>Assigned to {ticket.assignedToName}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {ticket.commentsCount > 0 && (
                    <span className="flex items-center space-x-1 text-xs text-slate-500">
                      <ChatBubbleLeftRightIcon className="w-3 h-3" />
                      <span>{ticket.commentsCount}</span>
                    </span>
                  )}
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-all duration-200"
                  >
                    <EyeIcon className="w-3 h-3" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>

              {/* Additional Information */}
              <div className="border-t border-slate-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-700">Service:</span>
                    <span className="text-slate-600 ml-2">{ticket.service}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Category:</span>
                    <span className="text-slate-600 ml-2">{ticket.category}</span>
                  </div>
                  {ticket.estimatedResolution && (
                    <div>
                      <span className="font-medium text-slate-700">Est. Resolution:</span>
                      <span className="text-slate-600 ml-2">{formatDate(ticket.estimatedResolution)}</span>
                    </div>
                  )}
                </div>

                {ticket.resolutionNotes && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900 text-sm mb-1">Resolution Notes:</p>
                    <p className="text-green-800 text-sm">{ticket.resolutionNotes}</p>
                    {ticket.customerSatisfaction && (
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-sm text-green-800">Your rating:</span>
                        <div className="flex">
                          {renderStars(ticket.customerSatisfaction)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">{selectedTicket.subject}</h2>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-1">{selectedTicket.ticketNumber}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-slate-700">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Priority:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Service:</span>
                  <span className="text-slate-600 ml-2">{selectedTicket.service}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Category:</span>
                  <span className="text-slate-600 ml-2">{selectedTicket.category}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Created:</span>
                  <span className="text-slate-600 ml-2">{formatDate(selectedTicket.createdAt)}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Last Updated:</span>
                  <span className="text-slate-600 ml-2">{formatDate(selectedTicket.updatedAt)}</span>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-slate-700 mb-2">Description</h3>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">{selectedTicket.description}</p>
              </div>

              {selectedTicket.assignedToName && (
                <div>
                  <h3 className="font-medium text-slate-700 mb-2">Assigned To</h3>
                  <p className="text-slate-600">{selectedTicket.assignedToName}</p>
                </div>
              )}

              {selectedTicket.estimatedResolution && (
                <div>
                  <h3 className="font-medium text-slate-700 mb-2">Estimated Resolution</h3>
                  <p className="text-slate-600">{formatDate(selectedTicket.estimatedResolution)}</p>
                </div>
              )}

              {selectedTicket.resolutionNotes && (
                <div>
                  <h3 className="font-medium text-slate-700 mb-2">Resolution Notes</h3>
                  <p className="text-slate-600 bg-green-50 p-3 rounded-lg">{selectedTicket.resolutionNotes}</p>
                  {selectedTicket.customerSatisfaction && (
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-sm text-slate-700">Your rating:</span>
                      <div className="flex">
                        {renderStars(selectedTicket.customerSatisfaction)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200">
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerTicketTracking;