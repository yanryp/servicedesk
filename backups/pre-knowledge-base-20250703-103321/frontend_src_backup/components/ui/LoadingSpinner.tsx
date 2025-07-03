// src/components/ui/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'gradient';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  color = 'blue',
  text,
  className = '',
  fullScreen = false
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
    yellow: 'border-yellow-600',
    purple: 'border-purple-600',
    gray: 'border-gray-600'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`
                  w-2 h-2 bg-${color}-600 rounded-full animate-bounce
                  ${i === 1 ? 'animation-delay-75' : ''}
                  ${i === 2 ? 'animation-delay-150' : ''}
                `}
                style={{
                  animationDelay: `${i * 0.15}s`
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div
            className={`
              ${sizeClasses[size]}
              bg-${color}-600 rounded-full animate-pulse
            `}
          />
        );

      case 'gradient':
        return (
          <div
            className={`
              ${sizeClasses[size]}
              animate-spin rounded-full
              bg-gradient-to-r from-${color}-400 to-${color}-600
              opacity-75
            `}
            style={{
              background: `conic-gradient(from 0deg, transparent, var(--tw-gradient-stops))`
            }}
          />
        );

      default: // spinner
        return (
          <div
            className={`
              ${sizeClasses[size]}
              animate-spin rounded-full border-2 border-gray-200
              ${colorClasses[color]}
              border-t-transparent
            `}
          />
        );
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {renderSpinner()}
      {text && (
        <p className={`text-${color}-600 font-medium animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;