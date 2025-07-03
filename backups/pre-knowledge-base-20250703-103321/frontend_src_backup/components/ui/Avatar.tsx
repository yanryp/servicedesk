// src/components/ui/Avatar.tsx
import React from 'react';
import { UserIcon } from '@heroicons/react/24/outline';

interface AvatarProps {
  name?: string;
  username?: string;
  email?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'circle' | 'rounded' | 'square';
  fallbackVariant?: 'initials' | 'icon' | 'gradient';
  className?: string;
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  name,
  username,
  email,
  src,
  size = 'md',
  variant = 'circle',
  fallbackVariant = 'initials',
  className = '',
  onClick
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl'
  };

  const variantClasses = {
    circle: 'rounded-full',
    rounded: 'rounded-lg',
    square: 'rounded-none'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10'
  };

  const getInitials = () => {
    if (name) {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (username) {
      return username.charAt(0).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getGradientColors = () => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-indigo-400 to-indigo-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600',
      'from-teal-400 to-teal-600'
    ];
    
    const identifier = name || username || email || '';
    const index = identifier.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const baseClasses = `
    inline-flex items-center justify-center
    font-semibold text-white
    transition-all duration-200
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''}
    ${className}
  `;

  if (src) {
    return (
      <img
        src={src}
        alt={name || username || 'User'}
        onClick={onClick}
        className={`${baseClasses} object-cover`}
      />
    );
  }

  if (fallbackVariant === 'icon') {
    return (
      <div
        onClick={onClick}
        className={`${baseClasses} bg-gradient-to-r from-slate-400 to-slate-600`}
      >
        <UserIcon className={iconSizes[size]} />
      </div>
    );
  }

  if (fallbackVariant === 'gradient') {
    return (
      <div
        onClick={onClick}
        className={`${baseClasses} bg-gradient-to-r ${getGradientColors()}`}
      >
        {getInitials()}
      </div>
    );
  }

  // Default: initials
  return (
    <div
      onClick={onClick}
      className={`${baseClasses} bg-gradient-to-r from-slate-400 to-slate-600`}
    >
      {getInitials()}
    </div>
  );
};

export default Avatar;