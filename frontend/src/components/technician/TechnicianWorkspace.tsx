// TechnicianWorkspace.tsx
// Modern inbox-style technician workspace following 2025 UI/UX trends
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme, themeClasses } from '../../context/ThemeContext';
import { ticketsService, categoriesService, serviceCatalogService } from '../../services';
import { Ticket as TicketType, Category } from '../../types';
import { ServiceCategory } from '../../services/serviceCatalog';
import ThemeToggle from '../common/ThemeToggle';
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
  FunnelIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { 
  ExclamationTriangleIcon as ExclamationTriangleIconSolid 
} from '@heroicons/react/24/solid';

interface TicketWithSelection extends TicketType {
  selected?: boolean;
  read?: boolean;
}

const TechnicianWorkspace: React.FC = () => {
  const [tickets, setTickets] = useState<TicketWithSelection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token, isLoading: authIsLoading } = useAuth();
  
  // Inbox-style state management
  const [selectedTickets, setSelectedTickets] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'assigned' | 'inProgress' | 'pending' | 'departmentQueue' | 'resolved' | 'closed' | 'allDepartment'>('assigned');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Catalog filtering state
  const [showCatalogFilters, setShowCatalogFilters] = useState(false);
  const [activeCatalogFilter, setActiveCatalogFilter] = useState<'all' | number>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  
  // Category filter tags state
  const [activeCategoryTags, setActiveCategoryTags] = useState<Set<string>>(new Set());
  const [categoryTagCounts, setCategoryTagCounts] = useState<Record<string, number>>({});

  // Modern filtering counts
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
  
  // Load catalog data for filtering
  const loadCatalogData = useCallback(async () => {
    try {
      const [categoriesData, serviceCategoriesData] = await Promise.all([
        categoriesService.getCategories(),
        serviceCatalogService.getCategories()
      ]);
      setCategories(categoriesData);
      setServiceCategories(serviceCategoriesData);
    } catch (error) {
      console.error('Failed to load catalog data:', error);
    }
  }, []);
  
  useEffect(() => {
    loadCatalogData();
  }, [loadCatalogData]);
  
  // Close catalog filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCatalogFilters) {
        setShowCatalogFilters(false);
      }
    };
    
    if (showCatalogFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCatalogFilters]);

  const isAuthenticated = !!user;
  const isTechnician = user?.role === 'technician';

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

  // Fetch tickets with inbox-style filtering
  const fetchTickets = useCallback(async (showRefresh = false) => {
    if (authIsLoading || !isAuthenticated || !isTechnician || !token) return;
    
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
      
      // Apply catalog filter if active
      if (activeCatalogFilter !== 'all') {
        filters.categoryId = activeCatalogFilter as number;
      }

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
            // For service catalog items, use the same logic as the extraction
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
            // For legacy categories
            categoryName = ticket.item.subCategory.category.name;
          }
          
          return categoryName && activeCategoryTags.has(categoryName);
        });
      }

      setTickets(enhancedTickets);
      
      // Extract category tags and counts from tickets
      const categoryTagsMap: Record<string, number> = {};
      enhancedTickets.forEach((ticket) => {
        // Get category name from service catalog or legacy category
        let categoryName = '';
        
        if (ticket.serviceItem?.name) {
          // For service catalog items, use the service item name as category
          // Extract category name from service item or use a simplified name
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
          // For legacy categories
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
  }, [authIsLoading, isAuthenticated, isTechnician, token, activeFilter, searchTerm, selectedTickets, activeCatalogFilter, activeCategoryTags]);

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

  // Category tag functions
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
    setSelectAll(newSelection.size === tickets.length);
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
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, read: true } : t));
  };

  // Bulk actions
  const handleBulkAction = async (action: 'markRead' | 'assign' | 'priority' | 'pickup') => {
    if (selectedTickets.size === 0) return;
    
    try {
      if (action === 'markRead') {
        selectedTickets.forEach(ticketId => {
          localStorage.setItem(`ticket_read_${ticketId}`, 'true');
        });
        setTickets(prev => prev.map(t => 
          selectedTickets.has(t.id) ? { ...t, read: true } : t
        ));
      } else if (action === 'pickup') {
        for (const ticketId of Array.from(selectedTickets)) {
          await ticketsService.updateTicket(ticketId, {
            assignedToUserId: user?.id,
            status: 'assigned'
          });
        }
        fetchTickets(true);
      }
      
      setSelectedTickets(new Set());
      setSelectAll(false);
    } catch (error) {
      console.error('Bulk action failed:', error);
      setError('Bulk action failed. Please try again.');
    }
  };

  if (authIsLoading || loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${themeClasses.background.secondary} transition-colors duration-300`}>
        <div className="text-center space-y-4 animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className={themeClasses.text.secondary}>Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isTechnician) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${themeClasses.background.secondary} transition-colors duration-300`}>
        <div className="text-center py-12 animate-fade-in">
          <UserCircleIcon className={`w-16 h-16 mx-auto mb-4 ${themeClasses.text.tertiary}`} />
          <h3 className={`text-lg font-semibold mb-2 ${themeClasses.text.primary}`}>Technician Access Required</h3>
          <p className={themeClasses.text.secondary}>This workspace is only available for technician users.</p>
        </div>
      </div>
    );
  }

  // Filter tabs data
  const filterTabs = [
    { key: 'assigned', label: 'Assigned to Me', count: ticketCounts.assigned, icon: CheckIcon },
    { key: 'inProgress', label: 'In Progress', count: ticketCounts.inProgress, icon: ArrowPathIcon },
    { key: 'pending', label: 'Pending', count: ticketCounts.pending, icon: ClockIcon },
    { key: 'departmentQueue', label: 'Available Queue', count: ticketCounts.departmentQueue, icon: QueueListIcon },
    { key: 'allDepartment', label: 'All Department', count: ticketCounts.allDepartment, icon: UsersIcon },
    { key: 'resolved', label: 'Resolved', count: ticketCounts.resolved, icon: CheckCircleIcon },
    { key: 'closed', label: 'Closed', count: ticketCounts.closed, icon: XCircleIcon },
  ];

  return (
    <div className={`h-screen flex flex-col transition-colors duration-300 ${themeClasses.background.primary}`}>
      {/* Unified Workspace Header */}
      <div className={`${themeClasses.glass.primary} border-b ${themeClasses.border.primary} animate-slide-down`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <InboxIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${themeClasses.text.primary}`}>Technician Workspace</h1>
                <p className={`text-sm ${themeClasses.text.secondary}`}>
                  {user?.department?.name || 'Information Technology'} Department
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle compact />
              <button
                onClick={() => fetchTickets(true)}
                disabled={refreshing}
                className={`
                  p-2 rounded-lg transition-all duration-200 shadow-soft hover:shadow-medium
                  ${themeClasses.text.secondary} hover:${themeClasses.text.primary} ${themeClasses.interactive.hover}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                title="Refresh tickets"
              >
                <ArrowPathIcon className={`w-5 h-5 transition-transform duration-200 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.text.tertiary}`} />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`
                pl-10 pr-4 py-3 rounded-lg w-full transition-all duration-200
                ${themeClasses.background.secondary} ${themeClasses.border.primary} ${themeClasses.text.primary}
                border focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                focus:border-transparent shadow-soft focus:shadow-medium
                placeholder:${themeClasses.text.tertiary}
              `}
            />
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-1 overflow-x-auto flex-1">
              {/* Priority Alerts */}
              {(ticketCounts.urgent > 0 || ticketCounts.overdue > 0) && (
                <div className="flex items-center space-x-2 mr-4 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <BellIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {ticketCounts.urgent > 0 && `${ticketCounts.urgent} Urgent`}
                    {ticketCounts.urgent > 0 && ticketCounts.overdue > 0 && ' • '}
                    {ticketCounts.overdue > 0 && `${ticketCounts.overdue} Overdue`}
                  </span>
                </div>
              )}
              
              {/* Filter Tabs */}
              {filterTabs.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key as any)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    whitespace-nowrap flex-shrink-0 shadow-soft hover:shadow-medium
                    ${activeFilter === filter.key
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : `${themeClasses.background.secondary} ${themeClasses.text.primary} ${themeClasses.interactive.hover} border border-transparent`
                    }
                  `}
                >
                  <filter.icon className="w-4 h-4" />
                  <span>{filter.label}</span>
                  {filter.count > 0 && (
                    <span className={`
                      px-2 py-0.5 text-xs rounded-full transition-all duration-200
                      ${activeFilter === filter.key 
                        ? 'bg-blue-200 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200' 
                        : `${themeClasses.background.tertiary} ${themeClasses.text.secondary}`
                      }
                    `}>
                      {filter.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
            
            {/* Catalog Filter Button */}
            <div className="relative ml-4">
              <button
                onClick={() => setShowCatalogFilters(!showCatalogFilters)}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  border shadow-soft hover:shadow-medium whitespace-nowrap
                  ${showCatalogFilters 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                    : `${themeClasses.background.secondary} ${themeClasses.text.primary} ${themeClasses.interactive.hover} ${themeClasses.border.primary}`
                  }
                `}
              >
                <FunnelIcon className="w-4 h-4" />
                <span>Catalog</span>
                {activeCatalogFilter !== 'all' && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-200 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200">
                    1
                  </span>
                )}
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${showCatalogFilters ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Catalog Dropdown */}
              {showCatalogFilters && (
                <div className={`
                  absolute top-full right-0 mt-1 w-64 rounded-lg shadow-lg border z-10
                  ${themeClasses.background.primary} ${themeClasses.border.primary}
                `}>
                  <div className="p-2 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => {
                        setActiveCatalogFilter('all');
                        setShowCatalogFilters(false);
                      }}
                      className={`
                        w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200
                        ${activeCatalogFilter === 'all'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : `${themeClasses.text.primary} ${themeClasses.interactive.hover}`
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span>All Categories</span>
                        {activeCatalogFilter === 'all' && <CheckIcon className="w-4 h-4" />}
                      </div>
                    </button>
                    
                    {categories.length > 0 && (
                      <>
                        <div className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide ${themeClasses.text.tertiary} border-t ${themeClasses.border.primary} mt-2 pt-2`}>
                          Legacy Categories
                        </div>
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => {
                              setActiveCatalogFilter(category.id);
                              setShowCatalogFilters(false);
                            }}
                            className={`
                              w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200
                              ${activeCatalogFilter === category.id
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                : `${themeClasses.text.primary} ${themeClasses.interactive.hover}`
                              }
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <span>{category.name}</span>
                              {activeCatalogFilter === category.id && <CheckIcon className="w-4 h-4" />}
                            </div>
                          </button>
                        ))}
                      </>
                    )}
                    
                    {serviceCategories.length > 0 && (
                      <>
                        <div className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide ${themeClasses.text.tertiary} border-t ${themeClasses.border.primary} mt-2 pt-2`}>
                          Service Catalog
                        </div>
                        {serviceCategories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => {
                              setActiveCatalogFilter(Number(category.id));
                              setShowCatalogFilters(false);
                            }}
                            className={`
                              w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200
                              ${activeCatalogFilter === Number(category.id)
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                : `${themeClasses.text.primary} ${themeClasses.interactive.hover}`
                              }
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{category.name}</div>
                                {category.serviceCount > 0 && (
                                  <div className={`text-xs ${themeClasses.text.tertiary}`}>
                                    {category.serviceCount} services
                                  </div>
                                )}
                              </div>
                              {activeCatalogFilter === Number(category.id) && <CheckIcon className="w-4 h-4" />}
                            </div>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        {!sidebarCollapsed && (
          <div className={`w-80 ${themeClasses.background.secondary} border-r ${themeClasses.border.primary}`}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-sm font-semibold ${themeClasses.text.primary}`}>Quick Actions</h3>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className={`p-1 rounded-md ${themeClasses.interactive.hover}`}
                >
                  <XCircleIcon className={`w-4 h-4 ${themeClasses.text.secondary}`} />
                </button>
              </div>
              
              {selectedTickets.size > 0 && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">
                    {selectedTickets.size} tickets selected
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleBulkAction('markRead')}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                    >
                      Mark as Read
                    </button>
                    
                    {activeFilter === 'departmentQueue' && (
                      <button
                        onClick={() => handleBulkAction('pickup')}
                        className="w-full px-3 py-2 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-all duration-200"
                      >
                        Pick Up Tickets
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              <div className={`p-4 rounded-lg ${themeClasses.background.primary} border ${themeClasses.border.primary}`}>
                <h4 className={`text-sm font-medium ${themeClasses.text.primary} mb-2`}>Current View</h4>
                <p className={`text-xs ${themeClasses.text.secondary} mb-2`}>
                  {activeFilter === 'assigned' && 'Tickets assigned specifically to you'}
                  {activeFilter === 'inProgress' && 'Tickets you are currently working on'}
                  {activeFilter === 'pending' && 'Tickets waiting for your response'}
                  {activeFilter === 'departmentQueue' && 'Unassigned tickets available for pickup'}
                  {activeFilter === 'allDepartment' && 'All tickets in your department'}
                  {activeFilter === 'resolved' && 'Recently resolved tickets for reference'}
                  {activeFilter === 'closed' && 'Closed tickets for learning and reference'}
                </p>
                <div className={`text-xs ${themeClasses.text.tertiary}`}>
                  Showing {tickets.length} tickets
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed Sidebar Toggle */}
        {sidebarCollapsed && (
          <div className="flex-shrink-0">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className={`
                w-12 h-12 m-4 rounded-lg transition-all duration-200 shadow-soft hover:shadow-medium
                ${themeClasses.background.secondary} ${themeClasses.text.secondary} hover:${themeClasses.text.primary} 
                ${themeClasses.interactive.hover} border ${themeClasses.border.primary}
                flex items-center justify-center
              `}
              title="Show sidebar"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Ticket List */}
        <div className="flex-1 flex flex-col">
          <div className={`px-6 py-4 border-b ${themeClasses.border.primary} ${themeClasses.background.secondary}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
                  {activeFilter === 'assigned' && 'Assigned to Me'}
                  {activeFilter === 'inProgress' && 'In Progress'}
                  {activeFilter === 'pending' && 'Pending'}
                  {activeFilter === 'departmentQueue' && 'Available Queue'}
                  {activeFilter === 'allDepartment' && 'All Department'}
                  {activeFilter === 'resolved' && 'Resolved'}
                  {activeFilter === 'closed' && 'Closed'}
                </h3>
                <span className={`px-3 py-1 text-sm rounded-full ${themeClasses.background.tertiary} ${themeClasses.text.secondary}`}>
                  {tickets.length} tickets
                </span>
              </div>
              
              {selectedTickets.size > 0 && (
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${themeClasses.text.secondary}`}>{selectedTickets.size} selected</span>
                  <button
                    onClick={() => handleBulkAction('markRead')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${themeClasses.background.tertiary} ${themeClasses.text.primary}`}
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
          </div>

          {/* Category Filter Tags */}
          {Object.keys(categoryTagCounts).length > 0 && (
            <div className={`px-6 py-3 border-b ${themeClasses.border.primary} ${themeClasses.background.secondary}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`text-sm font-medium ${themeClasses.text.primary}`}>Filter by Category</h4>
                {activeCategoryTags.size > 0 && (
                  <button
                    onClick={clearAllCategoryTags}
                    className={`text-xs ${themeClasses.text.secondary} hover:${themeClasses.text.primary} transition-colors`}
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(categoryTagCounts)
                  .sort(([,a], [,b]) => b - a) // Sort by count descending
                  .map(([categoryName, count]) => {
                    const isActive = activeCategoryTags.has(categoryName);
                    return (
                      <button
                        key={categoryName}
                        onClick={() => toggleCategoryTag(categoryName)}
                        className={`
                          inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                          border shadow-soft hover:shadow-medium
                          ${isActive
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            : `${themeClasses.background.primary} ${themeClasses.text.secondary} ${themeClasses.border.primary} hover:${themeClasses.text.primary} ${themeClasses.interactive.hover}`
                          }
                        `}
                      >
                        <TagIcon className="w-3 h-3 mr-1" />
                        <span>{categoryName}</span>
                        <span className={`
                          ml-1.5 px-1.5 py-0.5 text-xs rounded-full
                          ${isActive 
                            ? 'bg-blue-200 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200' 
                            : `${themeClasses.background.tertiary} ${themeClasses.text.tertiary}`
                          }
                        `}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

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
              <div className="h-full overflow-y-auto">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-2 flex items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Select all</span>
                  </label>
                </div>

                <div className="divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`flex items-center px-6 py-4 hover:bg-gray-50 transition-colors ${
                        !ticket.read ? 'bg-blue-50/30' : ''
                      } ${selectedTickets.has(ticket.id) ? 'bg-blue-50' : ''}`}
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
                                  !ticket.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                                }`}>
                                  {ticket.title}
                                </h3>
                                <span className="text-xs text-gray-500 flex-shrink-0">#{ticket.id}</span>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <UserCircleIcon className="w-3 h-3" />
                                  <span>{ticket.createdBy?.name || ticket.createdBy?.username || 'Unknown'}</span>
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                  <TagIcon className="w-3 h-3" />
                                  <span>{ticket.serviceItem?.name || ticket.item?.name || 'Uncategorized'}</span>
                                </div>
                                
                                {(ticket.item?.subCategory?.category || ticket.serviceItem) && (
                                  <div className={`px-2 py-0.5 text-xs rounded-full ${
                                    ticket.item?.subCategory?.category 
                                      ? 'bg-purple-100 text-purple-700'
                                      : 'bg-green-100 text-green-700'
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
                              
                              <p className="text-xs text-gray-600 truncate mt-1">
                                {ticket.description}
                              </p>
                            </div>
                            
                            <div className="flex-shrink-0 ml-4 text-right">
                              <div className="text-xs text-gray-500 mb-1">
                                {formatTimeAgo(ticket.createdAt)}
                              </div>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                ticket.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                                ticket.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                                ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianWorkspace;