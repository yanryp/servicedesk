import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { ticketsService } from '../services';
import { Ticket, TicketFilters, TicketStatus } from '../types';
import ViewToggle, { ViewMode } from '../components/ui/ViewToggle';
import ColumnVisibilityControl, { ColumnConfig } from '../components/ui/ColumnVisibilityControl';
import TicketTableView from '../components/tickets/TicketTableView';
import TicketKanbanView from '../components/tickets/TicketKanbanView';
import { LoadingSpinner } from '../components/ui';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const TechnicianTicketsPage: React.FC = () => {
  const { user, token, isLoading: authIsLoading } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedTickets, setSelectedTickets] = useState<Set<number>>(new Set());
  
  // Filtering and sorting
  const [filters, setFilters] = useState<TicketFilters>({
    page: 1,
    limit: 50,
    departmentId: user?.departmentId
  });
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);

  // Column configuration
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: 'checkbox', label: '', visible: true, required: true, group: 'core' },
    { key: 'id', label: 'ID', visible: true, required: true, sortable: true, group: 'core' },
    { key: 'title', label: 'Subject', visible: true, required: true, sortable: true, group: 'core' },
    { key: 'requester', label: 'Requester', visible: true, sortable: true, group: 'user' },
    { key: 'status', label: 'Status', visible: true, sortable: true, filterable: true, group: 'status' },
    { key: 'priority', label: 'Priority', visible: true, sortable: true, filterable: true, group: 'status' },
    { key: 'service', label: 'Service/Category', visible: false, filterable: true, group: 'meta' },
    { key: 'assignedTo', label: 'Assigned To', visible: true, sortable: true, filterable: true, group: 'user' },
    { key: 'createdDate', label: 'Created', visible: true, sortable: true, group: 'dates' },
    { key: 'dueDate', label: 'Due Date', visible: false, sortable: true, group: 'dates' },
    { key: 'attachments', label: 'Attachments', visible: false, group: 'meta' },
    { key: 'branch', label: 'Branch', visible: false, filterable: true, group: 'user' },
    { key: 'department', label: 'Supporting Group', visible: false, filterable: true, group: 'user' }
  ]);

  const isAuthenticated = !!user;
  const isTechnician = user?.role === 'technician' || user?.role === 'manager' || user?.role === 'admin';

  // Load tickets
  const fetchTickets = useCallback(async (showRefresh = false) => {
    if (authIsLoading || !isAuthenticated || !isTechnician || !token) return;
    
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const searchFilters: TicketFilters = {
        ...filters,
        search: filters.search || searchTerm || undefined,
        page: currentPage
      };

      // Add sorting parameters
      if (sortField) {
        searchFilters.sortBy = sortField;
        searchFilters.sortOrder = sortDirection;
      }

      // Remove undefined values
      Object.keys(searchFilters).forEach(key => {
        if (searchFilters[key as keyof TicketFilters] === undefined) {
          delete searchFilters[key as keyof TicketFilters];
        }
      });

      const response = await ticketsService.getTickets(searchFilters);
      setTickets(response.tickets || []);
      setTotalPages(response.totalPages || 1);
      setTotalTickets(response.totalTickets || 0);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch tickets:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch tickets.');
      setTickets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authIsLoading, isAuthenticated, isTechnician, token, filters, searchTerm, currentPage, sortField, sortDirection]);

  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!authIsLoading && isAuthenticated && isTechnician && token) {
        setCurrentPage(1); // Reset to first page when searching
        fetchTickets();
      }
    }, 500); // Increased debounce time for better performance

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Combined effect for filters, page, and sorting changes
  useEffect(() => {
    if (!authIsLoading && isAuthenticated && isTechnician && token) {
      fetchTickets();
    }
  }, [filters, currentPage, sortField, sortDirection, authIsLoading, isAuthenticated, isTechnician, token]);

  // Auto-refresh every 60 seconds (reduced frequency)
  useEffect(() => {
    if (!isAuthenticated || !isTechnician) return;
    
    const interval = setInterval(() => {
      if (!loading) { // Only refresh if not currently loading
        fetchTickets(true);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchTickets, loading, isAuthenticated, isTechnician]);

  // Handlers
  const handleViewChange = (view: ViewMode) => {
    setViewMode(view);
    setSelectedTickets(new Set()); // Clear selections when switching views
  };

  const handleColumnVisibilityChange = (newColumns: ColumnConfig[]) => {
    setColumns(newColumns);
    // Save to localStorage
    localStorage.setItem('technicianTicketsColumns', JSON.stringify(newColumns));
  };

  const handleTicketSelect = (ticketId: number) => {
    const newSelection = new Set(selectedTickets);
    if (newSelection.has(ticketId)) {
      newSelection.delete(ticketId);
    } else {
      newSelection.add(ticketId);
    }
    setSelectedTickets(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedTickets.size === tickets.length) {
      setSelectedTickets(new Set());
    } else {
      setSelectedTickets(new Set(tickets.map(t => t.id)));
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleFilterChange = (newFilters: Partial<TicketFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleTicketStatusUpdate = async (ticketId: number, newStatus: TicketStatus) => {
    try {
      await ticketsService.updateTicket(ticketId, { status: newStatus });
      // Refresh tickets to get updated data
      fetchTickets(true);
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  };

  const handleBulkAction = async (action: string, ticketIds: number[]) => {
    try {
      // Implement bulk actions based on action type
      switch (action) {
        case 'assign':
          // Open assignment modal or perform bulk assignment
          console.log('Bulk assign tickets:', ticketIds);
          break;
        case 'updateStatus':
          // Open status update modal
          console.log('Bulk update status:', ticketIds);
          break;
        case 'updatePriority':
          // Open priority update modal
          console.log('Bulk update priority:', ticketIds);
          break;
        default:
          console.warn('Unknown bulk action:', action);
      }
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    }
  };

  const handleExport = () => {
    // Implement export functionality
    const visibleColumnKeys = columns.filter(col => col.visible).map(col => col.key);
    console.log('Export tickets with columns:', visibleColumnKeys);
  };

  // Load saved column configuration
  useEffect(() => {
    const savedColumns = localStorage.getItem('technicianTicketsColumns');
    if (savedColumns) {
      try {
        const parsedColumns = JSON.parse(savedColumns);
        setColumns(parsedColumns);
      } catch (error) {
        console.error('Failed to parse saved columns:', error);
      }
    }
  }, []);

  if (authIsLoading) {
    return <LoadingSpinner size="lg" text="Loading..." className="min-h-[400px]" />;
  }

  if (!isAuthenticated || !isTechnician) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Access Denied</h3>
        <p className="text-gray-600">You need technician access to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
            <ClipboardDocumentListIcon className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Technician Workspace
        </h1>
        <p className="mt-2 text-gray-600">
          Manage and process support tickets for {user?.department?.name || 'your department'}
        </p>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Left Side - Search and Filters */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex items-center space-x-2">
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange({ status: e.target.value as TicketStatus || undefined })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={filters.priority || ''}
                onChange={(e) => handleFilterChange({ priority: e.target.value as any || undefined })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Right Side - View Controls */}
          <div className="flex items-center space-x-3">
            <ViewToggle
              currentView={viewMode}
              onViewChange={handleViewChange}
            />
            
            <div className="h-6 w-px bg-gray-300"></div>
            
            <ColumnVisibilityControl
              columns={columns}
              onColumnVisibilityChange={handleColumnVisibilityChange}
            />
            
            <button
              onClick={handleExport}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Export tickets"
            >
              <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
              Export
            </button>
            
            <button
              onClick={() => fetchTickets(true)}
              disabled={refreshing}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              title="Refresh tickets"
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing {tickets.length} of {totalTickets} tickets
              {selectedTickets.size > 0 && (
                <span className="ml-2 text-blue-600 font-medium">
                  ({selectedTickets.size} selected)
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span>Page {currentPage} of {totalPages}</span>
              {filters.status && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Status: {filters.status.replace('_', ' ')}
                </span>
              )}
              {filters.priority && (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                  Priority: {filters.priority}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Tickets</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => fetchTickets()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {viewMode === 'table' ? (
            <TicketTableView
              tickets={tickets}
              loading={loading}
              columns={columns}
              selectedTickets={selectedTickets}
              sortField={sortField}
              sortDirection={sortDirection}
              filters={filters}
              onTicketSelect={handleTicketSelect}
              onSelectAll={handleSelectAll}
              onSort={handleSort}
              onFilterChange={handleFilterChange}
              onBulkAction={handleBulkAction}
            />
          ) : (
            <TicketKanbanView
              tickets={tickets}
              loading={loading}
              onTicketStatusUpdate={handleTicketStatusUpdate}
              onTicketClick={(ticket) => window.location.href = `/tickets/${ticket.id}`}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4 py-6">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TechnicianTicketsPage;