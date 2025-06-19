// src/pages/ManagerDashboard.tsx
import React, { useState, useEffect } from 'react';
import { ClockIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ticketsService } from '../services';
import { Ticket } from '../types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ManagerDashboard: React.FC = () => {
  const [pendingTickets, setPendingTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadPendingTickets();
  }, []);

  const loadPendingTickets = async () => {
    try {
      setLoading(true);
      const tickets = await ticketsService.getPendingApprovals();
      setPendingTickets(tickets);
    } catch (error) {
      console.error('Failed to load pending tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (ticketId: number, action: 'approve' | 'reject', comments?: string) => {
    setActionLoading(ticketId);
    try {
      if (action === 'approve') {
        await ticketsService.approveTicket(ticketId, comments);
        toast.success('Ticket approved successfully');
      } else {
        if (!comments?.trim()) {
          toast.error('Comments are required when rejecting a ticket');
          return;
        }
        await ticketsService.rejectTicket(ticketId, comments);
        toast.success('Ticket rejected successfully');
      }
      
      // Reload pending tickets
      await loadPendingTickets();
    } catch (error) {
      console.error(`Failed to ${action} ticket:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Less than 1 hour ago';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  if (user?.role !== 'manager' && user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-500">Access denied. Manager role required.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
            <p className="mt-2 text-gray-600">Review and approve pending ticket requests</p>
          </div>
          <button
            onClick={loadPendingTickets}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Approval</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingTickets.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Urgent Priority</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingTickets.filter(t => t.priority === 'urgent').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Overdue (&gt;24h)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingTickets.filter(t => {
                      const hours = (new Date().getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60);
                      return hours > 24;
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Tickets */}
          {pendingTickets.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-500">No tickets pending approval at this time.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingTickets.map((ticket) => (
                <TicketApprovalCard
                  key={ticket.id}
                  ticket={ticket}
                  onApprove={(comments) => handleApproval(ticket.id, 'approve', comments)}
                  onReject={(comments) => handleApproval(ticket.id, 'reject', comments)}
                  loading={actionLoading === ticket.id}
                  getPriorityColor={getPriorityColor}
                  formatTimeAgo={formatTimeAgo}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

interface TicketApprovalCardProps {
  ticket: Ticket;
  onApprove: (comments?: string) => void;
  onReject: (comments: string) => void;
  loading: boolean;
  getPriorityColor: (priority: string) => string;
  formatTimeAgo: (dateString: string) => string;
}

const TicketApprovalCard: React.FC<TicketApprovalCardProps> = ({
  ticket,
  onApprove,
  onReject,
  loading,
  getPriorityColor,
  formatTimeAgo,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [comments, setComments] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const handleAction = (action: 'approve' | 'reject') => {
    if (action === 'approve') {
      onApprove(comments.trim() || undefined);
    } else {
      if (!comments.trim()) {
        toast.error('Comments are required when rejecting a ticket');
        return;
      }
      onReject(comments.trim());
    }
    setShowActions(false);
    setComments('');
    setActionType(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                #{ticket.id} - {ticket.title}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority.toUpperCase()}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4">{ticket.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-500">Requested by:</span>
                <p className="text-gray-900">{ticket.createdBy?.username || 'Unknown'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500">Email:</span>
                <p className="text-gray-900">{ticket.createdBy?.email || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500">Category:</span>
                <p className="text-gray-900">{ticket.item?.name || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500">Submitted:</span>
                <p className="text-gray-900">{formatTimeAgo(ticket.createdAt)}</p>
              </div>
            </div>

            {ticket.customFieldValues && ticket.customFieldValues.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Additional Information:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ticket.customFieldValues.map((cfv, index) => (
                    <div key={index}>
                      <span className="font-medium text-gray-600">
                        {cfv.fieldDefinition?.fieldLabel || cfv.fieldDefinition?.fieldName}:
                      </span>
                      <p className="text-gray-900">{cfv.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          {!showActions ? (
            <>
              <button
                onClick={() => {
                  setShowActions(true);
                  setActionType('reject');
                }}
                disabled={loading}
                className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <XCircleIcon className="h-4 w-4 inline mr-1" />
                Reject
              </button>
              <button
                onClick={() => {
                  setShowActions(true);
                  setActionType('approve');
                }}
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                Approve
              </button>
            </>
          ) : (
            <div className="w-full">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comments {actionType === 'reject' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    actionType === 'approve'
                      ? 'Optional comments about the approval...'
                      : 'Please explain why this ticket is being rejected...'
                  }
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowActions(false);
                    setComments('');
                    setActionType(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAction(actionType!)}
                  disabled={loading}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                    actionType === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-1"></div>
                      Processing...
                    </>
                  ) : (
                    `Confirm ${actionType === 'approve' ? 'Approval' : 'Rejection'}`
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;