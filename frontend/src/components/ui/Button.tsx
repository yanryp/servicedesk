// src/components/ui/Button.tsx
import React from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  showArrow?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  showArrow = false,
  className = '',
  fullWidth = false
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl focus:ring-blue-500 active:scale-95',
    secondary: 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border border-slate-200 shadow-lg hover:from-slate-100 hover:to-slate-200 hover:shadow-xl focus:ring-slate-500 active:scale-95',
    outline: 'bg-transparent text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 focus:ring-blue-500 active:scale-95',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-700 focus:ring-slate-500 active:scale-95',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:from-red-700 hover:to-red-800 hover:shadow-xl focus:ring-red-500 active:scale-95',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:from-green-700 hover:to-emerald-700 hover:shadow-xl focus:ring-green-500 active:scale-95'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-xs gap-1.5',
    md: 'px-4 py-3 text-sm gap-2',
    lg: 'px-6 py-4 text-base gap-2.5',
    xl: 'px-8 py-5 text-lg gap-3'
  };

  const widthClasses = fullWidth ? 'w-full' : '';

  const renderIcon = (position: 'left' | 'right') => {
    if (loading && position === 'left') {
      return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />;
    }
    
    if (Icon && iconPosition === position) {
      return <Icon className="w-4 h-4" />;
    }
    
    if (showArrow && position === 'right') {
      return <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />;
    }
    
    return null;
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        group
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClasses}
        ${className}
      `}
    >
      {renderIcon('left')}
      <span>{children}</span>
      {renderIcon('right')}
    </button>
  );
};

export default Button;