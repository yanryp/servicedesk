// TechnicianWorkspace.tsx
// Modern sidebar-first technician workspace inspired by Zendesk/Jira/ServiceNow
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ticketsService, serviceCatalogService } from '../../services';
import { Ticket as TicketType } from '../../types';
import { ServiceCategory } from '../../services/serviceCatalog';
import ThemeToggle from '../common/ThemeToggle';
import ViewToggle, { ViewMode } from '../ui/ViewToggle';
import TicketTableView from '../tickets/TicketTableView';
import TicketKanbanView from '../tickets/TicketKanbanView';
import { ColumnConfig } from '../ui/ColumnVisibilityControl';
import ColumnVisibilityControl from '../ui/ColumnVisibilityControl';
import { 
  InboxIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  Bars3Icon,
  UserCircleIcon,
  TagIcon,
  BellIcon,
  QueueListIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FolderIcon,
  ArchiveBoxIcon,
  RectangleStackIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { 
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/solid';

interface TicketWithSelection extends TicketType {
  selected?: boolean;
  read?: boolean;
}

interface QueueView {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
  count: number;
  description: string;
}

const TechnicianWorkspace: React.FC = () => {
  const [tickets, setTickets] = useState<TicketWithSelection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token, isLoading: authIsLoading } = useAuth();
  
  // Sidebar and filtering state
  const [selectedTickets, setSelectedTickets] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'assigned' | 'inProgress' | 'pending' | 'departmentQueue' | 'resolved' | 'closed' | 'allDepartment'>('assigned');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('inbox');
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: 'checkbox', label: '', width: 50, visible: true, sortable: false, filterable: false, required: true, group: 'core' },
    { key: 'id', label: 'ID', width: 80, visible: true, sortable: true, filterable: true, required: true, group: 'core' },
    { key: 'title', label: 'Title', width: 300, visible: true, sortable: true, filterable: true, required: true, group: 'core' },
    { key: 'requester', label: 'Requester', width: 150, visible: true, sortable: true, filterable: true, group: 'user' },
    { key: 'status', label: 'Status', width: 120, visible: true, sortable: true, filterable: true, group: 'status' },
    { key: 'priority', label: 'Priority', width: 100, visible: true, sortable: true, filterable: true, group: 'status' },
    { key: 'service', label: 'Service', width: 200, visible: true, sortable: true, filterable: true, group: 'meta' },
    { key: 'assignedTo', label: 'Assigned To', width: 150, visible: true, sortable: true, filterable: true, group: 'user' },
    { key: 'createdDate', label: 'Created', width: 130, visible: true, sortable: true, filterable: false, group: 'dates' },
    { key: 'dueDate', label: 'Due Date', width: 130, visible: true, sortable: true, filterable: false, group: 'dates' },
    { key: 'branch', label: 'Branch', width: 120, visible: false, sortable: true, filterable: true, group: 'meta' },
    { key: 'department', label: 'Supporting Group', width: 130, visible: false, sortable: true, filterable: true, group: 'meta' },
    { key: 'attachments', label: 'Files', width: 80, visible: false, sortable: false, filterable: false, group: 'meta' }
  ]);
  
  // Category filtering state - now for sidebar sections
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['status']));
  const [activeCategoryTags, setActiveCategoryTags] = useState<Set<string>>(new Set());
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [categoryTagCounts, setCategoryTagCounts] = useState<Record<string, number>>({});

  // Ticket counts for queue views
  const [ticketCounts, setTicketCounts] = useState({
    assigned: 0,
    inProgress: 0,
    pending: 0,
    departmentQueue: 0,
    resolved: 0,
    closed: 0,
    allDepartment: 0,
    urgent: 0,
    overdue: 0
  });

  // Queue views configuration
  const queueViews: QueueView[] = [
    {
      key: 'assigned',
      label: 'Assigned to Me',
      icon: UserCircleIcon,
      count: ticketCounts.assigned,
      description: 'Tickets assigned specifically to you'
    },
    {
      key: 'inProgress',
      label: 'In Progress',
      icon: ClockIcon,
      count: ticketCounts.inProgress,
      description: 'Tickets you are currently working on'
    },
    {
      key: 'pending',
      label: 'Pending',
      icon: ExclamationTriangleIcon,
      count: ticketCounts.pending,
      description: 'Tickets waiting for your response'
    },
    {
      key: 'departmentQueue',
      label: 'Available Queue',
      icon: QueueListIcon,
      count: ticketCounts.departmentQueue,
      description: 'Unassigned tickets available for pickup'
    },
    {
      key: 'allDepartment',
      label: 'All Department',
      icon: UsersIcon,
      count: ticketCounts.allDepartment,
      description: 'All tickets in your department'
    },
    {
      key: 'resolved',
      label: 'Resolved',
      icon: CheckCircleIcon,
      count: ticketCounts.resolved,
      description: 'Recently resolved tickets for reference'
    },
    {
      key: 'closed',
      label: 'Closed',
      icon: ArchiveBoxIcon,
      count: ticketCounts.closed,
      description: 'Closed tickets for learning and reference'
    }
  ];

  // Load catalog data for filtering
  const loadCatalogData = useCallback(async () => {
    try {
      const serviceCategoriesData = await serviceCatalogService.getCategories();
      setServiceCategories(serviceCategoriesData);
    } catch (error) {
      console.error('Failed to load catalog data:', error);
    }
  }, []);
  
  useEffect(() => {
    loadCatalogData();
  }, [loadCatalogData]);

  const isAuthenticated = !!user;
  const isTechnician = user?.role === 'technician';
  const canAccessWorkspace = user?.role === 'technician' || user?.role === 'manager' || user?.role === 'admin';

  // Calculate comprehensive ticket counts for department
  const calculateTicketCounts = async (departmentId?: number) => {
    if (!departmentId || !token) {
      return {
        assigned: 0, inProgress: 0, pending: 0, 
        departmentQueue: 0, resolved: 0, closed: 0, 
        allDepartment: 0, urgent: 0, overdue: 0
      };
    }

    try {
      const [
        assignedResponse,
        inProgressResponse, 
        pendingResponse,
        queueResponse,
        resolvedResponse,
        closedResponse,
        allDeptResponse
      ] = await Promise.all([
        ticketsService.getTickets({ status: 'assigned', assignedToMe: true, limit: 1 }),
        ticketsService.getTickets({ status: 'in_progress', assignedToMe: true, limit: 1 }),
        ticketsService.getTickets({ status: 'pending', assignedToMe: true, limit: 1 }),
        ticketsService.getTickets({ status: 'approved', departmentId, unassigned: true, limit: 1 }),
        ticketsService.getTickets({ status: 'resolved', departmentId, limit: 1 }),
        ticketsService.getTickets({ status: 'closed', departmentId, limit: 1 }),
        ticketsService.getTickets({ departmentId, limit: 1 })
      ]);

      return {
        assigned: assignedResponse.totalTickets || 0,
        inProgress: inProgressResponse.totalTickets || 0,
        pending: pendingResponse.totalTickets || 0,
        departmentQueue: queueResponse.totalTickets || 0,
        resolved: resolvedResponse.totalTickets || 0,
        closed: closedResponse.totalTickets || 0,
        allDepartment: allDeptResponse.totalTickets || 0,
        urgent: 0,
        overdue: 0
      };
    } catch (error) {
      console.error('Failed to calculate ticket counts:', error);
      return {
        assigned: 0, inProgress: 0, pending: 0,
        departmentQueue: 0, resolved: 0, closed: 0,
        allDepartment: 0, urgent: 0, overdue: 0
      };
    }
  };

  // Fetch tickets with new filtering approach
  const fetchTickets = useCallback(async (showRefresh = false) => {
    if (authIsLoading || !isAuthenticated || !canAccessWorkspace || !token) return;
    
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const filters: any = {
        page: 1,
        limit: 50,
      };

      // Apply active filter with department-level visibility
      switch (activeFilter) {
        case 'assigned':
          filters.status = 'assigned';
          filters.assignedToMe = true;
          break;
        case 'inProgress':
          filters.status = 'in_progress';
          filters.assignedToMe = true;
          break;
        case 'pending':
          filters.status = 'pending';
          filters.assignedToMe = true;
          break;
        case 'departmentQueue':
          filters.status = 'approved';
          filters.departmentId = user?.departmentId;
          filters.unassigned = true;
          break;
        case 'resolved':
          filters.status = 'resolved';
          filters.departmentId = user?.departmentId;
          break;
        case 'closed':
          filters.status = 'closed';
          filters.departmentId = user?.departmentId;
          break;
        case 'allDepartment':
          filters.departmentId = user?.departmentId;
          break;
      }

      if (searchTerm) filters.search = searchTerm;

      const response = await ticketsService.getTickets(filters);
      
      // Add inbox-style metadata to tickets
      let enhancedTickets = response.tickets.map((ticket: TicketType) => ({
        ...ticket,
        selected: selectedTickets.has(ticket.id),
        read: localStorage.getItem(`ticket_read_${ticket.id}`) === 'true'
      }));

      // Apply category tag filtering
      if (activeCategoryTags.size > 0) {
        enhancedTickets = enhancedTickets.filter((ticket) => {
          let categoryName = '';
          
          if (ticket.serviceItem?.name) {
            const serviceName = ticket.serviceItem.name;
            if (serviceName.toLowerCase().includes('kasda')) {
              categoryName = 'KASDA Services';
            } else if (serviceName.toLowerCase().includes('user')) {
              categoryName = 'User Management';
            } else if (serviceName.toLowerCase().includes('core') || serviceName.toLowerCase().includes('banking')) {
              categoryName = 'Core Banking';
            } else if (serviceName.toLowerCase().includes('network') || serviceName.toLowerCase().includes('it')) {
              categoryName = 'IT Services';
            } else if (serviceName.toLowerCase().includes('hardware')) {
              categoryName = 'Hardware';
            } else if (serviceName.toLowerCase().includes('software')) {
              categoryName = 'Software';
            } else {
              categoryName = 'Service Catalog';
            }
          } else if (ticket.item?.subCategory?.category?.name) {
            categoryName = ticket.item.subCategory.category.name;
          }
          
          return categoryName && activeCategoryTags.has(categoryName);
        });
      }

      setTickets(enhancedTickets);
      
      // Extract category tags and counts from all tickets (not filtered ones)
      const allTickets = response.tickets.map((ticket: TicketType) => ({
        ...ticket,
        selected: selectedTickets.has(ticket.id),
        read: localStorage.getItem(`ticket_read_${ticket.id}`) === 'true'
      }));
      
      const categoryTagsMap: Record<string, number> = {};
      allTickets.forEach((ticket) => {
        let categoryName = '';
        
        if (ticket.serviceItem?.name) {
          const serviceName = ticket.serviceItem.name;
          if (serviceName.toLowerCase().includes('kasda')) {
            categoryName = 'KASDA Services';
          } else if (serviceName.toLowerCase().includes('user')) {
            categoryName = 'User Management';
          } else if (serviceName.toLowerCase().includes('core') || serviceName.toLowerCase().includes('banking')) {
            categoryName = 'Core Banking';
          } else if (serviceName.toLowerCase().includes('network') || serviceName.toLowerCase().includes('it')) {
            categoryName = 'IT Services';
          } else if (serviceName.toLowerCase().includes('hardware')) {
            categoryName = 'Hardware';
          } else if (serviceName.toLowerCase().includes('software')) {
            categoryName = 'Software';
          } else {
            categoryName = 'Service Catalog';
          }
        } else if (ticket.item?.subCategory?.category?.name) {
          categoryName = ticket.item.subCategory.category.name;
        }
        
        if (categoryName) {
          categoryTagsMap[categoryName] = (categoryTagsMap[categoryName] || 0) + 1;
        }
      });
      
      setCategoryTagCounts(categoryTagsMap);
      
      // Calculate counts for sidebar
      const counts = await calculateTicketCounts(user?.departmentId);
      
      // Add current view specific counts
      const currentCounts = enhancedTickets.reduce((acc, ticket) => {
        if (ticket.priority === 'urgent') acc.urgent++;
        if (isTicketOverdue(ticket)) acc.overdue++;
        return acc;
      }, { urgent: 0, overdue: 0 });
      
      setTicketCounts({
        ...counts,
        urgent: currentCounts.urgent,
        overdue: currentCounts.overdue
      });
      setError(null);
    } catch (err: any) {
      console.error('TechnicianWorkspace: Failed to fetch tickets:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch tickets.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authIsLoading, isAuthenticated, canAccessWorkspace, token, activeFilter, searchTerm, selectedTickets, activeCategoryTags]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTickets(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  // Utility functions
  const isTicketOverdue = (ticket: TicketType) => {
    return ticket.slaDueDate && 
           new Date(ticket.slaDueDate) < new Date() && 
           ticket.status !== 'closed';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <ExclamationTriangleIconSolid className="w-4 h-4 text-red-500" />;
      case 'high': return <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />;
      default: return null;
    }
  };

  const getSlaStatusColor = (ticket: TicketType) => {
    if (!ticket.slaDueDate) return 'text-gray-500';
    
    const now = new Date();
    const due = new Date(ticket.slaDueDate);
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) return 'text-red-600';
    if (diffHours < 2) return 'text-orange-600';
    if (diffHours < 8) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  // Sidebar interaction functions
  const toggleCategorySection = (sectionKey: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleCategoryTag = (categoryName: string) => {
    const newActiveTags = new Set(activeCategoryTags);
    if (newActiveTags.has(categoryName)) {
      newActiveTags.delete(categoryName);
    } else {
      newActiveTags.add(categoryName);
    }
    setActiveCategoryTags(newActiveTags);
  };

  const clearAllCategoryTags = () => {
    setActiveCategoryTags(new Set());
  };

  // Selection handlers
  const toggleTicketSelection = (ticketId: number) => {
    const newSelection = new Set(selectedTickets);
    if (newSelection.has(ticketId)) {
      newSelection.delete(ticketId);
    } else {
      newSelection.add(ticketId);
    }
    setSelectedTickets(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedTickets(new Set());
    } else {
      setSelectedTickets(new Set(tickets.map(t => t.id)));
    }
    setSelectAll(!selectAll);
  };

  const markTicketAsRead = (ticketId: number) => {
    localStorage.setItem(`ticket_read_${ticketId}`, 'true');
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId ? { ...ticket, read: true } : ticket
    ));
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on tickets:`, Array.from(selectedTickets));
    // Implement bulk actions here
  };

  // View mode handlers
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('technician_workspace_view_mode', mode);
  };

  const handleTicketSelect = (ticketId: number) => {
    toggleTicketSelection(ticketId);
  };

  const handleSelectAll = () => {
    toggleSelectAll();
  };

  const handleSort = (field: string) => {
    // Implement sorting logic here
    console.log('Sort by:', field);
  };

  const handleFilterChange = (filters: any) => {
    // Implement filter change logic here
    console.log('Filter change:', filters);
  };

  const handleTicketStatusUpdate = (ticketId: number, newStatus: any) => {
    // Implement status update logic here
    console.log('Update ticket status:', ticketId, newStatus);
  };

  const handleColumnVisibilityChange = (newColumns: ColumnConfig[]) => {
    setColumns(newColumns);
    localStorage.setItem('technician_workspace_columns', JSON.stringify(newColumns));
  };

  // Load saved view mode and columns from localStorage
  React.useEffect(() => {
    const savedViewMode = localStorage.getItem('technician_workspace_view_mode') as ViewMode;
    // Only load saved view mode if it's explicitly set, otherwise default to inbox
    if (savedViewMode && ['inbox', 'table', 'kanban'].includes(savedViewMode)) {
      setViewMode(savedViewMode);
    } else {
      // Ensure inbox is the default and save it
      setViewMode('inbox');
      localStorage.setItem('technician_workspace_view_mode', 'inbox');
    }

    const savedColumns = localStorage.getItem('technician_workspace_columns');
    if (savedColumns) {
      try {
        const parsedColumns = JSON.parse(savedColumns);
        setColumns(parsedColumns);
      } catch (error) {
        console.error('Error parsing saved columns:', error);
      }
    }
  }, []);

  if (authIsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !canAccessWorkspace) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need to be logged in as a technician, manager, or admin to access this workspace.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-lg`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900">BSG Helpdesk</h2>
                <p className="text-sm text-gray-600">Support Portal</p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors`}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronDoubleRightIcon className="w-5 h-5" />
              ) : (
                <ChevronDoubleLeftIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Queue Views */}
        <div className="flex-1 overflow-y-auto">
          {!sidebarCollapsed && (
            <div className="p-4">
              {/* Priority Alerts */}
              {(ticketCounts.urgent > 0 || ticketCounts.overdue > 0) && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <BellIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      {ticketCounts.urgent > 0 && `${ticketCounts.urgent} Urgent`}
                      {ticketCounts.urgent > 0 && ticketCounts.overdue > 0 && ' • '}
                      {ticketCounts.overdue > 0 && `${ticketCounts.overdue} Overdue`}
                    </span>
                  </div>
                </div>
              )}

              {/* Status Queue Views */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-sm font-semibold text-gray-900`}>My Queues</h3>
                  <button
                    onClick={() => toggleCategorySection('status')}
                    className={`p-1 rounded hover:bg-gray-100`}
                  >
                    {expandedCategories.has('status') ? (
                      <ChevronDownIcon className={`w-4 h-4 text-gray-600`} />
                    ) : (
                      <ChevronRightIcon className={`w-4 h-4 text-gray-600`} />
                    )}
                  </button>
                </div>
                
                {expandedCategories.has('status') && (
                  <div className="space-y-1">
                    {queueViews.map((queue) => (
                      <button
                        key={queue.key}
                        onClick={() => setActiveFilter(queue.key as any)}
                        className={`
                          w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200
                          ${activeFilter === queue.key
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            : `bg-white text-gray-900 hover:bg-gray-100 border border-transparent`
                          }
                        `}
                        title={queue.description}
                      >
                        <div className="flex items-center space-x-3">
                          <queue.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{queue.label}</span>
                        </div>
                        {queue.count > 0 && (
                          <span className={`
                            px-2 py-0.5 text-xs rounded-full
                            ${activeFilter === queue.key 
                              ? 'bg-blue-200 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200' 
                              : `bg-gray-100 text-gray-600`
                            }
                          `}>
                            {queue.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Filters */}
              {Object.keys(categoryTagCounts).length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-sm font-semibold text-gray-900`}>Categories</h3>
                    <div className="flex items-center space-x-2">
                      {activeCategoryTags.size > 0 && (
                        <button
                          onClick={clearAllCategoryTags}
                          className={`text-xs text-gray-600 hover:text-gray-900 transition-colors`}
                        >
                          Clear
                        </button>
                      )}
                      <button
                        onClick={() => toggleCategorySection('categories')}
                        className={`p-1 rounded hover:bg-gray-100`}
                      >
                        {expandedCategories.has('categories') ? (
                          <ChevronDownIcon className={`w-4 h-4 text-gray-600`} />
                        ) : (
                          <ChevronRightIcon className={`w-4 h-4 text-gray-600`} />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {expandedCategories.has('categories') && (
                    <div className="space-y-1">
                      {Object.entries(categoryTagCounts)
                        .sort(([,a], [,b]) => b - a)
                        .map(([categoryName, count]) => {
                          const isActive = activeCategoryTags.has(categoryName);
                          return (
                            <button
                              key={categoryName}
                              onClick={() => toggleCategoryTag(categoryName)}
                              className={`
                                w-full flex items-center justify-between p-2 rounded-lg text-left transition-all duration-200
                                ${isActive
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                  : `bg-white text-gray-600 hover:bg-gray-100 border border-transparent hover:text-gray-900`
                                }
                              `}
                            >
                              <div className="flex items-center space-x-2">
                                <TagIcon className="w-3 h-3" />
                                <span className="text-sm">{categoryName}</span>
                              </div>
                              <span className={`
                                px-1.5 py-0.5 text-xs rounded-full
                                ${isActive 
                                  ? 'bg-blue-200 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200' 
                                  : `bg-gray-100 text-gray-500`
                                }
                              `}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Collapsed sidebar content */}
          {sidebarCollapsed && (
            <div className="p-2 space-y-2">
              {queueViews.slice(0, 4).map((queue) => (
                <button
                  key={queue.key}
                  onClick={() => setActiveFilter(queue.key as any)}
                  className={`
                    w-full p-3 rounded-lg transition-all duration-200 relative
                    ${activeFilter === queue.key
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : `text-gray-600 hover:bg-gray-100`
                    }
                  `}
                  title={`${queue.label} (${queue.count})`}
                >
                  <queue.icon className="w-5 h-5 mx-auto" />
                  {queue.count > 0 && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                      {queue.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {queueViews.find(q => q.key === activeFilter)?.label || 'Technician Workspace'}
                </h1>
                <p className="text-sm text-gray-600">
                  {user?.department?.name || 'Information Technology'} Department • {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View
                </p>
              </div>
              
              {/* Search Bar */}
              <div className="relative max-w-md flex-1">
                <MagnifyingGlassIcon className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500`} />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`
                    pl-10 pr-4 py-2 rounded-lg w-full transition-all duration-200
                    bg-white border-gray-200 text-gray-900
                    border focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                    focus:border-transparent
                    placeholder:text-gray-500
                  `}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Column Visibility Control for Table View */}
              {viewMode === 'table' && (
                <ColumnVisibilityControl
                  columns={columns}
                  onColumnVisibilityChange={handleColumnVisibilityChange}
                />
              )}
              
              {/* View Toggle */}
              <ViewToggle 
                currentView={viewMode}
                onViewChange={handleViewModeChange}
                showInbox={true}
                size="sm"
              />
              
              <ThemeToggle compact />
              <button
                onClick={() => fetchTickets(true)}
                disabled={refreshing}
                className={`
                  p-2 rounded-lg transition-all duration-200
                  text-gray-600 hover:text-gray-900 hover:bg-gray-100
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                title="Refresh tickets"
              >
                <ArrowPathIcon className={`w-5 h-5 transition-transform duration-200 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Ticket Content */}
        <div className="flex-1 overflow-hidden">
          {error ? (
            <div className="p-6 text-center">
              <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Tickets</h3>
              <p className="text-red-600">{error}</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center">
              <InboxIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Tickets Found</h3>
              <p className="text-gray-600">
                {activeFilter === 'assigned' 
                  ? "You don't have any assigned tickets right now."
                  : `No ${activeFilter} tickets found.`
                }
              </p>
            </div>
          ) : (
            <>
              {/* Render based on view mode */}
              {viewMode === 'inbox' && (
                <div className="h-full overflow-y-auto">
                  {/* Ticket Actions Bar for Inbox View */}
                  <div className={`bg-gray-50 dark:bg-gray-800 border-b border-gray-200 px-6 py-3 flex items-center justify-between`}>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-sm text-gray-600`}>
                        {selectedTickets.size > 0 ? `${selectedTickets.size} selected` : 'Select all'}
                      </span>
                    </label>
                    
                    {selectedTickets.size > 0 && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleBulkAction('markRead')}
                          className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 bg-gray-100 text-gray-900`}
                        >
                          Mark Read
                        </button>
                        
                        {activeFilter === 'departmentQueue' && (
                          <button
                            onClick={() => handleBulkAction('pickup')}
                            className="px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md"
                          >
                            Pick Up
                          </button>
                        )}
                      </div>
                    )}
                  </div>

              {/* Ticket List */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`flex items-center px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                      !ticket.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                    } ${selectedTickets.has(ticket.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  >
                    <div className="flex-shrink-0 mr-4">
                      <input
                        type="checkbox"
                        checked={selectedTickets.has(ticket.id)}
                        onChange={() => toggleTicketSelection(ticket.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex-shrink-0 mr-3">
                      {getPriorityIcon(ticket.priority)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        onClick={() => markTicketAsRead(ticket.id)}
                        className="block"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className={`text-sm truncate ${
                                !ticket.read ? `font-semibold text-gray-900` : `font-medium text-gray-600`
                              }`}>
                                {ticket.title}
                              </h3>
                              <span className={`text-xs text-gray-500 flex-shrink-0`}>#{ticket.id}</span>
                            </div>
                            
                            <div className={`flex items-center space-x-4 text-xs text-gray-500`}>
                              <div className="flex items-center space-x-1">
                                <UserCircleIcon className="w-3 h-3" />
                                <span>{ticket.createdBy?.name || ticket.createdBy?.username || 'Unknown'}</span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <FolderIcon className="w-3 h-3" />
                                <span>{ticket.serviceItem?.name || ticket.item?.name || 'Uncategorized'}</span>
                              </div>
                              
                              {(ticket.item?.subCategory?.category || ticket.serviceItem) && (
                                <div className={`px-2 py-0.5 text-xs rounded-full ${
                                  ticket.item?.subCategory?.category 
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                }`}>
                                  {ticket.item?.subCategory?.category?.name || 'Service Catalog'}
                                </div>
                              )}
                              
                              {ticket.slaDueDate && (
                                <div className={`flex items-center space-x-1 ${getSlaStatusColor(ticket)}`}>
                                  <ClockIcon className="w-3 h-3" />
                                  <span>Due {formatTimeAgo(ticket.slaDueDate)}</span>
                                </div>
                              )}
                            </div>
                            
                            <p className={`text-xs text-gray-600 truncate mt-1`}>
                              {ticket.description}
                            </p>
                          </div>
                          
                          <div className="flex-shrink-0 ml-4 text-right">
                            <div className={`text-xs text-gray-500 mb-1`}>
                              {formatTimeAgo(ticket.createdAt)}
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              ticket.status === 'assigned' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                              ticket.status === 'in_progress' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                              ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {ticket.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
                </div>
              )}

              {/* Table View */}
              {viewMode === 'table' && (
                <div className="h-full">
                  <TicketTableView
                    tickets={tickets}
                    loading={loading}
                    columns={columns}
                    selectedTickets={selectedTickets}
                    onTicketSelect={handleTicketSelect}
                    onSelectAll={handleSelectAll}
                    onSort={handleSort}
                    onFilterChange={handleFilterChange}
                    onBulkAction={handleBulkAction}
                    className="h-full"
                  />
                </div>
              )}

              {/* Kanban View */}
              {viewMode === 'kanban' && (
                <div className="h-full p-6">
                  <TicketKanbanView
                    tickets={tickets}
                    loading={loading}
                    onTicketStatusUpdate={handleTicketStatusUpdate}
                    className="h-full"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicianWorkspace;