// src/pages/EditTicketPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  PencilIcon, 
  ArrowLeftIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Ticket, UpdateTicketRequest, TicketPriority, TicketStatus } from '../types';
import toast from 'react-hot-toast';

interface EditTicketFormData {
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
}

const EditTicketPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditTicketFormData>();

  useEffect(() => {
    const fetchTicket = async () => {
      if (!isAuthenticated || !ticketId) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<Ticket>(`/api/tickets/${ticketId}`);
        setTicket(response);
        
        // Pre-fill the form
        reset({
          title: response.title,
          description: response.description,
          priority: response.priority,
          status: response.status,
        });
      } catch (error) {
        toast.error('Failed to load ticket data');
        console.error('Error fetching ticket:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId, isAuthenticated, reset]);

  const onSubmit = async (data: EditTicketFormData) => {
    if (!ticket) return;

    setIsSubmitting(true);
    try {
      const updateData: UpdateTicketRequest = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
      };

      await api.put(`/api/tickets/${ticketId}`, updateData);
      toast.success('Ticket updated successfully!');
      navigate(`/tickets/${ticketId}`);
    } catch (error) {
      console.error('Error updating ticket:', error);
      // Error is already handled by API interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Please log in to edit tickets.</p>
      </div>
    );
  }

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

  if (!ticket) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Ticket Not Found</h3>
        <p className="text-red-600 mb-6">The ticket you're trying to edit doesn't exist or you don't have permission to edit it.</p>
        <Link
          to="/tickets"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to My Tickets</span>
        </Link>
      </div>
    );
  }

  // Check permissions
  const canEdit = user?.role === 'admin' || 
                  user?.role === 'technician' || 
                  user?.id === ticket.createdByUserId;

  if (!canEdit) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-amber-800 mb-2">Access Denied</h3>
        <p className="text-amber-700 mb-6">You don't have permission to edit this ticket.</p>
        <Link
          to={`/tickets/${ticketId}`}
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to Ticket Details</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Navigation */}
      <div className="flex items-center space-x-4">
        <Link
          to={`/tickets/${ticketId}`}
          className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to Ticket Details</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
            <PencilIcon className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Edit Support Ticket
        </h1>
        <p className="mt-2 text-slate-600">
          Update ticket information and status
        </p>
        <div className="mt-3">
          <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
            Ticket #{ticket.id}
          </span>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-slate-200/50">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              {...register('title', { 
                required: 'Title is required',
                minLength: { value: 5, message: 'Title must be at least 5 characters' }
              })}
              disabled={isSubmitting}
              className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
              placeholder="Brief description of your issue"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              rows={6}
              {...register('description', { 
                required: 'Description is required',
                minLength: { value: 10, message: 'Description must be at least 10 characters' }
              })}
              disabled={isSubmitting}
              className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
              placeholder="Detailed description of your issue..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-2">
                Priority *
              </label>
              <select
                id="priority"
                {...register('priority', { required: 'Priority is required' })}
                disabled={isSubmitting}
                className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
              >
                <option value="low">Low - Minor issue, no immediate impact</option>
                <option value="medium">Medium - Moderate impact on productivity</option>
                <option value="high">High - Significant impact, affects multiple users</option>
                <option value="urgent">Urgent - Critical issue, business operations affected</option>
              </select>
              {errors.priority && (
                <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
              )}
            </div>

            {(user?.role === 'admin' || user?.role === 'technician') && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  {...register('status')}
                  disabled={isSubmitting}
                  className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
                >
                  <option value="open">Open</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="pending_requester_response">Pending Requester Response</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
            <Link
              to={`/tickets/${ticketId}`}
              className="px-6 py-3 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 hover:shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating Ticket...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Update Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTicketPage;
