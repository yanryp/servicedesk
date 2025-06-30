import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  FunnelIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  ClockIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import {
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/solid';
import { StatusBadge, PriorityBadge } from '../ui';
import { Ticket, TicketFilters, TicketStatus } from '../../types';
import { ColumnConfig } from '../ui/ColumnVisibilityControl';

interface TicketTableViewProps {
  tickets: Ticket[];
  loading: boolean;
  columns: ColumnConfig[];
  selectedTickets: Set<number>;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: TicketFilters;
  onTicketSelect: (ticketId: number) => void;
  onSelectAll: () => void;
  onSort: (field: string) => void;
  onFilterChange: (filters: Partial<TicketFilters>) => void;
  onBulkAction?: (action: string, ticketIds: number[]) => void;
  className?: string;
}

const TicketTableView: React.FC<TicketTableViewProps> = ({
  tickets,
  loading,
  columns,
  selectedTickets,
  sortField,
  sortDirection,
  filters = {},
  onTicketSelect,
  onSelectAll,
  onSort,
  onFilterChange,
  onBulkAction,
  className = ''
}) => {
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState<{[key: string]: string}>({});
  
  const visibleColumns = useMemo(() => 
    columns.filter(col => col.visible).sort((a, b) => (a.group === 'core' ? -1 : 1))
  , [columns]);

  const formatTimeAgo = useCallback((date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  }, []);

  const getSlaStatusColor = useCallback((ticket: Ticket) => {
    if (!ticket.slaDueDate) return 'text-gray-500';
    
    const now = new Date();
    const due = new Date(ticket.slaDueDate);
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) return 'text-red-600';
    if (diffHours < 2) return 'text-orange-600';
    if (diffHours < 8) return 'text-yellow-600';
    return 'text-green-600';
  }, []);

  const getRowClasses = useCallback((ticket: Ticket) => {
    const baseClasses = 'hover:bg-gray-50 transition-colors cursor-pointer';
    const classes = [baseClasses];

    // Highlight overdue tickets
    if (ticket.slaDueDate && new Date(ticket.slaDueDate) < new Date() && ticket.status !== 'closed') {
      classes.push('border-l-4 border-red-400 bg-red-50/30');
    }
    // Highlight urgent priority
    else if (ticket.priority === 'urgent') {
      classes.push('border-l-4 border-red-400 bg-red-50/20');
    }
    // Highlight high priority
    else if (ticket.priority === 'high') {
      classes.push('border-l-4 border-orange-400 bg-orange-50/20');
    }
    // Highlight KASDA tickets
    else if (ticket.isKasdaTicket) {
      classes.push('border-l-2 border-green-400 bg-green-50/20');
    }
    // Highlight unassigned tickets
    else if (!ticket.assignedToUserId && ticket.status === 'approved') {
      classes.push('border-l-2 border-blue-400 bg-blue-50/20');
    }

    // Selected state
    if (selectedTickets.has(ticket.id)) {
      classes.push('bg-blue-100 border-blue-200');
    }

    return classes.join(' ');
  }, [selectedTickets]);

  // Memoize row classes to prevent recalculation on every render
  const ticketRowClasses = useMemo(() => {
    const classMap = new Map<number, string>();
    tickets.forEach(ticket => {
      classMap.set(ticket.id, getRowClasses(ticket));
    });
    return classMap;
  }, [tickets, selectedTickets, getRowClasses]);

  // Memoize formatted dates to prevent recalculation
  const formattedDates = useMemo(() => {
    const dateMap = new Map<string, string>();
    tickets.forEach(ticket => {
      dateMap.set(`${ticket.id}_created`, formatTimeAgo(ticket.createdAt));
      if (ticket.slaDueDate) {
        dateMap.set(`${ticket.id}_due`, formatTimeAgo(ticket.slaDueDate));
      }
    });
    return dateMap;
  }, [tickets, formatTimeAgo]);

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUpIcon className="w-4 h-4 ml-1" /> : 
      <ChevronDownIcon className="w-4 h-4 ml-1" />;
  };

  const handleColumnFilter = (column: string, value: string) => {
    const newFilters = { ...columnFilters };
    if (value) {
      newFilters[column] = value;
    } else {
      delete newFilters[column];
    }
    setColumnFilters(newFilters);
    
    // Apply the filter to the main filters
    const filterUpdate: Partial<TicketFilters> = {};
    let hasChanges = false;
    
    switch (column) {
      case 'status':
        filterUpdate.status = value as TicketStatus || undefined;
        hasChanges = true;
        break;
      case 'priority':
        filterUpdate.priority = value as any || undefined;
        hasChanges = true;
        break;
      case 'assignedTo':
        if (value === 'unassigned') {
          filterUpdate.unassigned = true;
          filterUpdate.assignedToUserId = undefined;
        } else {
          filterUpdate.assignedToUserId = value ? parseInt(value) : undefined;
          filterUpdate.unassigned = undefined;
        }
        hasChanges = true;
        break;
      case 'department':
        filterUpdate.departmentId = value ? parseInt(value) : undefined;
        hasChanges = true;
        break;
      case 'title':
      case 'requester':
      case 'service':
      case 'branch':
        // For text-based columns, use search functionality
        filterUpdate.search = value || undefined;
        hasChanges = true;
        break;
      default:
        // Other columns not implemented yet
        break;
    }
    
    // Only trigger filter change if there are actual changes
    if (hasChanges) {
      onFilterChange(filterUpdate);
    }
    
    // Only close dropdown for select-based filters
    const hasOptions = ['status', 'priority', 'assignedTo'].includes(column);
    if (hasOptions && value) {
      setActiveFilterColumn(null);
    }
  };

  const getFilterOptions = (column: ColumnConfig) => {
    switch (column.key) {
      case 'status':
        return [
          { value: '', label: 'All Status' },
          { value: 'open', label: 'Open' },
          { value: 'pending_approval', label: 'Pending Approval' },
          { value: 'approved', label: 'Approved' },
          { value: 'assigned', label: 'Assigned' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'pending', label: 'Pending' },
          { value: 'resolved', label: 'Resolved' },
          { value: 'closed', label: 'Closed' }
        ];
      case 'priority':
        return [
          { value: '', label: 'All Priority' },
          { value: 'urgent', label: 'Urgent' },
          { value: 'high', label: 'High' },
          { value: 'medium', label: 'Medium' },
          { value: 'low', label: 'Low' }
        ];
      case 'assignedTo':
        const uniqueAssignees = Array.from(new Set(tickets.filter(t => t.assignedTo).map(t => t.assignedTo!)));
        return [
          { value: '', label: 'All Assignees' },
          { value: 'unassigned', label: 'Unassigned' },
          ...uniqueAssignees.map(assignee => ({
            value: assignee.id.toString(),
            label: assignee.name || assignee.username
          }))
        ];
      default:
        return [];
    }
  };

  const renderFilterInput = (column: ColumnConfig) => {
    const hasOptions = ['status', 'priority', 'assignedTo'].includes(column.key);
    
    if (hasOptions) {
      // Use select for predefined options
      return (
        <select
          value={columnFilters[column.key] || ''}
          onChange={(e) => handleColumnFilter(column.key, e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        >
          {getFilterOptions(column).map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    } else {
      // Use input for text-based filtering
      return (
        <input
          type="text"
          value={columnFilters[column.key] || ''}
          onChange={(e) => handleColumnFilter(column.key, e.target.value)}
          placeholder={`Filter ${column.label.toLowerCase()}...`}
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      );
    }
  };

  const renderColumnHeader = (column: ColumnConfig) => {
    const isSortable = column.sortable !== false;
    const isFilterable = column.filterable !== false;
    const isFilterActive = activeFilterColumn === column.key;

    return (
      <th
        key={column.key}
        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200 relative ${
          isSortable ? 'cursor-pointer hover:bg-gray-100' : ''
        }`}
        style={{ width: column.width ? `${column.width}px` : 'auto' }}
        onClick={() => isSortable && !isFilterActive && onSort(column.key)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span>{column.label}</span>
            {isSortable && renderSortIcon(column.key)}
          </div>
          {isFilterable && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveFilterColumn(isFilterActive ? null : column.key);
                }}
                className={`ml-2 p-1 rounded transition-colors ${
                  isFilterActive || columnFilters[column.key] 
                    ? 'bg-blue-200 hover:bg-blue-300 text-blue-800' 
                    : 'hover:bg-gray-200'
                }`}
                title={`Filter by ${column.label}`}
              >
                <FunnelIcon className="w-3 h-3" />
              </button>
              
              {/* Filter Dropdown */}
              {isFilterActive && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    {renderFilterInput(column)}
                  </div>
                  <div className="border-t border-gray-200 p-2 flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        handleColumnFilter(column.key, '');
                      }}
                      className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setActiveFilterColumn(null)}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </th>
    );
  };

  const renderCellContent = (ticket: Ticket, column: ColumnConfig) => {
    switch (column.key) {
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={selectedTickets.has(ticket.id)}
            onChange={() => onTicketSelect(ticket.id)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
          />
        );
      
      case 'id':
        return (
          <div className="flex items-center">
            <Link
              to={`/tickets/${ticket.id}`}
              className="text-blue-600 hover:text-blue-900 font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              #{ticket.id}
            </Link>
          </div>
        );
      
      case 'title':
        return (
          <div className="max-w-xs">
            <div className="text-sm font-medium text-gray-900 truncate" title={ticket.title}>
              {ticket.title}
            </div>
            {ticket.description && (
              <div className="text-sm text-gray-500 truncate" title={ticket.description}>
                {ticket.description}
              </div>
            )}
          </div>
        );
      
      case 'requester':
        return (
          <div className="flex items-center">
            <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
            <div>
              <div className="text-sm font-medium text-gray-900">
                {ticket.createdBy?.name || ticket.createdBy?.username || 'Unknown'}
              </div>
              {ticket.createdBy?.unit && (
                <div className="text-xs text-gray-500">
                  {ticket.createdBy.unit.name}
                </div>
              )}
            </div>
          </div>
        );
      
      case 'status':
        return <StatusBadge status={ticket.status} size="sm" />;
      
      case 'priority':
        return (
          <div className="flex items-center">
            <PriorityBadge priority={ticket.priority} size="sm" />
            {ticket.priority === 'urgent' && (
              <ExclamationTriangleIconSolid className="w-4 h-4 text-red-500 ml-1" />
            )}
          </div>
        );
      
      case 'service':
        return (
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {ticket.serviceItem?.name || ticket.item?.name || 'Uncategorized'}
            </div>
            {(ticket.item?.subCategory?.category || ticket.serviceItem) && (
              <div className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                ticket.item?.subCategory?.category 
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {ticket.item?.subCategory?.category?.name || 'Service Catalog'}
              </div>
            )}
          </div>
        );
      
      case 'assignedTo':
        return ticket.assignedTo ? (
          <div className="flex items-center">
            <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
            <div>
              <div className="text-sm font-medium text-gray-900">
                {ticket.assignedTo.name || ticket.assignedTo.username}
              </div>
              {ticket.assignedTo.department && (
                <div className="text-xs text-gray-500">
                  {ticket.assignedTo.department.name}
                </div>
              )}
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-500 italic">Unassigned</span>
        );
      
      case 'createdDate':
        return (
          <div className="flex items-center">
            <CalendarDaysIcon className="w-4 h-4 text-gray-400 mr-2" />
            <div>
              <div className="text-sm text-gray-900">
                {new Date(ticket.createdAt).toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-500">
                {formattedDates.get(`${ticket.id}_created`)}
              </div>
            </div>
          </div>
        );
      
      case 'dueDate':
        return ticket.slaDueDate ? (
          <div className={`flex items-center ${getSlaStatusColor(ticket)}`}>
            <ClockIcon className="w-4 h-4 mr-2" />
            <div>
              <div className="text-sm font-medium">
                {new Date(ticket.slaDueDate).toLocaleDateString()}
              </div>
              <div className="text-xs">
                {formattedDates.get(`${ticket.id}_due`) ? `Due ${formattedDates.get(`${ticket.id}_due`)}` : 'Due date'}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-500">-</span>
        );
      
      case 'attachments':
        return ticket.attachments && ticket.attachments.length > 0 ? (
          <div className="flex items-center text-gray-500">
            <PaperClipIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">{ticket.attachments.length}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        );
      
      case 'branch':
        return ticket.createdBy?.unit ? (
          <div className="flex items-center">
            <BuildingOfficeIcon className="w-4 h-4 text-gray-400 mr-2" />
            <div>
              <div className="text-sm font-medium text-gray-900">
                {ticket.createdBy.unit.code}
              </div>
              <div className="text-xs text-gray-500">
                {ticket.createdBy.unit.unitType}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-400 italic">No branch</span>
        );
      
      case 'department':
        // Check for department from multiple sources: assignee's department, creator's department, or unit's department
        const department = 
          ticket.assignedTo?.department || 
          ticket.assignedTo?.unit?.department ||
          ticket.createdBy?.department || 
          ticket.createdBy?.unit?.department;
        
        return department ? (
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {department.name}
            </div>
            {(ticket.assignedTo?.unit || ticket.createdBy?.unit) && (
              <div className="text-xs text-gray-500">
                via {(ticket.assignedTo?.unit || ticket.createdBy?.unit)?.name}
              </div>
            )}
          </div>
        ) : (
          <span className="text-sm text-gray-400 italic">No department</span>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm ${className}`}>
      {/* Bulk Actions Bar */}
      {selectedTickets.size > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            {selectedTickets.size} ticket{selectedTickets.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onBulkAction?.('assign', Array.from(selectedTickets))}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Bulk Assign
            </button>
            <button
              onClick={() => onBulkAction?.('updateStatus', Array.from(selectedTickets))}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Update Status
            </button>
            <button
              onClick={() => onBulkAction?.('updatePriority', Array.from(selectedTickets))}
              className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
            >
              Set Priority
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              {visibleColumns.map(renderColumnHeader)}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <ClockIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
                    <p>No tickets match your current filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className={ticketRowClasses.get(ticket.id) || ''}
                  onClick={() => window.location.href = `/tickets/${ticket.id}`}
                >
                  {visibleColumns.map((column) => (
                    <td
                      key={`${ticket.id}-${column.key}`}
                      className="px-6 py-4 whitespace-nowrap"
                    >
                      {renderCellContent(ticket, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Click away handler for filter dropdowns */}
      {activeFilterColumn && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => setActiveFilterColumn(null)}
        />
      )}
      
      {/* Select All Checkbox in Header */}
      {tickets.length > 0 && visibleColumns[0]?.key === 'checkbox' && (
        <div className="absolute top-[52px] left-6 z-10">
          <input
            type="checkbox"
            checked={selectedTickets.size === tickets.length && tickets.length > 0}
            onChange={onSelectAll}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
};

export default TicketTableView;