// src/components/ui/ProgressBar.tsx
import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  status?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
  description?: string;
  animated?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  status,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  description,
  animated = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const variantClasses = {
    default: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-600',
    danger: 'bg-gradient-to-r from-red-500 to-red-600'
  };

  const getVariantByStatus = (status?: string) => {
    if (!status) return variant;
    
    switch (status) {
      case 'closed':
      case 'resolved':
        return 'success';
      case 'pending':
      case 'pending_approval':
        return 'warning';
      case 'cancelled':
      case 'rejected':
        return 'danger';
      default:
        return 'default';
    }
  };

  const currentVariant = getVariantByStatus(status);
  const animationClass = animated ? 'transition-all duration-500 ease-out' : '';

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label || description) && (
        <div className="flex items-center justify-between mb-2">
          {(label || showLabel) && (
            <span className="text-sm font-medium text-gray-700">
              {label || `Progress: ${Math.round(progress)}%`}
            </span>
          )}
          {description && (
            <span className="text-xs text-gray-500">{description}</span>
          )}
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`
            ${sizeClasses[size]}
            ${variantClasses[currentVariant]}
            ${animationClass}
            rounded-full
          `}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;