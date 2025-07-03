import React, { useState, useRef, useEffect } from 'react';
import { 
  Cog6ToothIcon,
  ChevronDownIcon,
  CheckIcon,
  ArrowPathIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';

export interface ColumnConfig {
  key: string;
  label: string;
  width?: number;
  visible: boolean;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  required?: boolean; // Cannot be hidden
  group?: 'core' | 'user' | 'status' | 'dates' | 'meta';
}

export interface ViewPreset {
  name: string;
  description: string;
  columns: string[];
  isCustom?: boolean;
}

interface ColumnVisibilityControlProps {
  columns: ColumnConfig[];
  onColumnVisibilityChange: (columns: ColumnConfig[]) => void;
  presets?: ViewPreset[];
  onPresetSelect?: (preset: ViewPreset) => void;
  onSaveCustomView?: (name: string, columns: string[]) => void;
  className?: string;
}

const defaultPresets: ViewPreset[] = [
  {
    name: 'minimal',
    description: 'Minimal View',
    columns: ['checkbox', 'id', 'title', 'status', 'priority']
  },
  {
    name: 'standard',
    description: 'Standard View',
    columns: ['checkbox', 'id', 'title', 'requester', 'status', 'priority', 'assignedTo', 'createdDate']
  },
  {
    name: 'detailed',
    description: 'Detailed View',
    columns: ['checkbox', 'id', 'title', 'requester', 'status', 'priority', 'service', 'assignedTo', 'createdDate', 'dueDate', 'branch']
  },
  {
    name: 'all',
    description: 'All Columns',
    columns: ['checkbox', 'id', 'title', 'requester', 'status', 'priority', 'service', 'assignedTo', 'createdDate', 'dueDate', 'attachments', 'branch', 'department']
  }
];

const ColumnVisibilityControl: React.FC<ColumnVisibilityControlProps> = ({
  columns,
  onColumnVisibilityChange,
  presets = defaultPresets,
  onPresetSelect,
  onSaveCustomView,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [customViewName, setCustomViewName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSaveDialog(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColumnToggle = (columnKey: string) => {
    const updatedColumns = columns.map(col => 
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    );
    onColumnVisibilityChange(updatedColumns);
  };

  const handlePresetSelect = (preset: ViewPreset) => {
    const updatedColumns = columns.map(col => ({
      ...col,
      visible: preset.columns.includes(col.key) || col.required || false
    }));
    onColumnVisibilityChange(updatedColumns);
    onPresetSelect?.(preset);
    setIsOpen(false);
  };

  const handleResetToDefault = () => {
    const defaultPreset = presets.find(p => p.name === 'standard');
    if (defaultPreset) {
      handlePresetSelect(defaultPreset);
    }
  };

  const handleSaveCustomView = () => {
    if (customViewName.trim() && onSaveCustomView) {
      const visibleColumns = columns.filter(col => col.visible).map(col => col.key);
      onSaveCustomView(customViewName.trim(), visibleColumns);
      setCustomViewName('');
      setShowSaveDialog(false);
      setIsOpen(false);
    }
  };

  const getVisibleColumnsCount = () => columns.filter(col => col.visible).length;
  const getTotalColumnsCount = () => columns.length;

  const groupedColumns = columns.reduce((groups, col) => {
    const group = col.group || 'meta';
    if (!groups[group]) groups[group] = [];
    groups[group].push(col);
    return groups;
  }, {} as Record<string, ColumnConfig[]>);

  const groupLabels = {
    core: 'Core Information',
    user: 'User Information',
    status: 'Status & Priority',
    dates: 'Dates & Timeline',
    meta: 'Additional Details'
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        title={`Manage columns (${getVisibleColumnsCount()}/${getTotalColumnsCount()} visible)`}
      >
        <Cog6ToothIcon className="w-4 h-4 mr-2" />
        <span>Columns</span>
        <span className="ml-1 text-xs text-gray-500">
          ({getVisibleColumnsCount()}/{getTotalColumnsCount()})
        </span>
        <ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4">
            {/* Quick Presets */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Quick Presets</h4>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetSelect(preset)}
                    className="px-3 py-2 text-sm text-left border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{preset.description}</div>
                    <div className="text-xs text-gray-500">
                      {preset.columns.length} columns
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-gray-200 mb-4" />

            {/* Individual Columns */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Individual Columns</h4>
              <div className="space-y-3">
                {Object.entries(groupedColumns).map(([groupKey, groupColumns]) => (
                  <div key={groupKey}>
                    <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      {groupLabels[groupKey as keyof typeof groupLabels] || groupKey}
                    </h5>
                    <div className="space-y-1">
                      {groupColumns.map((column) => (
                        <label
                          key={column.key}
                          className={`flex items-center px-2 py-1 rounded text-sm cursor-pointer hover:bg-gray-50 ${
                            column.required ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={column.visible}
                            onChange={() => !column.required && handleColumnToggle(column.key)}
                            disabled={column.required}
                            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className={`flex-1 ${column.visible ? 'text-gray-900' : 'text-gray-500'}`}>
                            {column.label}
                          </span>
                          {column.required && (
                            <span className="text-xs text-gray-400 ml-1">(required)</span>
                          )}
                          {column.visible && (
                            <CheckIcon className="w-4 h-4 text-green-500 ml-1" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-gray-200 mb-4" />

            {/* Save Custom View */}
            {!showSaveDialog ? (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none"
                  disabled={!onSaveCustomView}
                >
                  <BookmarkIcon className="w-4 h-4 mr-1" />
                  Save as Custom View
                </button>
                <button
                  onClick={handleResetToDefault}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 focus:outline-none"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-1" />
                  Reset to Default
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Custom View Name
                </label>
                <input
                  type="text"
                  value={customViewName}
                  onChange={(e) => setCustomViewName(e.target.value)}
                  placeholder="Enter view name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveCustomView();
                    if (e.key === 'Escape') setShowSaveDialog(false);
                  }}
                  autoFocus
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowSaveDialog(false)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCustomView}
                    disabled={!customViewName.trim()}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnVisibilityControl;