// src/components/ui/StatusBadge.tsx
import React from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  UserIcon,
  PlayCircleIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  XCircleIcon as XCircleIconSolid
} from '@heroicons/react/24/solid';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending_approval':
      case 'awaiting_approval':
        return {
          label: 'Pending Approval',
          icon: ClockIconSolid,
          className: 'bg-amber-100 text-amber-800 border-amber-200'
        };
      case 'approved':
        return {
          label: 'Approved',
          icon: CheckCircleIconSolid,
          className: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        };
      case 'assigned':
        return {
          label: 'Assigned',
          icon: UserIcon,
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          icon: PlayCircleIcon,
          className: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      case 'pending':
        return {
          label: 'Pending',
          icon: ExclamationTriangleIconSolid,
          className: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      case 'resolved':
        return {
          label: 'Resolved',
          icon: CheckCircleIcon,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'closed':
        return {
          label: 'Closed',
          icon: CheckCircleIconSolid,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
      case 'cancelled':
      case 'rejected':
        return {
          label: status === 'cancelled' ? 'Cancelled' : 'Rejected',
          icon: XCircleIconSolid,
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      default:
        return {
          label: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          icon: ClockIcon,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className={`
      inline-flex items-center font-medium rounded-full border
      ${config.className}
      ${sizeClasses[size]}
      ${className}
    `}>
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{config.label}</span>
    </div>
  );
};

export default StatusBadge;