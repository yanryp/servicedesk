// BSG Dynamic Field Renderer with Optimized Common Fields
import React, { useState, useEffect, useMemo } from 'react';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UserIcon, 
  CurrencyDollarIcon,
  DocumentTextIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';

// Field category icons mapping
const FIELD_CATEGORY_ICONS: Record<string, any> = {
  'location': MapPinIcon,
  'user_identity': UserIcon,
  'timing': ClockIcon,
  'transaction': CurrencyDollarIcon,
  'reference': DocumentTextIcon,
  'customer': UserIcon,
  'transfer': MapPinIcon,
  'permissions': DocumentTextIcon
};

// Field category colors
const FIELD_CATEGORY_COLORS: Record<string, string> = {
  'location': 'border-blue-300 focus:border-blue-500',
  'user_identity': 'border-green-300 focus:border-green-500',
  'timing': 'border-purple-300 focus:border-purple-500',
  'transaction': 'border-yellow-300 focus:border-yellow-500',
  'reference': 'border-gray-300 focus:border-gray-500',
  'customer': 'border-indigo-300 focus:border-indigo-500',
  'transfer': 'border-orange-300 focus:border-orange-500',
  'permissions': 'border-red-300 focus:border-red-500'
};

interface BSGTemplateField {
  id: number;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  isRequired: boolean;
  description?: string;
  placeholderText?: string;
  helpText?: string;
  maxLength?: number;
  validationRules?: any;
  sortOrder: number;
  options?: BSGFieldOption[];
  category?: string;
}

interface BSGFieldOption {
  id: number;
  value: string;
  label: string;
  isDefault?: boolean;
  sortOrder: number;
}

interface BSGDynamicFieldRendererProps {
  templateId: number;
  fields: BSGTemplateField[];
  values: Record<string, any>;
  onChange: (fieldName: string, value: any) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  showCategories?: boolean;
}

