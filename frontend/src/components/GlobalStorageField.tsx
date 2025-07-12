// Field component that uses global storage instead of React props
import React, { useRef, useEffect } from 'react';
import { globalFieldStorage } from '../utils/fieldStorage';

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

interface GlobalStorageFieldProps {
  field: BSGTemplateField;
  error?: string;
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

const GlobalStorageField: React.FC<GlobalStorageFieldProps> = ({
  field,
  error,
  disabled = false,
  masterData = [],
  loading = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputElementRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>(null);
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

  // Create DOM elements once, never update via React
  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;

    console.log(`🏗️ Creating DOM elements for field: ${field.fieldName} (${field.fieldType})`);
    
    const container = containerRef.current;
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
        const dateWrapper = document.createElement('div');
        dateWrapper.className = 'relative';
        
        inputElement = document.createElement('input');
        inputElement.type = 'date';
        
        const calendarIcon = document.createElement('div');
        calendarIcon.className = 'absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none';
        calendarIcon.innerHTML = '📅';
        
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
        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = loading ? 'Loading...' : (field.placeholderText || 'Pilih opsi');
        inputElement.appendChild(defaultOption);
        
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

      case 'checkbox':
        // Create a container for checkboxes
        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = 'space-y-2';
        checkboxContainer.id = safeFieldName;
        
        if (field.options && Array.isArray(field.options) && field.options.length > 0) {
          field.options.forEach((option, index) => {
            const checkboxWrapper = document.createElement('label');
            checkboxWrapper.className = 'flex items-center cursor-pointer';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = safeFieldName;
            checkbox.value = option.value || '';
            checkbox.className = 'h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500';
            
            const label = document.createElement('span');
            label.className = 'ml-2 text-sm text-gray-700';
            label.textContent = option.label || option.displayName || '';
            
            checkboxWrapper.appendChild(checkbox);
            checkboxWrapper.appendChild(label);
            checkboxContainer.appendChild(checkboxWrapper);
            
            // Handle checkbox changes
            checkbox.addEventListener('change', () => {
              const checkedBoxes = checkboxContainer.querySelectorAll('input[type="checkbox"]:checked');
              const values = Array.from(checkedBoxes).map((cb: any) => cb.value);
              globalFieldStorage.setValue(field.fieldName, values.join(','));
            });
          });
        }
        
        fieldWrapper.appendChild(checkboxContainer);
        inputElement = checkboxContainer as any; // Type assertion for compatibility
        break;

      case 'radio':
        // Create a container for radio buttons
        const radioContainer = document.createElement('div');
        radioContainer.className = 'space-y-2';
        radioContainer.id = safeFieldName;
        
        if (field.options && field.options.length > 0) {
          field.options.forEach((option, index) => {
            const radioWrapper = document.createElement('label');
            radioWrapper.className = 'flex items-center cursor-pointer';
            
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = safeFieldName;
            radio.value = option.value || '';
            radio.className = 'h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500';
            
            const label = document.createElement('span');
            label.className = 'ml-2 text-sm text-gray-700';
            label.textContent = option.label || option.displayName || '';
            
            radioWrapper.appendChild(radio);
            radioWrapper.appendChild(label);
            radioContainer.appendChild(radioWrapper);
            
            // Handle radio changes
            radio.addEventListener('change', () => {
              if (radio.checked) {
                globalFieldStorage.setValue(field.fieldName, radio.value);
              }
            });
          });
        }
        
        fieldWrapper.appendChild(radioContainer);
        inputElement = radioContainer as any; // Type assertion for compatibility
        break;

      default:
        inputElement = document.createElement('input');
        inputElement.type = 'text';
        break;
    }

    // Set common properties - only for actual input elements, not containers
    if (field.fieldType !== 'checkbox' && field.fieldType !== 'radio') {
      inputElement.id = safeFieldName;
      inputElement.disabled = disabled;
      
      // Get initial value from global storage or set default for date fields
      let initialValue = globalFieldStorage.getValue(field.fieldName) || '';
      
      // Set today's date as default for date and datetime fields if no value exists
      if (!initialValue && (field.fieldType === 'date' || field.fieldType === 'datetime')) {
        if (field.fieldType === 'date') {
          initialValue = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        } else if (field.fieldType === 'datetime') {
          initialValue = new Date().toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format
        }
        
        // Store the default value in global storage
        globalFieldStorage.setValue(field.fieldName, initialValue);
        console.log(`📅 Set default date for ${field.fieldName}: ${initialValue}`);
      }
      
      inputElement.value = initialValue;
      
      // Set placeholder only for input and textarea elements
      if (inputElement instanceof HTMLInputElement || inputElement instanceof HTMLTextAreaElement) {
        inputElement.placeholder = field.placeholderText || '';
      }
      
      // Apply classes if not already set
      if (!inputElement.className) {
        inputElement.className = baseClasses;
      }
    } else {
      // For checkbox and radio containers, just set the ID
      inputElement.id = safeFieldName;
      
      // Handle initial values for checkbox and radio fields
      const initialValue = globalFieldStorage.getValue(field.fieldName) || '';
      
      if (field.fieldType === 'checkbox' && initialValue) {
        // Set initial checkbox values
        const selectedValues = initialValue.split(',');
        const checkboxes = (inputElement as HTMLElement).querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach((checkbox: any) => {
          if (selectedValues.includes(checkbox.value)) {
            checkbox.checked = true;
          }
        });
      } else if (field.fieldType === 'radio' && initialValue) {
        // Set initial radio value
        const radioButton = (inputElement as HTMLElement).querySelector(`input[type="radio"][value="${initialValue}"]`) as HTMLInputElement;
        if (radioButton) {
          radioButton.checked = true;
        }
      }
    }

    // Add change listener that stores to global storage
    const handleChange = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const newValue = target.value;
      
      console.log(`🔄 Field "${field.fieldName}" (${field.fieldType}) changed to: "${newValue}"`);
      
      // Store in global storage
      globalFieldStorage.setValue(field.fieldName, newValue);
      
      // Verify storage was successful
      const storedValue = globalFieldStorage.getValue(field.fieldName);
      console.log(`💾 Stored ${field.fieldName}: "${newValue}" | Verified: "${storedValue}"`);
      
      // Additional verification for debugging
      if (storedValue !== newValue) {
        console.warn(`⚠️ Storage mismatch for ${field.fieldName}: expected "${newValue}", got "${storedValue}"`);
      }
    };

