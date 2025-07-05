// frontend/src/pages/technician/TechnicianQuickActions.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ticketsService } from '../../services';
import { Ticket, TicketStatus } from '../../types';
import {
  BoltIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  PauseIcon,
  PlayIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface BulkAction {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  action: (ticketIds: number[]) => Promise<void>;
  color: string;
  enabled: (tickets: Ticket[]) => boolean;
}

const TechnicianQuickActions: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketsService.getTickets({
        assignedToUserId: user?.id,
        limit: 50
      });
      setTickets(response.tickets || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (actionId: string, action: (ticketIds: number[]) => Promise<void>) => {
    if (selectedTickets.size === 0) return;
    
    try {
      setActionLoading(actionId);
      await action(Array.from(selectedTickets));
      setSelectedTickets(new Set());
      await loadTickets();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const bulkUpdateStatus = async (ticketIds: number[], status: TicketStatus) => {
    for (const ticketId of ticketIds) {
      await ticketsService.updateTicket(ticketId, { status });
    }
  };

  const bulkActions: BulkAction[] = [
    {
      id: 'start_work',
      name: 'Start Work',
      description: 'Begin working on selected assigned tickets',
      icon: PlayIcon,
      action: (ticketIds) => bulkUpdateStatus(ticketIds, 'in_progress' as TicketStatus),
      color: 'bg-blue-600 hover:bg-blue-700',
      enabled: (tickets) => tickets.some(t => selectedTickets.has(t.id) && t.status === 'assigned')
    },
    {
      id: 'mark_pending',
      name: 'Mark Pending',
      description: 'Put selected tickets on hold',
      icon: PauseIcon,
      action: (ticketIds) => bulkUpdateStatus(ticketIds, 'pending' as TicketStatus),
      color: 'bg-yellow-600 hover:bg-yellow-700',
      enabled: (tickets) => tickets.some(t => selectedTickets.has(t.id) && t.status === 'in_progress')
    },
    {
      id: 'resume_work',
      name: 'Resume Work',
      description: 'Resume work on pending tickets',
      icon: ArrowPathIcon,
      action: (ticketIds) => bulkUpdateStatus(ticketIds, 'in_progress' as TicketStatus),
      color: 'bg-indigo-600 hover:bg-indigo-700',
      enabled: (tickets) => tickets.some(t => selectedTickets.has(t.id) && t.status === 'pending')
    },
    {
      id: 'resolve',
      name: 'Mark Resolved',
      description: 'Mark selected tickets as resolved',
      icon: CheckCircleIcon,
      action: (ticketIds) => bulkUpdateStatus(ticketIds, 'resolved' as TicketStatus),
      color: 'bg-green-600 hover:bg-green-700',
      enabled: (tickets) => tickets.some(t => selectedTickets.has(t.id) && t.status === 'in_progress')
    }
  ];

  const toggleTicketSelection = (ticketId: number) => {
    const newSelection = new Set(selectedTickets);
    if (newSelection.has(ticketId)) {
      newSelection.delete(ticketId);
    } else {
      newSelection.add(ticketId);
    }
    setSelectedTickets(newSelection);
  };

  const selectAll = () => {
    if (selectedTickets.size === tickets.length) {
      setSelectedTickets(new Set());
    } else {
      setSelectedTickets(new Set(tickets.map(t => t.id)));
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
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
        <p className="ml-4 text-slate-600">Loading quick actions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <BoltIcon className="w-8 h-8 mr-3 text-yellow-500" />
          Quick Actions
        </h1>
        <p className="text-slate-600 mt-1">
          Perform bulk operations on your assigned tickets efficiently
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Active</p>
              <p className="text-2xl font-bold text-slate-900">{tickets.length}</p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-slate-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Assigned</p>
              <p className="text-2xl font-bold text-blue-600">
                {tickets.filter(t => t.status === 'assigned').length}
              </p>
            </div>
            <PlayIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">In Progress</p>
              <p className="text-2xl font-bold text-indigo-600">
                {tickets.filter(t => t.status === 'in_progress').length}
              </p>
            </div>
            <ArrowPathIcon className="w-8 h-8 text-indigo-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {tickets.filter(t => t.status === 'pending').length}
              </p>
            </div>
            <PauseIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Bulk Operations</h2>
        
        {selectedTickets.size > 0 ? (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium">
              {selectedTickets.size} ticket{selectedTickets.size === 1 ? '' : 's'} selected
            </p>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-slate-600">
              Select tickets below to perform bulk operations
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {bulkActions.map((bulkAction) => {
            const Icon = bulkAction.icon;
            const isEnabled = bulkAction.enabled(tickets);
            const isLoading = actionLoading === bulkAction.id;
            
            return (
              <button
                key={bulkAction.id}
                onClick={() => handleBulkAction(bulkAction.id, bulkAction.action)}
                disabled={!isEnabled || selectedTickets.size === 0 || isLoading}
                className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                  isEnabled && selectedTickets.size > 0
                    ? `${bulkAction.color} text-white border-transparent hover:shadow-lg`
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                  <div>
                    <div className="font-medium">{bulkAction.name}</div>
                    <div className="text-sm opacity-90">{bulkAction.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ticket List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Active Tickets ({tickets.length})
            </h2>
            <button
              onClick={selectAll}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {selectedTickets.size === tickets.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>

        <div className="p-6">
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No active tickets</p>
              <p className="text-slate-400">All caught up! Great work! 🎉</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                    selectedTickets.has(ticket.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  onClick={() => toggleTicketSelection(ticket.id)}
                >
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedTickets.has(ticket.id)}
                      onChange={() => toggleTicketSelection(ticket.id)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-bold text-slate-900">#{ticket.id}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority?.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                          {ticket.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-slate-900 mb-1">{ticket.title}</h3>
                      <p className="text-sm text-slate-600 mb-2 line-clamp-1">{ticket.description}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>By: {ticket.createdBy?.name || 'Unknown'}</span>
                        <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicianQuickActions;