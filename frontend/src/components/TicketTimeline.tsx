// TicketTimeline.tsx
// Visual timeline component showing ticket status history and progress
import React from 'react';
import { Ticket as TicketType } from '../types';
import { 
  ClockIcon,
  CheckCircleIcon,
  UserIcon,
  PlayCircleIcon,
  PauseCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  DocumentTextIcon,
  BellIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  XCircleIcon as XCircleIconSolid,
  UserIcon as UserIconSolid
} from '@heroicons/react/24/solid';

interface TicketTimelineProps {
  ticket: TicketType;
  showAllSteps?: boolean; // Whether to show future steps or just completed ones
}

interface TimelineStep {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  solidIcon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  borderColor: string;
  completed: boolean;
  current: boolean;
  timestamp?: string;
  actor?: string;
  details?: string;
}

const TicketTimeline: React.FC<TicketTimelineProps> = ({ ticket, showAllSteps = true }) => {
  // Define the workflow steps
  const workflowSteps: Omit<TimelineStep, 'completed' | 'current' | 'timestamp' | 'actor' | 'details'>[] = [
    {
      key: 'submitted',
      label: 'Ticket Submitted',
      description: 'Support request created',
      icon: DocumentTextIcon,
      solidIcon: DocumentTextIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      key: 'pending_approval',
      label: 'Pending Approval',
      description: 'Waiting for manager approval',
      icon: ClockIcon,
      solidIcon: ClockIconSolid,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      borderColor: 'border-amber-200'
    },
    {
      key: 'approved',
      label: 'Approved',
      description: 'Approved by manager',
      icon: CheckCircleIcon,
      solidIcon: CheckCircleIconSolid,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      borderColor: 'border-emerald-200'
    },
    {
      key: 'assigned',
      label: 'Assigned',
      description: 'Assigned to technician',
      icon: UserIcon,
      solidIcon: UserIconSolid,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      key: 'in_progress',
      label: 'In Progress',
      description: 'Being worked on',
      icon: PlayCircleIcon,
      solidIcon: PlayCircleIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200'
    },
    {
      key: 'pending',
      label: 'Pending Response',
      description: 'Waiting for your response',
      icon: ExclamationTriangleIcon,
      solidIcon: ExclamationTriangleIconSolid,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-200'
    },
    {
      key: 'resolved',
      label: 'Resolved',
      description: 'Solution provided',
      icon: CheckCircleIcon,
      solidIcon: CheckCircleIconSolid,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200'
    },
    {
      key: 'closed',
      label: 'Closed',
      description: 'Ticket completed',
      icon: CheckCircleIcon,
      solidIcon: CheckCircleIconSolid,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200'
    }
  ];

  // Determine current status and build timeline
  const getCurrentStatusIndex = () => {
    const statusMap: Record<string, number> = {
      'pending_approval': 1,
      'awaiting_approval': 1,
      'approved': 2,
      'assigned': 3,
      'in_progress': 4,
      'pending': 5,
      'resolved': 6,
      'closed': 7,
      'rejected': -1,
      'cancelled': -1
    };
    return statusMap[ticket.status] || 0;
  };

  // Check if ticket was closed directly without going through resolved status
  const isDirectClose = () => {
    return ticket.status === 'closed' && !ticket.resolvedAt;
  };

  const currentStatusIndex = getCurrentStatusIndex();
  const isRejectedOrCancelled = ['rejected', 'cancelled'].includes(ticket.status);

  // Build timeline steps with completion status
  const timelineSteps: TimelineStep[] = workflowSteps.map((step, index) => {
    const stepIndex = index + 1;
    let completed = false;
    let current = false;
    let timestamp = '';
    let actor = '';
    let details = '';

    // Handle direct close: skip resolved step if ticket was closed directly
    if (isDirectClose() && step.key === 'resolved') {
      // Skip resolved step for direct close
      return {
        ...step,
        completed: false,
        current: false,
        timestamp: '',
        actor: '',
        details: ''
      };
    }

    if (stepIndex === 1) {
      // Always completed (ticket submitted)
      completed = true;
      timestamp = ticket.createdAt;
      actor = ticket.createdBy?.name || ticket.createdBy?.username || 'You';
      details = 'Support request submitted';
    } else if (stepIndex <= currentStatusIndex) {
      // For direct close, don't mark resolved as completed
      if (isDirectClose() && step.key === 'resolved') {
        completed = false;
      } else {
        completed = true;
        if (stepIndex === currentStatusIndex && !isDirectClose()) {
          current = true;
        }
      }
      
      // Add specific timestamps and actors if available
      switch (step.key) {
        case 'approved':
          timestamp = ticket.updatedAt; // This would ideally be approval timestamp
          actor = 'Manager';
          details = 'Request approved for processing';
          break;
        case 'assigned':
          timestamp = ticket.updatedAt;
          actor = ticket.assignedTo?.name || 'Technician';
          details = `Assigned to ${ticket.assignedTo?.name || 'technician'}`;
          break;
        case 'in_progress':
          timestamp = ticket.updatedAt;
          actor = ticket.assignedTo?.name || 'Technician';
          details = 'Work started on this ticket';
          break;
        case 'resolved':
          if (ticket.resolvedAt) {
            timestamp = ticket.resolvedAt;
            actor = ticket.assignedTo?.name || 'Technician';
            details = 'Solution provided';
          }
          break;
        case 'closed':
          timestamp = ticket.updatedAt;
          if (isDirectClose()) {
            actor = ticket.assignedTo?.name || 'Technician';
            details = 'Work completed and ticket closed by technician';
            completed = true;
            current = false; // Closed is final, not current
          } else {
            actor = 'System';
            details = 'Ticket marked as completed';
            completed = true;
            current = false; // Closed is final, not current
          }
          break;
      }
    } else if (stepIndex === currentStatusIndex + 1 && !isRejectedOrCancelled && !isDirectClose()) {
      current = true;
    }

    return {
      ...step,
      completed,
      current,
      timestamp,
      actor,
      details
    };
  });

  // Handle rejected/cancelled tickets
  if (isRejectedOrCancelled) {
    const rejectionStep: TimelineStep = {
      key: ticket.status,
      label: ticket.status === 'rejected' ? 'Rejected' : 'Cancelled',
      description: ticket.status === 'rejected' ? 'Request was rejected' : 'Request was cancelled',
      icon: XCircleIcon,
      solidIcon: XCircleIconSolid,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200',
      completed: true,
      current: true,
      timestamp: ticket.updatedAt,
      actor: ticket.status === 'rejected' ? 'Manager' : 'System',
      details: ticket.managerComments || (ticket.status === 'rejected' ? 'Request did not meet requirements' : 'Request was cancelled')
    };
    
    // Insert rejection step after approval if applicable
    const insertIndex = currentStatusIndex > 1 ? 2 : 1;
    timelineSteps.splice(insertIndex, 0, rejectionStep);
  }

  // Filter steps if not showing all
  const visibleSteps = showAllSteps 
    ? timelineSteps 
    : timelineSteps.filter(step => {
        // For direct close, exclude resolved step that wasn't completed
        if (isDirectClose() && step.key === 'resolved' && !step.completed) {
          return false;
        }
        return step.completed || step.current;
      });

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getNextAction = () => {
    switch (ticket.status) {
      case 'pending_approval':
        return 'Your manager will review and approve this request';
      case 'approved':
        return 'A technician will be assigned to work on this ticket';
      case 'assigned':
        return 'The assigned technician will begin working on your request';
      case 'in_progress':
        return 'The technician is actively working on your issue';
      case 'pending':
        return 'Please check your email and respond to the technician\'s questions';
      case 'resolved':
        return 'Please review the solution and confirm if your issue is resolved';
      case 'closed':
        if (isDirectClose()) {
          return 'Your ticket has been completed by the technician. No further action is required.';
        } else {
          return 'Your ticket has been completed and closed. No further action is required.';
        }
      case 'rejected':
        return 'You can create a new ticket with additional information';
      case 'cancelled':
        return 'You can create a new ticket if you still need assistance';
      default:
        return 'Your ticket is being processed';
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
            <ArrowRightIcon className="w-5 h-5 text-gray-600" />
            <span>Ticket Progress</span>
          </h3>
          <span className="text-sm text-gray-500">
            {ticket.status === 'closed' ? 
              'Completed' : 
              `Step ${Math.max(1, currentStatusIndex)} of ${isDirectClose() ? workflowSteps.length - 1 : workflowSteps.length}`
            }
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Progress Overview */}
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start space-x-3">
            <BellIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">What's Next?</h4>
              <p className="text-sm text-blue-700">{getNextAction()}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {visibleSteps.map((step, index) => {
            const isLast = index === visibleSteps.length - 1;
            const IconComponent = step.completed ? step.solidIcon : step.icon;

            return (
              <div key={step.key} className="relative flex items-start space-x-4 pb-8">
                {/* Connection Line */}
                {!isLast && (
                  <div 
                    className={`absolute left-5 top-12 w-0.5 h-full ${
                      step.completed ? 'bg-green-300' : 'bg-gray-200'
                    }`}
                  />
                )}

                {/* Step Icon */}
                <div className={`
                  relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                  ${step.completed 
                    ? `${step.bgColor} ${step.borderColor} ${step.color}` 
                    : step.current
                      ? `${step.bgColor} ${step.borderColor} ${step.color} ring-4 ring-blue-100`
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }
                `}>
                  <IconComponent className="w-5 h-5" />
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${
                    step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </div>
                  
                  <div className={`text-sm mt-1 ${
                    step.completed || step.current ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </div>

                  {/* Timestamp and Actor */}
                  {step.timestamp && (
                    <div className="mt-2 space-y-1">
                      <div className="text-xs text-gray-500">
                        {formatTimestamp(step.timestamp)}
                        {step.actor && (
                          <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {step.actor}
                          </span>
                        )}
                      </div>
                      {step.details && (
                        <div className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                          {step.details}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Current Step Indicator */}
                  {step.current && (
                    <div className="mt-2 inline-flex items-center space-x-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <span>Current Step</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Information */}
        {ticket.slaDueDate && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm">
              <ClockIcon className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">
                Target resolution: {new Date(ticket.slaDueDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketTimeline;