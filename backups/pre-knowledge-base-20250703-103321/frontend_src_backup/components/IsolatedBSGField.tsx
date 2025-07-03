// Completely Isolated BSG Field Component
// This component uses manual DOM manipulation and avoids ALL React re-renders
import React, { useRef, useEffect } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';

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

interface IsolatedBSGFieldProps {
  field: BSGTemplateField;
  initialValue: any;
  error?: string;
  onChange: (fieldName: string, value: any) => void;
  disabled?: boolean;
  masterData?: BSGFieldOption[];
  loading?: boolean;
}

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

const IsolatedBSGField: React.FC<IsolatedBSGFieldProps> = ({
  field,
  initialValue,
  error,
  onChange,
  disabled = false,
  masterData = [],
  loading = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputElementRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Escape field name for use in DOM IDs and selectors
  const escapeFieldName = (name: string) => {
    return name.replace(/[\/\s\.\[\]#:]/g, '_');
  };

  const safeFieldName = escapeFieldName(field.fieldName);

  const categoryColor = FIELD_CATEGORY_COLORS[field.category || 'reference'];
  const baseClasses = `
    block w-full px-4 py-3 border rounded-xl shadow-sm transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${categoryColor}
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
  `;

  // Manual DOM creation and management
  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;

    const container = containerRef.current;
    
    // Clear any existing content
    container.innerHTML = '';

    // Create label
    const labelElement = document.createElement('label');
    labelElement.htmlFor = safeFieldName;
    labelElement.className = 'block text-sm font-medium text-gray-700';
    labelElement.innerHTML = `${field.fieldLabel}${field.isRequired ? '<span class="text-red-500 ml-1">*</span>' : ''}`;
    container.appendChild(labelElement);

    // Create field wrapper
    const fieldWrapper = document.createElement('div');
    fieldWrapper.className = 'mt-1';
    
    let inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

    // Create input based on field type
    switch (field.fieldType) {
      case 'text':
      case 'text_short':
        inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.maxLength = field.maxLength || 255;
        break;

      case 'number':
        inputElement = document.createElement('input');
        inputElement.type = 'number';
        break;

      case 'currency':
        // Create currency wrapper
        const currencyWrapper = document.createElement('div');
        currencyWrapper.className = 'relative';
        
        const currencyPrefix = document.createElement('div');
        currencyPrefix.className = 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none';
        currencyPrefix.innerHTML = '<span class="text-gray-500 sm:text-sm">Rp</span>';
        
        inputElement = document.createElement('input');
        inputElement.type = 'number';
        inputElement.step = '0.01';
        inputElement.className = `${baseClasses} pl-12`;
        
        currencyWrapper.appendChild(currencyPrefix);
        currencyWrapper.appendChild(inputElement);
        fieldWrapper.appendChild(currencyWrapper);
        break;

      case 'date':
        // Create date wrapper with icon
        const dateWrapper = document.createElement('div');
        dateWrapper.className = 'relative';
        
        inputElement = document.createElement('input');
        inputElement.type = 'date';
        
        // Add calendar icon (simplified)
        const calendarIcon = document.createElement('div');
        calendarIcon.className = 'absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none';
        calendarIcon.innerHTML = '📅'; // Simple emoji fallback
        
        dateWrapper.appendChild(inputElement);
        dateWrapper.appendChild(calendarIcon);
        fieldWrapper.appendChild(dateWrapper);
        break;

      case 'datetime':
        inputElement = document.createElement('input');
        inputElement.type = 'datetime-local';
        break;

      case 'dropdown_branch':
      case 'dropdown_olibs_menu':
      case 'dropdown_atm':
      case 'dropdown_terminal':
      case 'dropdown':
        inputElement = document.createElement('select');
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = loading ? 'Loading...' : (field.placeholderText || 'Pilih opsi');
        inputElement.appendChild(defaultOption);
        
        // Add data options
        const options = Array.isArray(masterData) ? masterData : [];
        options.forEach((option, index) => {
          const optionElement = document.createElement('option');
          optionElement.value = option?.value || '';
          optionElement.textContent = option?.label || option?.displayName || option?.name || `Option ${index + 1}`;
          inputElement.appendChild(optionElement);
        });
        break;

      case 'textarea':
        inputElement = document.createElement('textarea');
        (inputElement as HTMLTextAreaElement).rows = 4;
        inputElement.maxLength = field.maxLength || 1000;
        break;

      default:
        inputElement = document.createElement('input');
        inputElement.type = 'text';
        break;
    }

    // Set common properties
    inputElement.id = safeFieldName;
    inputElement.disabled = disabled;
    inputElement.value = initialValue || '';
    
    // Set placeholder only for input and textarea elements
    if (inputElement instanceof HTMLInputElement || inputElement instanceof HTMLTextAreaElement) {
      inputElement.placeholder = field.placeholderText || '';
    }
    
    // Apply classes if not already set (for currency field)
    if (!inputElement.className) {
      inputElement.className = baseClasses;
    }

    // Add change listener with debouncing
    const handleChange = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const newValue = target.value;

      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Debounced onChange call
      debounceTimeoutRef.current = setTimeout(() => {
        onChange(field.fieldName, newValue);
      }, 500); // Even longer debounce
    };

    inputElement.addEventListener('input', handleChange);
    inputElement.addEventListener('change', handleChange);

    // Store reference for cleanup
    inputElementRef.current = inputElement;

    // Add to DOM only if not currency (currency already added above)
    if (field.fieldType !== 'currency' && field.fieldType !== 'date') {
      fieldWrapper.appendChild(inputElement);
    }
    
    if (field.fieldType !== 'currency' && field.fieldType !== 'date') {
      container.appendChild(fieldWrapper);
    } else {
      container.appendChild(fieldWrapper);
    }

    // Add help text if exists
    if (field.helpText) {
      const helpElement = document.createElement('p');
      helpElement.className = 'text-sm text-gray-500 mt-1';
      helpElement.textContent = field.helpText;
      container.appendChild(helpElement);
    }

    // Add error message
    if (error) {
      const errorElement = document.createElement('p');
      errorElement.className = 'text-sm text-red-600 mt-1';
      errorElement.textContent = error;
      errorElement.id = `${safeFieldName}-error`;
      container.appendChild(errorElement);
    }

    // Add character counter for text fields
    if (field.maxLength && field.fieldType.includes('text')) {
      const counterElement = document.createElement('p');
      counterElement.className = 'text-xs text-gray-400 mt-1';
      counterElement.id = `${safeFieldName}-counter`;
      
      const updateCounter = () => {
        const currentLength = inputElement.value.length;
        counterElement.textContent = `${currentLength}/${field.maxLength} karakter`;
      };
      
      updateCounter();
      inputElement.addEventListener('input', updateCounter);
      container.appendChild(counterElement);
    }

    isInitializedRef.current = true;

    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (inputElementRef.current) {
        inputElementRef.current.removeEventListener('input', handleChange);
        inputElementRef.current.removeEventListener('change', handleChange);
      }
    };
  }, []); // Empty dependency array - only run once!

  // Update error state manually
  useEffect(() => {
    if (!containerRef.current) return;
    
    const existingError = containerRef.current.querySelector(`#${safeFieldName}-error`);
    
    if (error && !existingError) {
      const errorElement = document.createElement('p');
      errorElement.className = 'text-sm text-red-600 mt-1';
      errorElement.textContent = error;
      errorElement.id = `${safeFieldName}-error`;
      containerRef.current.appendChild(errorElement);
    } else if (!error && existingError) {
      existingError.remove();
    } else if (error && existingError) {
      existingError.textContent = error;
    }
  }, [error, safeFieldName]);

  // Simple prop update handling - only update if not focused
  useEffect(() => {
    if (!inputElementRef.current || !isInitializedRef.current) return;
    
    const inputElement = inputElementRef.current;
    const newValue = initialValue || '';
    
    // Only update if this specific input is not focused
    if (document.activeElement !== inputElement && inputElement.value !== newValue) {
      console.log(`🔄 Updating field ${field.fieldName}: "${inputElement.value}" → "${newValue}"`);
      inputElement.value = newValue;
    }
  }, [initialValue, field.fieldName]);

  return <div ref={containerRef} className="space-y-2" />;
};

export default IsolatedBSGField;