// src/pages/TicketDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useFileDownloader } from '../hooks/useFileDownloader';
import TicketCategorization from '../components/TicketCategorization';
import TicketComments from '../components/TicketComments';
import { Ticket as FullTicket } from '../types';
import { 
  TicketIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  DocumentArrowDownIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';



const TicketDetailPage: React.FC = () => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<FullTicket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { downloadFile, downloadingId } = useFileDownloader();

  useEffect(() => {
    const fetchTicket = async () => {
      if (!token) {
        setError('Authentication required.');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`http://localhost:3001/api/tickets/${ticketId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTicket(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch ticket details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId, token]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this ticket permanently?')) {
      return;
    }

    if (!token) {
      setError('Authentication required for deletion.');
      return;
    }

    try {
      await axios.delete(`http://localhost:3001/api/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Ticket deleted successfully.');
      navigate('/tickets');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete ticket.');
      console.error('Delete error:', err);
    }
  };

  const handleApprovalAction = async (action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectionReason) {
      alert('Please provide a reason for rejection.');
      return;
    }
    try {
      const response = await axios.put(`http://localhost:3001/api/tickets/${ticketId}/approval`, 
        { action, rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTicket(response.data);
      setIsRejecting(false);
      setRejectionReason('');
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${action} ticket.`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Ticket</h3>
        <p className="text-red-600">{error}</p>
        <Link
          to="/tickets"
          className="inline-flex items-center space-x-2 mt-4 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to My Tickets</span>
        </Link>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <TicketIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Ticket Not Found</h3>
        <p className="text-slate-600 mb-6">The ticket you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/tickets"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to My Tickets</span>
        </Link>
      </div>
    );
  }

  // Use backend-provided permissions for proper authorization
  const showApprovalButtons = (ticket as any).userPermissions?.canApprove || false;
  const isOwner = (ticket as any).userPermissions?.isOwner || false;
  const canModify = (ticket as any).userPermissions?.canModify || false;
  const isDirectManager = (ticket as any).userPermissions?.isDirectManager || false;

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
      case 'pending-approval': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const isOverdue = ticket.slaDueDate && 
    new Date(ticket.slaDueDate) < new Date() && 
    ticket.status !== 'closed';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Navigation */}
      <div className="flex items-center space-x-4">
        <Link
          to="/tickets"
          className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to My Tickets</span>
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-slate-200/50">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <TicketIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{ticket.title}</h1>
                <p className="text-slate-500">Ticket #{ticket.id}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(ticket.status)}`}>
              {ticket.status.replace('-', ' ').toUpperCase()}
            </span>
            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority.toUpperCase()} PRIORITY
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
            <CalendarIcon className="w-5 h-5 text-slate-500" />
            <div>
              <div className="font-medium text-slate-700">Created</div>
              <div className="text-slate-600">{new Date(ticket.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
            <ClockIcon className="w-5 h-5 text-slate-500" />
            <div>
              <div className="font-medium text-slate-700">Last Updated</div>
              <div className="text-slate-600">{new Date(ticket.updatedAt).toLocaleDateString()}</div>
            </div>
          </div>
          
          {ticket.slaDueDate && (
            <div className={`flex items-center space-x-3 p-3 rounded-lg ${isOverdue ? 'bg-red-50' : 'bg-slate-50'}`}>
              <ExclamationTriangleIcon className={`w-5 h-5 ${isOverdue ? 'text-red-500' : 'text-slate-500'}`} />
              <div>
                <div className={`font-medium ${isOverdue ? 'text-red-700' : 'text-slate-700'}`}>
                  SLA Due {isOverdue && '(Overdue)'}
                </div>
                <div className={`${isOverdue ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>
                  {new Date(ticket.slaDueDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-slate-200/50">
        <div className="flex items-center space-x-2 mb-4">
          <ChatBubbleLeftIcon className="w-5 h-5 text-slate-600" />
          <h2 className="text-xl font-semibold text-slate-800">Description</h2>
        </div>
        <div className="prose max-w-none">
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
        </div>
        
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ticket.item?.subCategory?.category && (
              <div className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
                <span className="font-medium">Category:</span>
                <span>{ticket.item.subCategory.category.name}</span>
              </div>
            )}
            
            {ticket.createdBy?.department && (
              <div className="inline-flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg">
                <span className="font-medium">Department:</span>
                <span>{ticket.createdBy.department.name}</span>
              </div>
            )}
            
            {ticket.createdBy?.manager && (
              <div className="inline-flex items-center space-x-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg">
                <span className="font-medium">Manager:</span>
                <span>{ticket.createdBy.manager.username}</span>
              </div>
            )}
            
            {isDirectManager && (
              <div className="inline-flex items-center space-x-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg">
                <span className="font-medium">Status:</span>
                <span>Awaiting your approval</span>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Dynamic Fields / Custom Fields */}
      {(((ticket as any).custom_fields && (ticket as any).custom_fields.length > 0) || 
        ((ticket as any).bsg_fields && (ticket as any).bsg_fields.length > 0)) && (
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-slate-200/50">
          <div className="flex items-center space-x-2 mb-6">
            <DocumentTextIcon className="w-5 h-5 text-slate-600" />
            <h2 className="text-xl font-semibold text-slate-800">Template Fields</h2>
            <span className="text-sm text-slate-500">
              ({((ticket as any).custom_fields?.length || 0) + ((ticket as any).bsg_fields?.length || 0)} field{(((ticket as any).custom_fields?.length || 0) + ((ticket as any).bsg_fields?.length || 0)) !== 1 ? 's' : ''})
            </span>
          </div>
          <div className="space-y-6">
            {/* Render custom fields (legacy) */}
            {(ticket as any).custom_fields?.map((field: any, index: number) => {
              const isFileField = field.field_type === 'file' || field.field_type === 'attachment';
              const isCurrencyField = field.field_type === 'currency';
              const isDateField = field.field_type === 'date' || field.field_type === 'datetime';
              const isDropdownField = field.field_type?.startsWith('dropdown_') || field.field_type === 'searchable_dropdown';
              
              return (
                <div key={`custom_${field.field_definition_id || index}`} className="border border-slate-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {field.field_label || field.field_name}
                        {field.field_type && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {field.field_type.replace('_', ' ')}
                          </span>
                        )}
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Display field value based on field type */}
                    {isFileField ? (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        {field.value ? (
                          <div className="flex items-center space-x-2">
                            <DocumentArrowDownIcon className="w-4 h-4 text-blue-600" />
                            <span className="text-slate-800 font-medium">{field.value}</span>
                            <span className="text-xs text-slate-500">(File attached)</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No file attached</span>
                        )}
                      </div>
                    ) : isCurrencyField ? (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-slate-800 font-medium">
                          {field.value ? `Rp ${parseInt(field.value).toLocaleString('id-ID')}` : 
                           <span className="text-slate-400 italic">No amount provided</span>}
                        </span>
                      </div>
                    ) : isDateField ? (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-800">
                            {field.value ? new Date(field.value).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              ...(field.field_type === 'datetime' && {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            }) : <span className="text-slate-400 italic">No date provided</span>}
                          </span>
                        </div>
                      </div>
                    ) : isDropdownField ? (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-slate-800 font-medium">
                            {field.value || <span className="text-slate-400 italic">No selection made</span>}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-slate-800">
                          {field.value || <span className="text-slate-400 italic">No value provided</span>}
                        </span>
                      </div>
                    )}
                    
                    {/* Additional field information */}
                    {field.field_description && (
                      <p className="text-xs text-slate-600 italic">
                        {field.field_description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Render BSG fields */}
            {(ticket as any).bsg_fields?.map((field: any, index: number) => {
              const isFileField = field.field_type === 'file' || field.field_type === 'attachment';
              const isCurrencyField = field.field_type === 'currency';
              const isDateField = field.field_type === 'date' || field.field_type === 'datetime';
              const isDropdownField = field.field_type?.startsWith('dropdown_') || field.field_type === 'searchable_dropdown';
              
              return (
                <div key={`bsg_${field.field_definition_id || index}`} className="border border-slate-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {field.field_label || field.field_name}
                        {field.field_type && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            BSG: {field.field_type.replace('_', ' ')}
                          </span>
                        )}
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Display field value based on field type */}
                    {isFileField ? (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        {field.value ? (
                          <div className="flex items-center space-x-2">
                            <DocumentArrowDownIcon className="w-4 h-4 text-blue-600" />
                            <span className="text-slate-800 font-medium">{field.value}</span>
                            <span className="text-xs text-slate-500">(File attached)</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No file attached</span>
                        )}
                      </div>
                    ) : isCurrencyField ? (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-slate-800 font-medium">
                          {field.value ? `Rp ${parseInt(field.value).toLocaleString('id-ID')}` : 
                           <span className="text-slate-400 italic">No amount provided</span>}
                        </span>
                      </div>
                    ) : isDateField ? (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-800">
                            {field.value ? new Date(field.value).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              ...(field.field_type === 'datetime' && {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            }) : <span className="text-slate-400 italic">No date provided</span>}
                          </span>
                        </div>
                      </div>
                    ) : isDropdownField ? (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-slate-800 font-medium">
                            {field.value || <span className="text-slate-400 italic">No selection made</span>}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-slate-800">
                          {field.value || <span className="text-slate-400 italic">No value provided</span>}
                        </span>
                      </div>
                    )}
                    
                    {/* Additional field information */}
                    {(field.field_description || field.help_text) && (
                      <p className="text-xs text-slate-600 italic">
                        {field.field_description || field.help_text}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Attachments */}
      {ticket.attachments && ticket.attachments.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-slate-200/50">
          <div className="flex items-center space-x-2 mb-6">
            <DocumentArrowDownIcon className="w-5 h-5 text-slate-600" />
            <h2 className="text-xl font-semibold text-slate-800">Attachments</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ticket.attachments.map(att => (
              <button
                key={att.id}
                onClick={() => downloadFile({ id: att.id, filename: att.fileName })}
                disabled={downloadingId === att.id}
                className="flex items-center space-x-3 p-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DocumentArrowDownIcon className="w-8 h-8 text-blue-600" />
                <div className="flex-1 text-left">
                  <div className="font-medium text-slate-800 truncate">{att.fileName}</div>
                  <div className="text-sm text-slate-600">
                    {downloadingId === att.id ? 'Downloading...' : 'Click to download'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ticket Categorization */}
      {ticket && (
        <TicketCategorization
          ticket={ticket}
          onUpdate={setTicket}
          currentUserRole={user?.role}
          isCurrentUserCreator={user?.id === ticket.createdByUserId}
          canEdit={true}
        />
      )}

      {/* Ticket Comments */}
      {ticket && (
        <TicketComments
          ticketId={ticket.id}
          onCommentAdded={() => {
            // Optionally refresh ticket data when comment is added
            console.log('Comment added to ticket', ticket.id);
          }}
        />
      )}

      {/* Manager Approval Section */}
      {showApprovalButtons && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <UserIcon className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl font-semibold text-amber-800">Manager Approval Required</h2>
            </div>
            <div className="text-sm text-amber-700">
              <span className="font-medium">Department:</span> {ticket.createdBy?.department?.name}
            </div>
          </div>
          <div className="bg-amber-100 border border-amber-300 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              <span className="font-medium">Workflow:</span> As the direct manager of {ticket.createdBy?.username} 
              in the {ticket.createdBy?.department?.name} department, your approval is required before this ticket 
              can proceed to the technical team for resolution.
            </p>
          </div>
          
          {!isRejecting ? (
            <div className="flex space-x-4">
              <button
                onClick={() => handleApprovalAction('approve')}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <CheckCircleIcon className="w-5 h-5" />
                <span>Approve Ticket</span>
              </button>
              <button
                onClick={() => setIsRejecting(true)}
                className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <XCircleIcon className="w-5 h-5" />
                <span>Reject Ticket</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-700 mb-2">
                  Reason for Rejection *
                </label>
                <textarea 
                  placeholder="Please provide a detailed reason for rejecting this ticket..." 
                  value={rejectionReason} 
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="block w-full px-4 py-3 border border-amber-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleApprovalAction('reject')}
                  disabled={!rejectionReason.trim()}
                  className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <XCircleIcon className="w-5 h-5" />
                  <span>Confirm Rejection</span>
                </button>
                <button
                  onClick={() => {
                    setIsRejecting(false);
                    setRejectionReason('');
                  }}
                  className="flex items-center space-x-2 border border-slate-300 text-slate-700 px-6 py-3 rounded-xl font-medium hover:bg-slate-50 transition-all duration-200"
                >
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {canModify && (
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-slate-200/50">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              to={`/tickets/${ticketId}/edit`}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <PencilIcon className="w-5 h-5" />
              <span>Edit Ticket</span>
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <TrashIcon className="w-5 h-5" />
              <span>Delete Ticket</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetailPage;
