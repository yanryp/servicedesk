// src/components/CustomFields/CustomFieldInput.tsx
import React from 'react';
import { CustomFieldDefinition } from '../../types';

interface CustomFieldInputProps {
  field: CustomFieldDefinition;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const CustomFieldInput: React.FC<CustomFieldInputProps> = ({
  field,
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const baseInputClasses = `
    block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${error ? 'border-red-300 text-red-900 placeholder-red-300' : 'border-gray-300'}
  `;

  const renderField = () => {
    switch (field.fieldType) {
      case 'text':
        return (
          <input
            type="text"
            id={`field-${field.id}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || `Enter ${field.fieldLabel || field.fieldName}`}
            disabled={disabled}
            className={baseInputClasses}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            id={`field-${field.id}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || `Enter ${field.fieldLabel || field.fieldName}`}
            disabled={disabled}
            className={baseInputClasses}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            id={`field-${field.id}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseInputClasses}
          />
        );

      case 'dropdown':
        return (
          <select
            id={`field-${field.id}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseInputClasses}
          >
            <option value="">
              {field.placeholder || `Select ${field.fieldLabel || field.fieldName}`}
            </option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name={`field-${field.id}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={disabled}
                  className="mr-2 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        if (field.options && field.options.length > 0) {
          // Multiple checkboxes
          const selectedValues = value ? value.split(',') : [];
          
          return (
            <div className="space-y-2">
              {field.options.map((option, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    value={option}
                    checked={selectedValues.includes(option)}
                    onChange={(e) => {
                      const newSelectedValues = e.target.checked
                        ? [...selectedValues, option]
                        : selectedValues.filter(v => v !== option);
                      onChange(newSelectedValues.join(','));
                    }}
                    disabled={disabled}
                    className="mr-2 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          );
        } else {
          // Single checkbox
          return (
            <label className="flex items-center">
              <input
                type="checkbox"
                id={`field-${field.id}`}
                checked={value === 'true' || value === '1'}
                onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
                disabled={disabled}
                className="mr-2 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                {field.fieldLabel || field.fieldName}
              </span>
            </label>
          );
        }

      default:
        return (
          <input
            type="text"
            id={`field-${field.id}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || `Enter ${field.fieldLabel || field.fieldName}`}
            disabled={disabled}
            className={baseInputClasses}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      {field.fieldType !== 'checkbox' || (field.options && field.options.length > 1) ? (
        <label htmlFor={`field-${field.id}`} className="block text-sm font-medium text-gray-700">
          {field.fieldLabel || field.fieldName}
          {field.isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      ) : null}
      
      {renderField()}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {!error && field.placeholder && field.fieldType !== 'dropdown' && (
        <p className="text-xs text-gray-500">{field.placeholder}</p>
      )}
    </div>
  );
};

export default CustomFieldInput;