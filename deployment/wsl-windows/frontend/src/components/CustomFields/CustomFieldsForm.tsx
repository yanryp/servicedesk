// src/components/CustomFields/CustomFieldsForm.tsx
import React, { useState, useEffect } from 'react';
import { CustomFieldDefinition, TicketCustomFieldValue } from '../../types';
import CustomFieldInput from './CustomFieldInput';

interface CustomFieldsFormProps {
  fields: CustomFieldDefinition[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

export const CustomFieldsForm: React.FC<CustomFieldsFormProps> = ({
  fields,
  values,
  onChange,
  errors = {},
  disabled = false,
}) => {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(values);

  // Update local state when external values change
  useEffect(() => {
    setFieldValues(values);
  }, [values]);

  const handleFieldChange = (fieldId: number, value: string) => {
    const newValues = {
      ...fieldValues,
      [fieldId.toString()]: value,
    };
    setFieldValues(newValues);
    onChange(newValues);
  };

  // Validate required fields
  const validateFields = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach((field) => {
      if (field.isRequired) {
        const value = fieldValues[field.id.toString()] || '';
        if (!value.trim()) {
          newErrors[field.id.toString()] = `${field.fieldLabel || field.fieldName} is required`;
        } else {
          // Type-specific validation
          switch (field.fieldType) {
            case 'number':
              if (isNaN(parseFloat(value))) {
                newErrors[field.id.toString()] = 'Must be a valid number';
              }
              break;
            case 'date':
              if (isNaN(new Date(value).getTime())) {
                newErrors[field.id.toString()] = 'Must be a valid date';
              }
              break;
            case 'dropdown':
            case 'radio':
              if (field.options && !field.options.includes(value)) {
                newErrors[field.id.toString()] = 'Please select a valid option';
              }
              break;
          }
        }
      }
    });
    
    return newErrors;
  };

  // Convert values to TicketCustomFieldValue format
  const getCustomFieldValues = (): Omit<TicketCustomFieldValue, 'id' | 'ticketId'>[] => {
    return Object.entries(fieldValues)
      .filter(([_, value]) => value && value.trim())
      .map(([fieldId, value]) => ({
        fieldDefinitionId: parseInt(fieldId),
        value: value.trim(),
      }));
  };

  if (fields.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.id} className={field.fieldType === 'checkbox' && field.options?.length ? 'sm:col-span-2' : ''}>
              <CustomFieldInput
                field={field}
                value={fieldValues[field.id.toString()] || ''}
                onChange={(value) => handleFieldChange(field.id, value)}
                error={errors[field.id.toString()]}
                disabled={disabled}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper hook for form validation
export const useCustomFieldsValidation = (fields: CustomFieldDefinition[]) => {
  const validateFields = (values: Record<string, string>): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    fields.forEach((field) => {
      if (field.isRequired) {
        const value = values[field.id.toString()] || '';
        if (!value.trim()) {
          errors[field.id.toString()] = `${field.fieldLabel || field.fieldName} is required`;
        } else {
          // Type-specific validation
          switch (field.fieldType) {
            case 'number':
              if (isNaN(parseFloat(value))) {
                errors[field.id.toString()] = 'Must be a valid number';
              }
              break;
            case 'date':
              if (isNaN(new Date(value).getTime())) {
                errors[field.id.toString()] = 'Must be a valid date';
              }
              break;
            case 'dropdown':
            case 'radio':
              if (field.options && !field.options.includes(value)) {
                errors[field.id.toString()] = 'Please select a valid option';
              }
              break;
          }
        }
      }
    });
    
    return errors;
  };

  const convertToApiFormat = (values: Record<string, string>): Omit<TicketCustomFieldValue, 'id' | 'ticketId'>[] => {
    return Object.entries(values)
      .filter(([_, value]) => value && value.trim())
      .map(([fieldId, value]) => ({
        fieldDefinitionId: parseInt(fieldId),
        value: value.trim(),
      }));
  };

  return { validateFields, convertToApiFormat };
};

export default CustomFieldsForm;