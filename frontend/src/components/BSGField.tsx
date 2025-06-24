// Individual BSG Field Component with React.memo to prevent focus loss
import React, { useCallback, useEffect, useRef, useState } from 'react';
import CurrencyInput from 'react-currency-input-field';
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
  id?: number;
  value: string;
  label: string;
  isDefault?: boolean;
  sortOrder?: number;
  displayName?: string;
  name?: string;
}

interface BSGFieldProps {
  field: BSGTemplateField;
  value: any;
  error?: string;
  onChange: (fieldName: string, value: any) => void;
  disabled?: boolean;
  masterData?: BSGFieldOption[];
  loading?: boolean;
}

const BSGField: React.FC<BSGFieldProps> = ({
  field,
  value,
  error,
  onChange,
  disabled = false,
  masterData = [],
  loading = false
}) => {
  // Use refs to maintain direct DOM control and prevent React re-render issues
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);
  const onChangeRef = useRef(onChange);
  const currentValueRef = useRef(value || '');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep onChange ref current without causing re-renders
  onChangeRef.current = onChange;

  // Update DOM value directly when prop changes, preserving focus
  useEffect(() => {
    const newValue = value || '';
    currentValueRef.current = newValue;
    
    if (inputRef.current && inputRef.current.value !== newValue) {
      // Only update DOM if the value actually changed and element is not focused
      if (document.activeElement !== inputRef.current) {
        inputRef.current.value = newValue;
      }
    }
  }, [value]);

  // Debounced sync to parent
  const syncToParent = useCallback((newValue: any) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      onChangeRef.current(field.fieldName, newValue);
    }, 300); // Increased debounce to 300ms
  }, [field.fieldName]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Get default value for date fields
  const getDefaultValue = () => {
    if (value) return value;
    
    // Set today's date as default for date and datetime fields
    if (field.fieldType === 'date') {
      const defaultDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      // Sync default to parent immediately
      setTimeout(() => onChange(field.fieldName, defaultDate), 0);
      return defaultDate;
    } else if (field.fieldType === 'datetime') {
      const defaultDateTime = new Date().toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format
      // Sync default to parent immediately
      setTimeout(() => onChange(field.fieldName, defaultDateTime), 0);
      return defaultDateTime;
    }
    
    return '';
  };

  const categoryColor = FIELD_CATEGORY_COLORS[field.category || 'reference'];

  const baseClasses = `
    block w-full px-4 py-3 border rounded-xl shadow-sm transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${categoryColor}
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
  `;

  // Check if field is specifically a card number field that needs formatting
  const isCardNumberField = () => {
    const fieldName = field.fieldName.toLowerCase();
    const fieldLabel = field.fieldLabel.toLowerCase();
    
    // Only apply to actual card number fields, not account numbers
    return (fieldName.includes('kartu') && fieldName.includes('nomor')) || 
           (fieldName.includes('card') && fieldName.includes('number')) ||
           (fieldLabel.includes('kartu') && fieldLabel.includes('nomor')) ||
           (fieldLabel.includes('card') && fieldLabel.includes('number')) ||
           fieldName === 'cardnumber' || fieldName === 'nomorkartu' ||
           fieldLabel === 'nomor kartu' || fieldLabel === 'card number';
  };

  // Format card number with 4-digit groups
  const formatCardNumber = (value: string): string => {
    if (!isCardNumberField()) return value;
    
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    
    // Add dashes every 4 digits
    const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1-');
    
    return formatted;
  };

  // Get unformatted value for API submission
  const getUnformattedValue = (value: string): string => {
    if (!isCardNumberField()) return value;
    return value.replace(/\D/g, ''); // Remove all non-digit characters
  };

  // Currency formatting is now handled by react-currency-input-field

  // Handle input changes with card number formatting (currency handled by CurrencyInput)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let newValue = e.target.value;
    
    // Apply card number formatting if applicable
    if (isCardNumberField() && e.target instanceof HTMLInputElement) {
      const formatted = formatCardNumber(newValue);
      e.target.value = formatted; // Update display
      newValue = getUnformattedValue(formatted); // Store unformatted value
    }
    
    currentValueRef.current = newValue;
    syncToParent(newValue);
  };

  // State for searchable dropdown (moved to component level)
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<any[]>([]);

  // Effect for filtering options when searchTerm or masterData changes
  useEffect(() => {
    const options = Array.isArray(masterData) ? masterData : [];
    if (searchTerm) {
      const filtered = options.filter(option => {
        const optionText = (option?.label || option?.displayName || option?.name || '').toLowerCase();
        return optionText.includes(searchTerm.toLowerCase());
      });
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, masterData]);

  // Sync external value changes to search term for searchable dropdowns
  useEffect(() => {
    if ((field.fieldType === 'searchable_dropdown' || field.fieldType === 'autocomplete')) {
      if (value !== searchTerm) {
        setSearchTerm(value || '');
      }
    }
  }, [value]);

  // Auto-set today's date for date fields (currency now handled by CurrencyInput)
  useEffect(() => {
    if ((field.fieldType === 'date' || field.fieldType === 'datetime') && !value) {
      const todayValue = field.fieldType === 'date' 
        ? new Date().toISOString().split('T')[0]
        : new Date().toISOString().slice(0, 16);
      onChange(field.fieldName, todayValue);
    }
  }, [field.fieldType, field.fieldName, value, onChange]);

  // Render searchable dropdown with autocomplete functionality
  const renderSearchableDropdown = () => {
    const options = Array.isArray(masterData) ? masterData : [];

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newSearchTerm = e.target.value;
      setSearchTerm(newSearchTerm);
      setIsOpen(true);
      
      // If user is typing their own value, set it as the field value
      currentValueRef.current = newSearchTerm;
      syncToParent(newSearchTerm);
    };

    const handleOptionSelect = (option: any) => {
      const selectedValue = option?.label || option?.displayName || option?.name || '';
      setSearchTerm(selectedValue);
      setIsOpen(false);
      currentValueRef.current = selectedValue;
      syncToParent(selectedValue);
    };

    const handleBlur = () => {
      // Close dropdown after a short delay to allow option clicks
      setTimeout(() => setIsOpen(false), 200);
    };

    const displayValue = searchTerm || value || '';

    return (
      <div className="relative">
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          id={field.fieldName}
          type="text"
          value={displayValue}
          onChange={handleSearchChange}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          disabled={disabled || loading}
          placeholder={loading ? 'Loading...' : (field.placeholderText || 'Type to search...')}
          className={baseClasses}
        />
        
        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredOptions.slice(0, 10).map((option, index) => (
              <div
                key={option?.value || index}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleOptionSelect(option)}
              >
                {option?.label || option?.displayName || option?.name || `Option ${index + 1}`}
              </div>
            ))}
            {filteredOptions.length > 10 && (
              <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50">
                +{filteredOptions.length - 10} more options...
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderFieldInput = () => {
    switch (field.fieldType) {
      case 'text':
      case 'text_short':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            id={field.fieldName}
            type="text"
            defaultValue={isCardNumberField() ? formatCardNumber(value || '') : (value || '')}
            onChange={handleChange}
            disabled={disabled}
            maxLength={field.maxLength}
            placeholder={field.placeholderText}
            className={baseClasses}
          />
        );

      case 'number':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            id={field.fieldName}
            type="number"
            defaultValue={value || ''}
            onChange={handleChange}
            disabled={disabled}
            placeholder={field.placeholderText}
            className={baseClasses}
          />
        );

      case 'currency':
        // Use react-currency-input-field for proper currency formatting
        return (
          <div className="relative">
            <CurrencyInput
              id={field.fieldName}
              name={field.fieldName}
              placeholder={field.placeholderText || 'Masukkan nominal transaksi'}
              value={value || ''}
              decimalsLimit={0} // No decimal places for Indonesian Rupiah
              intlConfig={{ locale: 'id-ID', currency: 'IDR' }}
              prefix="Rp "
              groupSeparator="."
              onValueChange={(value: string | undefined) => {
                onChange(field.fieldName, value || '');
              }}
              disabled={disabled}
              className={baseClasses}
              style={{ paddingLeft: '12px' }}
            />
          </div>
        );

      case 'date':
        const dateDisplayValue = value || new Date().toISOString().split('T')[0];
        return (
          <div className="relative">
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              id={field.fieldName}
              type="date"
              value={dateDisplayValue}
              onChange={handleChange}
              disabled={disabled}
              className={baseClasses}
            />
            <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        );

      case 'datetime':
        const datetimeDisplayValue = value || new Date().toISOString().slice(0, 16);
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            id={field.fieldName}
            type="datetime-local"
            value={datetimeDisplayValue}
            onChange={handleChange}
            disabled={disabled}
            className={baseClasses}
          />
        );

      case 'searchable_dropdown':
      case 'autocomplete':
        return renderSearchableDropdown();

      case 'dropdown_branch':
      case 'dropdown_olibs_menu':
      case 'dropdown_atm':
      case 'dropdown_terminal':
      case 'dropdown':
        const options = Array.isArray(masterData) ? masterData : [];
        
        return (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            id={field.fieldName}
            defaultValue={value || ''}
            onChange={handleChange}
            disabled={disabled || loading}
            className={baseClasses}
          >
            <option value="">
              {loading ? 'Loading...' : (field.placeholderText || 'Pilih opsi')}
            </option>
            {options.map((option, index) => (
              <option key={option?.value || index} value={option?.value || ''}>
                {option?.label || option?.displayName || option?.name || `Option ${index + 1}`}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            id={field.fieldName}
            rows={4}
            defaultValue={value || ''}
            onChange={handleChange}
            disabled={disabled}
            placeholder={field.placeholderText}
            maxLength={field.maxLength}
            className={baseClasses}
          />
        );

      default:
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            id={field.fieldName}
            type="text"
            defaultValue={value || ''}
            onChange={handleChange}
            disabled={disabled}
            placeholder={field.placeholderText}
            className={baseClasses}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={field.fieldName} className="block text-sm font-medium text-gray-700">
        {field.fieldLabel}
        {field.isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {renderFieldInput()}
      
      {field.helpText && (
        <p className="text-sm text-gray-500">{field.helpText}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {field.maxLength && field.fieldType.includes('text') && (
        <p className="text-xs text-gray-400">
          {(currentValueRef.current || '').length}/{field.maxLength} karakter
        </p>
      )}
    </div>
  );
};

// Export without React.memo since we're using uncontrolled components with refs
// This completely eliminates React re-render focus issues
export default BSGField;