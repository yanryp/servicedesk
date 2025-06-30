// src/components/ui/PriorityBadge.tsx
import React from 'react';
import {
  ExclamationTriangleIcon,
  ArrowUpIcon,
  MinusIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import {
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/solid';

interface PriorityBadgeProps {
  priority: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return {
          label: 'Urgent',
          icon: ExclamationTriangleIconSolid,
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'high':
        return {
          label: 'High',
          icon: ArrowUpIcon,
          className: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      case 'medium':
        return {
          label: 'Medium',
          icon: MinusIcon,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'low':
        return {
          label: 'Low',
          icon: ArrowDownIcon,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      default:
        return {
          label: priority.charAt(0).toUpperCase() + priority.slice(1),
          icon: MinusIcon,
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

  const config = getPriorityConfig(priority);
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

export default PriorityBadge;