const BSGDynamicFieldRenderer: React.FC<BSGDynamicFieldRendererProps> = ({
  templateId,
  fields,
  values,
  onChange,
  errors = {},
  disabled = false,
  showCategories = true
}) => {
  const [masterData, setMasterData] = useState<Record<string, BSGFieldOption[]>>({});
  const [loading, setLoading] = useState(true);

  // Group fields by category for organized display
  const fieldsByCategory = useMemo(() => {
    const grouped: Record<string, BSGTemplateField[]> = {};
    
    fields.forEach(field => {
      const category = field.category || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(field);
    });

    // Sort fields within each category by sortOrder
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => a.sortOrder - b.sortOrder);
    });

    return grouped;
  }, [fields]);

  // Load master data for dropdown fields
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        setLoading(true);
        const dropdownFields = fields.filter(field => 
          field.fieldType.startsWith('dropdown_')
        );

        const masterDataPromises = dropdownFields.map(async field => {
          const dataType = field.fieldType.replace('dropdown_', '');
          const response = await fetch(`/api/bsg-templates/master-data/${dataType}`);
          if (response.ok) {
            const data = await response.json();
            return { fieldName: field.fieldName, options: data };
          }
          return { fieldName: field.fieldName, options: [] };
        });

        const results = await Promise.all(masterDataPromises);
        const masterDataMap: Record<string, BSGFieldOption[]> = {};
        
        results.forEach(result => {
          masterDataMap[result.fieldName] = result.options;
        });

        setMasterData(masterDataMap);
      } catch (error) {
        console.error('Error loading master data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (fields.length > 0) {
      loadMasterData();
    }
  }, [fields]);

  // Set default values for date fields
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const dateTimeNow = new Date().toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format
    
    fields.forEach(field => {
      if ((field.fieldType === 'date' || field.fieldType === 'datetime') && !values[field.fieldName]) {
        const defaultValue = field.fieldType === 'date' ? today : dateTimeNow;
        onChange(field.fieldName, defaultValue);
      }
    });
  }, [fields, values, onChange]);

  // Render individual field based on type
  const renderField = (field: BSGTemplateField) => {
    const fieldValue = values[field.fieldName] || '';
    const fieldError = errors[field.fieldName];
    const categoryColor = FIELD_CATEGORY_COLORS[field.category || 'reference'];
    const CategoryIcon = FIELD_CATEGORY_ICONS[field.category || 'reference'];

    const baseClasses = `
      block w-full px-4 py-3 border rounded-xl shadow-sm transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-opacity-50
      disabled:bg-gray-100 disabled:cursor-not-allowed
      ${categoryColor}
      ${fieldError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
    `;

    const handleFieldChange = (value: any) => {
      onChange(field.fieldName, value);
    };

    switch (field.fieldType) {
      case 'text':
      case 'text_short':
        return (
          <input
            type="text"
            value={fieldValue}
            onChange={(e) => handleFieldChange(e.target.value)}
            disabled={disabled}
            maxLength={field.maxLength}
            placeholder={field.placeholderText}
            className={baseClasses}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={fieldValue}
            onChange={(e) => handleFieldChange(parseInt(e.target.value) || '')}
            disabled={disabled}
            placeholder={field.placeholderText}
            className={baseClasses}
          />
        );

      case 'currency':
        return (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">Rp</span>
            </div>
            <input
              type="number"
              value={fieldValue}
              onChange={(e) => handleFieldChange(parseFloat(e.target.value) || '')}
              disabled={disabled}
              placeholder={field.placeholderText}
              className={`${baseClasses} pl-12`}
              step="0.01"
            />
          </div>
        );

      case 'date':
        return (
          <div className="relative">
            <input
              type="date"
              value={fieldValue}
              onChange={(e) => handleFieldChange(e.target.value)}
              disabled={disabled}
              className={baseClasses}
            />
            <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        );

      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={fieldValue}
            onChange={(e) => handleFieldChange(e.target.value)}
            disabled={disabled}
            className={baseClasses}
          />
        );

      case 'dropdown_branch':
      case 'dropdown_olibs_menu':
        const options = masterData[field.fieldName] || field.options || [];
        return (
          <select
            value={fieldValue}
            onChange={(e) => handleFieldChange(e.target.value)}
            disabled={disabled || loading}
            className={baseClasses}
          >
            <option value="">
              {loading ? 'Loading...' : (field.placeholderText || 'Pilih opsi')}
            </option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            rows={4}
            value={fieldValue}
            onChange={(e) => handleFieldChange(e.target.value)}
            disabled={disabled}
            placeholder={field.placeholderText}
            maxLength={field.maxLength}
            className={baseClasses}
          />
        );

      default:
        return (
          <input
            type="text"
            value={fieldValue}
            onChange={(e) => handleFieldChange(e.target.value)}
            disabled={disabled}
            placeholder={field.placeholderText}
            className={baseClasses}
          />
        );
    }
  };

  // Render fields grouped by category
  const renderFieldsByCategory = () => {
    if (!showCategories) {
      // Render all fields in a single list
      const allFields = fields.sort((a, b) => a.sortOrder - b.sortOrder);
      return (
        <div className="space-y-6">
          {allFields.map(field => (
            <div key={field.id}>
              {renderFieldWithLabel(field)}
            </div>
          ))}
        </div>
      );
    }

    // Render fields grouped by category
    return (
      <div className="space-y-8">
        {Object.entries(fieldsByCategory).map(([category, categoryFields]) => {
          const CategoryIcon = FIELD_CATEGORY_ICONS[category] || DocumentTextIcon;
          const categoryName = getCategoryDisplayName(category);
          
          return (
            <div key={category} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <CategoryIcon className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">{categoryName}</h3>
                <span className="ml-2 text-sm text-gray-500">
                  ({categoryFields.length} field{categoryFields.length !== 1 ? 's' : ''})
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categoryFields.map(field => (
                  <div key={field.id} className="col-span-1">
                    {renderFieldWithLabel(field)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render field with label and help text
  const renderFieldWithLabel = (field: BSGTemplateField) => {
    const fieldError = errors[field.fieldName];
    
    return (
      <div className="space-y-2">
        <label htmlFor={field.fieldName} className="block text-sm font-medium text-gray-700">
          {field.fieldLabel}
          {field.isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {renderField(field)}
        
        {field.helpText && (
          <p className="text-sm text-gray-500">{field.helpText}</p>
        )}
        
        {fieldError && (
          <p className="text-sm text-red-600">{fieldError}</p>
        )}
        
        {field.maxLength && field.fieldType.includes('text') && (
          <p className="text-xs text-gray-400">
            {(values[field.fieldName] || '').length}/{field.maxLength} karakter
          </p>
        )}
      </div>
    );
  };

  // Get display name for category
  const getCategoryDisplayName = (category: string): string => {
    const categoryNames: Record<string, string> = {
      'location': 'Informasi Lokasi',
      'user_identity': 'Identitas User',
      'timing': 'Waktu dan Tanggal',
      'transaction': 'Informasi Transaksi',
      'reference': 'Nomor Referensi',
      'customer': 'Data Nasabah',
      'transfer': 'Mutasi/Transfer',
      'permissions': 'Hak Akses',
      'other': 'Lainnya'
    };
    
    return categoryNames[category] || category;
  };

  if (loading && fields.some(f => f.fieldType.startsWith('dropdown_'))) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading field options...</span>
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No custom fields defined for this template.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Template Fields</h2>
        <span className="text-sm text-gray-500">
          {fields.length} field{fields.length !== 1 ? 's' : ''} • 
          {fields.filter(f => f.isRequired).length} required
        </span>
      </div>
      
      {renderFieldsByCategory()}
    </div>
  );
};

export default BSGDynamicFieldRenderer;