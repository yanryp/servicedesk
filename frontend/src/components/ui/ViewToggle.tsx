import React from 'react';
import { 
  TableCellsIcon, 
  Squares2X2Icon,
  InboxIcon
} from '@heroicons/react/24/outline';
import {
  TableCellsIcon as TableCellsIconSolid,
  Squares2X2Icon as Squares2X2IconSolid,
  InboxIcon as InboxIconSolid
} from '@heroicons/react/24/solid';

export type ViewMode = 'inbox' | 'table' | 'kanban';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showInbox?: boolean; // Optional prop to show/hide inbox view
}

const ViewToggle: React.FC<ViewToggleProps> = ({
  currentView,
  onViewChange,
  className = '',
  size = 'md',
  showInbox = false
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const baseButtonClasses = `
    inline-flex items-center justify-center font-medium transition-all duration-200
    border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10
    ${sizeClasses[size]}
  `;

  const activeClasses = 'bg-blue-600 border-blue-600 text-white shadow-md';
  const inactiveClasses = 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50';

  const buttons = [];
  
  // Inbox button (only if showInbox is true)
  if (showInbox) {
    buttons.push(
      <button
        key="inbox"
        onClick={() => onViewChange('inbox')}
        className={`
          ${baseButtonClasses}
          ${buttons.length === 0 ? 'rounded-l-lg' : ''} border-r-0
          ${currentView === 'inbox' ? activeClasses : inactiveClasses}
        `}
        title="Inbox view"
        aria-pressed={currentView === 'inbox'}
      >
        {currentView === 'inbox' ? (
          <InboxIconSolid className={`${iconSizes[size]} mr-1.5`} />
        ) : (
          <InboxIcon className={`${iconSizes[size]} mr-1.5`} />
        )}
        Inbox
      </button>
    );
  }
  
  // Table button
  buttons.push(
    <button
      key="table"
      onClick={() => onViewChange('table')}
      className={`
        ${baseButtonClasses}
        ${buttons.length === 0 ? 'rounded-l-lg' : ''} border-r-0
        ${currentView === 'table' ? activeClasses : inactiveClasses}
      `}
      title="Table view"
      aria-pressed={currentView === 'table'}
    >
      {currentView === 'table' ? (
        <TableCellsIconSolid className={`${iconSizes[size]} mr-1.5`} />
      ) : (
        <TableCellsIcon className={`${iconSizes[size]} mr-1.5`} />
      )}
      Table
    </button>
  );
  
  // Kanban button
  buttons.push(
    <button
      key="kanban"
      onClick={() => onViewChange('kanban')}
      className={`
        ${baseButtonClasses}
        rounded-r-lg
        ${currentView === 'kanban' ? activeClasses : inactiveClasses}
      `}
      title="Kanban board view"
      aria-pressed={currentView === 'kanban'}
    >
      {currentView === 'kanban' ? (
        <Squares2X2IconSolid className={`${iconSizes[size]} mr-1.5`} />
      ) : (
        <Squares2X2Icon className={`${iconSizes[size]} mr-1.5`} />
      )}
      Board
    </button>
  );

  return (
    <div className={`inline-flex rounded-lg overflow-hidden shadow-sm ${className}`}>
      {buttons}
    </div>
  );
};

export default ViewToggle;