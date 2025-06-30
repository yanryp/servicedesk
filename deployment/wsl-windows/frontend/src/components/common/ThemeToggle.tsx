// ThemeToggle.tsx
// Modern theme toggle button with 2025 UI/UX design
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon 
} from '@heroicons/react/24/outline';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '',
  showLabel = false,
  compact = false
}) => {
  const { theme, toggleTheme, resolvedTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <SunIcon className="w-5 h-5" />;
      case 'dark':
        return <MoonIcon className="w-5 h-5" />;
      case 'system':
        return <ComputerDesktopIcon className="w-5 h-5" />;
      default:
        return <SunIcon className="w-5 h-5" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'Light';
    }
  };

  const getNextLabel = () => {
    switch (theme) {
      case 'light':
        return 'Switch to dark mode';
      case 'dark':
        return 'Switch to system mode';
      case 'system':
        return 'Switch to light mode';
      default:
        return 'Switch theme';
    }
  };

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        title={getNextLabel()}
        className={`
          relative p-2 rounded-lg transition-all duration-200
          bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
          hover:bg-white dark:hover:bg-gray-800
          border border-gray-200/50 dark:border-gray-700/50
          text-gray-600 dark:text-gray-400
          hover:text-gray-900 dark:hover:text-gray-100
          shadow-soft hover:shadow-medium
          ${className}
        `}
      >
        <div className="flex items-center justify-center">
          {getIcon()}
        </div>
        
        {/* Subtle indicator for current resolved theme */}
        <div className={`
          absolute -bottom-1 -right-1 w-2 h-2 rounded-full transition-colors duration-200
          ${resolvedTheme === 'dark' ? 'bg-blue-500' : 'bg-yellow-500'}
        `} />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      title={getNextLabel()}
      className={`
        flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200
        bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
        hover:bg-white dark:hover:bg-gray-800
        border border-gray-200/50 dark:border-gray-700/50
        text-gray-600 dark:text-gray-400
        hover:text-gray-900 dark:hover:text-gray-100
        shadow-soft hover:shadow-medium
        ${className}
      `}
    >
      <div className="flex items-center justify-center">
        {getIcon()}
      </div>
      
      {showLabel && (
        <span className="text-sm font-medium">
          {getLabel()}
        </span>
      )}
      
      {/* Theme transition indicator */}
      <div className={`
        w-1 h-1 rounded-full transition-all duration-300
        ${resolvedTheme === 'dark' ? 'bg-blue-500 scale-125' : 'bg-yellow-500 scale-125'}
      `} />
    </button>
  );
};

export default ThemeToggle;