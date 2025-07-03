import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  UserIcon,
  CalendarDaysIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PaperClipIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import {
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/solid';
import { StatusBadge, PriorityBadge } from '../ui';
import { Ticket, TicketStatus } from '../../types';

interface KanbanColumn {
  id: TicketStatus;
  title: string;
  tickets: Ticket[];
  color: string;
}

interface TicketKanbanViewProps {
  tickets: Ticket[];
  loading: boolean;
  onTicketStatusUpdate: (ticketId: number, newStatus: TicketStatus) => void;
  onTicketClick?: (ticket: Ticket) => void;
  className?: string;
}

const TicketKanbanView: React.FC<TicketKanbanViewProps> = ({
  tickets,
  loading,
  onTicketStatusUpdate,
  onTicketClick,
  className = ''
}) => {
  const [draggedTicket, setDraggedTicket] = useState<Ticket | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TicketStatus | null>(null);

  const columns: Omit<KanbanColumn, 'tickets'>[] = [
    {
      id: 'open' as TicketStatus,
      title: 'Open',
      color: 'border-blue-200 bg-blue-50'
    },
    {
      id: 'pending_approval' as TicketStatus,
      title: 'Pending Approval',
      color: 'border-amber-200 bg-amber-50'
    },
    {
      id: 'approved' as TicketStatus,
      title: 'Approved',
      color: 'border-emerald-200 bg-emerald-50'
    },
    {
      id: 'assigned' as TicketStatus,
      title: 'Assigned',
      color: 'border-indigo-200 bg-indigo-50'
    },
    {
      id: 'in_progress' as TicketStatus,
      title: 'In Progress',
      color: 'border-purple-200 bg-purple-50'
    },
    {
      id: 'pending' as TicketStatus,
      title: 'Pending',
      color: 'border-orange-200 bg-orange-50'
    },
    {
      id: 'resolved' as TicketStatus,
      title: 'Resolved',
      color: 'border-green-200 bg-green-50'
    },
    {
      id: 'closed' as TicketStatus,
      title: 'Closed',
      color: 'border-gray-200 bg-gray-50'
    }
  ];

  const getTicketsByStatus = useCallback((status: TicketStatus) => {
    return tickets.filter(ticket => ticket.status === status);
  }, [tickets]);

  const formatTimeAgo = useCallback((date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  }, []);

  const handleDragStart = (e: React.DragEvent, ticket: Ticket) => {
    setDraggedTicket(ticket);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: TicketStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: TicketStatus) => {
    e.preventDefault();
    if (draggedTicket && draggedTicket.status !== columnId) {
      onTicketStatusUpdate(draggedTicket.id, columnId);
    }
    setDraggedTicket(null);
    setDragOverColumn(null);
  };

  const isOverdue = (ticket: Ticket) => {
    return ticket.slaDueDate && 
           new Date(ticket.slaDueDate) < new Date() && 
           ticket.status !== 'closed';
  };

  const getCardClasses = (ticket: Ticket) => {
    const baseClasses = 'bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group';
    const classes = [baseClasses];

    if (isOverdue(ticket)) {
      classes.push('border-red-300 bg-red-50');
    } else if (ticket.priority === 'urgent') {
      classes.push('border-red-200 bg-red-50');
    } else if (ticket.priority === 'high') {
      classes.push('border-orange-200 bg-orange-50');
    } else if (ticket.isKasdaTicket) {
      classes.push('border-green-200 bg-green-50');
    }

    return classes.join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading kanban board...</span>
      </div>
    );
  }

  return (
    <div className={`flex space-x-6 overflow-x-auto pb-6 ${className}`}>
      {columns.map((column) => {
        const columnTickets = getTicketsByStatus(column.id);
        const isDragOver = dragOverColumn === column.id;
        
        return (
          <div
            key={column.id}
            className={`flex-shrink-0 w-80 ${column.color} rounded-lg border-2 transition-all duration-200 ${
              isDragOver ? 'border-blue-400 bg-blue-100' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  {column.title}
                </h3>
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-full">
                  {columnTickets.length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className="p-4 space-y-3 min-h-[200px] max-h-[600px] overflow-y-auto">
              {columnTickets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ClockIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No tickets</p>
                </div>
              ) : (
                columnTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={getCardClasses(ticket)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, ticket)}
                    onClick={() => onTicketClick?.(ticket)}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        #{ticket.id}
                      </Link>
                      <div className="flex items-center space-x-1">
                        <PriorityBadge priority={ticket.priority} size="sm" />
                        {ticket.priority === 'urgent' && (
                          <ExclamationTriangleIconSolid className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>

                    {/* Card Title */}
                    <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                      {ticket.title}
                    </h4>

                    {/* Card Meta */}
                    <div className="space-y-2 text-xs text-gray-600">
                      {/* Requester */}
                      <div className="flex items-center">
                        <UserIcon className="w-3 h-3 mr-1" />
                        <span className="truncate">
                          {ticket.createdBy?.name || ticket.createdBy?.username || 'Unknown'}
                        </span>
                      </div>

                      {/* Branch (for BSG) */}
                      {ticket.createdBy?.unit && (
                        <div className="flex items-center">
                          <BuildingOfficeIcon className="w-3 h-3 mr-1" />
                          <span className="truncate">
                            {ticket.createdBy.unit.code} ({ticket.createdBy.unit.unitType})
                          </span>
                        </div>
                      )}

                      {/* Service/Category */}
                      <div className="truncate">
                        <span className="font-medium">
                          {ticket.serviceItem?.name || ticket.item?.name || 'Uncategorized'}
                        </span>
                      </div>

                      {/* Created Date */}
                      <div className="flex items-center">
                        <CalendarDaysIcon className="w-3 h-3 mr-1" />
                        <span>Created {formatTimeAgo(ticket.createdAt)}</span>
                      </div>

                      {/* Due Date */}
                      {ticket.slaDueDate && (
                        <div className={`flex items-center ${
                          isOverdue(ticket) ? 'text-red-600 font-medium' : ''
                        }`}>
                          <ClockIcon className="w-3 h-3 mr-1" />
                          <span>
                            Due {formatTimeAgo(ticket.slaDueDate)}
                            {isOverdue(ticket) && ' (Overdue)'}
                          </span>
                        </div>
                      )}

                      {/* Assigned To */}
                      {ticket.assignedTo && (
                        <div className="flex items-center">
                          <UserIcon className="w-3 h-3 mr-1" />
                          <span className="truncate">
                            Assigned to {ticket.assignedTo.name || ticket.assignedTo.username}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        {ticket.isKasdaTicket && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            KASDA
                          </span>
                        )}
                        {ticket.attachments && ticket.attachments.length > 0 && (
                          <div className="flex items-center text-gray-500">
                            <PaperClipIcon className="w-3 h-3 mr-1" />
                            <span className="text-xs">{ticket.attachments.length}</span>
                          </div>
                        )}
                      </div>
                      
                      <StatusBadge status={ticket.status} size="sm" />
                    </div>

                    {/* Special Indicators */}
                    {isOverdue(ticket) && (
                      <div className="absolute top-2 right-2">
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TicketKanbanView;