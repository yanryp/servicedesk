// BSG Dynamic Field Renderer with Individual Memoized Fields
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  DocumentTextIcon 
} from '@heroicons/react/24/outline';
import { api } from '../services/api';
import BSGField from './BSGField';
import IsolatedBSGField from './IsolatedBSGField';

// Field category icons mapping for display names
const FIELD_CATEGORY_ICONS: Record<string, any> = {
  'location': DocumentTextIcon,
  'user_identity': DocumentTextIcon,
  'timing': DocumentTextIcon,
  'transaction': DocumentTextIcon,
  'reference': DocumentTextIcon,
  'customer': DocumentTextIcon,
  'transfer': DocumentTextIcon,
  'permissions': DocumentTextIcon
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
  id?: number;
  value: string;
  label: string;
  isDefault?: boolean;
  sortOrder?: number;
  // Additional properties that might come from master data API
  displayName?: string;
  name?: string;
}

interface BSGDynamicFieldRendererProps {
  templateId: number;
  fields: BSGTemplateField[];
  values: Record<string, any>;
  onChange: (fieldName: string, value: any) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  showCategories?: boolean;
  onMasterDataLoaded?: (masterData: Record<string, BSGFieldOption[]>) => void;
}

const BSGDynamicFieldRenderer: React.FC<BSGDynamicFieldRendererProps> = ({
  templateId,
  fields,
  values,
  onChange,
  errors = {},
  disabled = false,
  showCategories = true,
  onMasterDataLoaded
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
        
        console.log('🔍 BSGDynamicFieldRenderer: Checking fields for dropdowns');
        console.log('🔍 Total fields:', fields.length);
        
        fields.forEach(field => {
          console.log(`🔍 Field: ${field.fieldLabel} (type: ${field.fieldType})`);
        });
        
        const dropdownFields = fields.filter(field => 
          field.fieldType === 'dropdown' ||
          field.fieldType.startsWith('dropdown_') || 
          field.fieldType === 'searchable_dropdown' ||
          field.fieldType === 'autocomplete'
        );
        
        console.log(`🔽 Found ${dropdownFields.length} dropdown fields`);
        dropdownFields.forEach(field => {
          console.log(`🔽 Dropdown field: ${field.fieldLabel} (type: ${field.fieldType})`);
        });

        const masterDataPromises = dropdownFields.map(async field => {
          // Determine the data type for API call
          let dataType = field.fieldType.replace('dropdown_', '');
          
          const fieldName = field.fieldName.toLowerCase();
          const fieldLabel = field.fieldLabel.toLowerCase();
          
          // Special mapping for Unit fields (converted from Cabang/Capem)
          if (field.fieldType === 'searchable_dropdown' || field.fieldType === 'autocomplete') {
            // If this is a Unit field (converted from Cabang/Capem), use 'unit' data type
            if (fieldLabel === 'unit' || fieldName.includes('unit') ||
                fieldName.includes('cabang') || fieldName.includes('capem') ||
                fieldLabel.includes('cabang') || fieldLabel.includes('capem')) {
              dataType = 'unit';
              console.log(`🏢 Detected Unit field: ${field.fieldLabel}, using 'unit' data type`);
            } else {
              // For other searchable dropdown fields, try to infer from field name
              dataType = fieldName.replace(/[^a-z]/g, '') || 'generic';
            }
          } else if (field.fieldType === 'dropdown') {
            // Handle basic dropdown fields - comprehensive field type mapping
            if (fieldLabel.includes('olibs') || fieldLabel.includes('olib') || fieldName.includes('olibs') || fieldName.includes('olib')) {
              dataType = 'olibs';
              console.log(`🏛️ Detected OLIBS field: ${field.fieldLabel}, using 'olibs' data type`);
            } else if (fieldLabel.includes('program') && fieldLabel.includes('fasilitas')) {
              dataType = 'olibs'; // Program Fasilitas OLIBS should use olibs data type
              console.log(`🏛️ Detected Program Fasilitas field: ${field.fieldLabel}, using 'olibs' data type`);
            } else if (fieldLabel.includes('government') || fieldLabel.includes('pemerintah') || fieldName.includes('government')) {
              dataType = 'government_entity';
              console.log(`🏛️ Detected Government field: ${field.fieldLabel}, using 'government_entity' data type`);
            } else if (fieldLabel.includes('access') && fieldLabel.includes('level')) {
              dataType = 'access_level';
              console.log(`🔑 Detected Access Level field: ${field.fieldLabel}, using 'access_level' data type`);
            } else if (fieldLabel.includes('request') && fieldLabel.includes('type')) {
              dataType = 'request_type';
              console.log(`📝 Detected Request Type field: ${field.fieldLabel}, using 'request_type' data type`);
            } else if (fieldLabel.includes('menu') || fieldName.includes('menu')) {
              dataType = 'olibs'; // Menu fields typically relate to OLIBS
              console.log(`📋 Detected Menu field: ${field.fieldLabel}, using 'olibs' data type`);
            } else if (fieldLabel.includes('authority') || fieldLabel.includes('wewenang')) {
              dataType = 'authority_level';
              console.log(`👤 Detected Authority field: ${field.fieldLabel}, using 'authority_level' data type`);
            } else if (fieldLabel.includes('treasury') || fieldLabel.includes('kas')) {
              dataType = 'treasury_account';
              console.log(`💰 Detected Treasury field: ${field.fieldLabel}, using 'treasury_account' data type`);
            } else if (fieldLabel.includes('budget') || fieldLabel.includes('anggaran')) {
              dataType = 'budget_code';
              console.log(`💼 Detected Budget field: ${field.fieldLabel}, using 'budget_code' data type`);
            } else {
              // For other basic dropdown fields, try to infer from field name
              dataType = fieldName.replace(/[^a-z]/g, '') || 'generic';
              console.log(`🔽 Generic dropdown field: ${field.fieldLabel}, using '${dataType}' data type`);
            }
          }
          
          try {
            console.log(`🔽 Loading master data for field: ${field.fieldLabel} (type: ${field.fieldType}) -> API dataType: ${dataType}`);
            const response = await api.get(`/bsg-templates/master-data/${dataType}`);
            // Extract data from API response format: { success: true, data: [...], meta: {...} }
            const options = Array.isArray(response?.data) ? response.data : [];
            console.log(`✅ Loaded ${options.length} options for ${field.fieldLabel}`, options.slice(0, 2));
            return { fieldName: field.fieldName, options: options };
          } catch (error: any) {
            console.error(`❌ Failed to load master data for ${field.fieldLabel}:`, error);
            
            // Handle specific error cases
            if (error?.response?.status === 404) {
              console.warn(`⚠️ Master data endpoint not found for type '${dataType}'. Field: ${field.fieldLabel}`);
            } else if (error?.response?.status === 403) {
              console.warn(`🔒 Access denied to master data for type '${dataType}'. User may not have permissions.`);
            } else {
              console.warn(`🌐 Network or server error loading master data for type '${dataType}':`, error.message);
            }
            
            // Return empty options but log the issue for debugging
            return { fieldName: field.fieldName, options: [], error: error.message };
          }
        });

        const results = await Promise.all(masterDataPromises);
        const masterDataMap: Record<string, BSGFieldOption[]> = {};
        
        results.forEach(result => {
          // Ensure options is always an array
          const options = Array.isArray(result.options) ? result.options : [];
          masterDataMap[result.fieldName] = options;
          console.log(`📝 Stored ${options.length} options for field: ${result.fieldName}`);
        });

        setMasterData(masterDataMap);
        
        // Notify parent that master data is loaded
        if (onMasterDataLoaded) {
          onMasterDataLoaded(masterDataMap);
        }
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

  // Date defaults are now handled by GlobalStorageField components directly
  // No need for React state management here anymore

  // Memoized field change handler to prevent re-renders
  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    onChange(fieldName, value);
  }, [onChange]);

  // No longer needed - using individual BSGField components

  // Render fields grouped by category (non-memoized to avoid focus issues)
  const renderFieldsByCategory = () => {
    if (!showCategories) {
      // Render all fields in a single list
      const allFields = [...fields].sort((a, b) => a.sortOrder - b.sortOrder);
      return (
        <div className="space-y-6">
          {allFields.map(field => (
            <div key={field.fieldName}>
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
                  <div key={field.fieldName} className="col-span-1">
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

  // Render field with React state (proper integration with parent form)
  const renderFieldWithLabel = (field: BSGTemplateField) => {
    const fieldError = errors[field.fieldName];
    const fieldMasterData = masterData[field.fieldName] || [];
    const fieldValue = values[field.fieldName] || '';
    
    // Field value lookup completed
    
    return (
      <BSGField
        key={field.fieldName} // Use stable fieldName as key
        field={field}
        value={fieldValue}
        onChange={handleFieldChange}
        error={fieldError}
        disabled={disabled}
        masterData={fieldMasterData}
        loading={loading && (field.fieldType.startsWith('dropdown_') || field.fieldType === 'searchable_dropdown' || field.fieldType === 'autocomplete')}
      />
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

  if (loading && fields.some(f => f.fieldType.startsWith('dropdown_') || f.fieldType === 'searchable_dropdown' || f.fieldType === 'autocomplete')) {
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

// Memoize the entire component to prevent unnecessary re-renders
export default React.memo(BSGDynamicFieldRenderer, (prevProps, nextProps) => {
  // Only re-render if fields array actually changes (not just reference)
  if (prevProps.fields.length !== nextProps.fields.length) return false;
  if (prevProps.templateId !== nextProps.templateId) return false;
  if (prevProps.disabled !== nextProps.disabled) return false;
  if (prevProps.showCategories !== nextProps.showCategories) return false;
  
  // IMPORTANT: Re-render when values change (for auto-fill to work)
  if (JSON.stringify(prevProps.values) !== JSON.stringify(nextProps.values)) return false;
  
  // Compare fields by their IDs and types (ignore other props that cause re-renders)
  const fieldsChanged = prevProps.fields.some((field, index) => {
    const nextField = nextProps.fields[index];
    return field.id !== nextField?.id || field.fieldType !== nextField?.fieldType;
  });
  
  return !fieldsChanged;
});