    // Add event listeners for all field types except checkbox and radio containers
    if (field.fieldType !== 'checkbox' && field.fieldType !== 'radio') {
      // Add multiple event types to ensure we capture value changes
      const eventTypes = ['input', 'change', 'blur', 'keyup'];
      
      eventTypes.forEach(eventType => {
        inputElement.addEventListener(eventType, handleChange);
        console.log(`🎯 Added "${eventType}" listener to field: ${field.fieldName} (${field.fieldType})`);
      });
      
      // Additional verification: Set up a periodic check to ensure storage is in sync
      const verifyInterval = setInterval(() => {
        const currentDOMValue = inputElement.value || '';
        const currentStorageValue = globalFieldStorage.getValue(field.fieldName) || '';
        
        if (currentDOMValue !== currentStorageValue && currentDOMValue.trim() !== '') {
          console.log(`🔄 Sync Detected: Storing DOM value "${currentDOMValue}" for field "${field.fieldName}"`);
          globalFieldStorage.setValue(field.fieldName, currentDOMValue);
        }
      }, 1000); // Check every second
      
      // Clean up interval when component unmounts
      setTimeout(() => {
        clearInterval(verifyInterval);
      }, 300000); // Stop after 5 minutes
    }
    
    console.log(`✅ Successfully created and attached listeners for field: ${field.fieldName} (${field.fieldType})`);

    // Store reference for cleanup
    inputElementRef.current = inputElement;

    // Add to DOM
    if (field.fieldType !== 'currency' && field.fieldType !== 'date' && field.fieldType !== 'checkbox' && field.fieldType !== 'radio') {
      fieldWrapper.appendChild(inputElement);
    }
    container.appendChild(fieldWrapper);

    // Add help text if exists
    if (field.helpText) {
      const helpElement = document.createElement('p');
      helpElement.className = 'text-sm text-gray-500 mt-1';
      helpElement.textContent = field.helpText;
      container.appendChild(helpElement);
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
      console.log(`🧹 Cleaning up field: ${field.fieldName}`);
      if (inputElementRef.current && field.fieldType !== 'checkbox' && field.fieldType !== 'radio') {
        const eventTypes = ['input', 'change', 'blur', 'keyup'];
        eventTypes.forEach(eventType => {
          inputElementRef.current!.removeEventListener(eventType, handleChange);
        });
      }
    };
  }, []); // Only run once, never again!

  // Handle error updates
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

  return <div ref={containerRef} className="space-y-2" />;
};

export default GlobalStorageField;