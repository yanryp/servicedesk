// src/components/ui/EmptyState.tsx
import React from 'react';
import Button from './Button';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && (
        <div className="flex justify-center mb-4">
          <Icon className="w-16 h-16 text-gray-400" />
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || 'primary'}
          size="lg"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;