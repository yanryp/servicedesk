// src/components/BSGDynamicField.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BSGFieldDefinition, 
  BSGDynamicFieldValue, 
  MasterDataEntity, 
  BSGMasterDataResponse 
} from '../types';
import { BSGTemplateService, I18nService, useI18n } from '../services';

interface BSGDynamicFieldProps {
  fieldDefinition: BSGFieldDefinition;
  value?: any;
  onChange: (value: BSGDynamicFieldValue) => void;
  onValidation?: (isValid: boolean, errorMessage?: string) => void;
  disabled?: boolean;
  className?: string;
}

const BSGDynamicField: React.FC<BSGDynamicFieldProps> = ({
  fieldDefinition,
  value,
  onChange,
  onValidation,
  disabled = false,
  className = ''
}) => {
  const { t, currentLanguage } = useI18n();
  const [fieldValue, setFieldValue] = useState<any>(value || '');
  const [isValid, setIsValid] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [masterData, setMasterData] = useState<MasterDataEntity[]>([]);

  // Get localized field properties
  const displayName = I18nService.getDisplayName(fieldDefinition);
  const placeholder = currentLanguage === 'id' && fieldDefinition.placeholderId 
    ? fieldDefinition.placeholderId 
    : fieldDefinition.placeholder || '';
  const helpText = currentLanguage === 'id' && fieldDefinition.helpTextId 
    ? fieldDefinition.helpTextId 
    : fieldDefinition.helpText || '';

  // Load master data for dropdown fields
  useEffect(() => {
    if (fieldDefinition.fieldType?.name.includes('dropdown')) {
      loadMasterData();
    }
  }, [fieldDefinition]);

  const loadMasterData = async () => {
    setIsLoading(true);
    try {
      let dataType = '';
      
      // Map field types to master data types
      switch (fieldDefinition.fieldType?.name) {
        case 'branch_dropdown':
          dataType = 'branch';
          break;
        case 'terminal_dropdown':
          dataType = 'terminal';
          break;
        case 'bank_dropdown':
          dataType = 'bank_code';
          break;
        default:
          return;
      }

      const response: BSGMasterDataResponse = await BSGTemplateService.getMasterData({
        type: dataType,
        isActive: true,
        limit: 1000
      });

      if (response.success) {
        setMasterData(response.data);
      }
    } catch (error) {
      console.error('Failed to load master data:', error);
      setMasterData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Validation function
  const validateField = (inputValue: any): { isValid: boolean; errorMessage?: string } => {
    // Required field validation
    if (fieldDefinition.isRequired && (!inputValue || inputValue.toString().trim() === '')) {
      return { isValid: false, errorMessage: t('error.required.field') };
    }

    // Field type specific validation
    switch (fieldDefinition.fieldType?.name) {
      case 'currency_idr':
        return BSGTemplateService.validateCurrencyIDR(inputValue);
        
      case 'account_number':
        return BSGTemplateService.validateAccountNumber(inputValue);
        
      case 'terminal_id':
        return BSGTemplateService.validateTerminalID(inputValue);
        
      case 'email':
        if (inputValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)) {
          return { isValid: false, errorMessage: t('validation.invalid.email') };
        }
        break;
        
      case 'phone':
        if (inputValue && !/^[\+]?[\d\s\-\(\)]{8,15}$/.test(inputValue)) {
          return { isValid: false, errorMessage: 'Invalid phone number format' };
        }
        break;
        
      default:
        // Custom validation rules from field definition
        if (fieldDefinition.validationRules) {
          const rules = fieldDefinition.validationRules;
          
          if (rules.minLength && inputValue.length < rules.minLength) {
            return { 
              isValid: false, 
              errorMessage: `Minimum length is ${rules.minLength} characters` 
            };
          }
          
          if (rules.maxLength && inputValue.length > rules.maxLength) {
            return { 
              isValid: false, 
              errorMessage: `Maximum length is ${rules.maxLength} characters` 
            };
          }
          
          if (rules.pattern && !new RegExp(rules.pattern).test(inputValue)) {
            return { 
              isValid: false, 
              errorMessage: rules.patternMessage || 'Invalid format' 
            };
          }
        }
    }

    return { isValid: true };
  };

  // Handle value change
  const handleValueChange = (newValue: any) => {
    setFieldValue(newValue);
    
    // Validate the new value
    const validation = validateField(newValue);
    setIsValid(validation.isValid);
    setErrorMessage(validation.errorMessage || '');
    
    // Call validation callback
    if (onValidation) {
      onValidation(validation.isValid, validation.errorMessage);
    }
    
    // Call onChange with the structured value
    onChange({
      fieldDefinitionId: fieldDefinition.id,
      value: newValue,
      isValid: validation.isValid,
      errorMessage: validation.errorMessage
    });
  };

  // Render field based on type
  const renderField = () => {
    const baseClassName = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      !isValid ? 'border-red-500' : 'border-gray-300'
    } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`;

    switch (fieldDefinition.fieldType?.name) {
      case 'currency_idr':
        return (
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">Rp</span>
            <input
              type="text"
              value={fieldValue}
              onChange={(e) => {
                // Format as currency while typing
                const numericValue = e.target.value.replace(/[^\d]/g, '');
                const formattedValue = numericValue ? 
                  BSGTemplateService.formatCurrencyIDR(parseInt(numericValue)).replace('Rp', '').trim() : 
                  '';
                handleValueChange(numericValue);
                setFieldValue(formattedValue);
              }}
              placeholder={placeholder}
              disabled={disabled}
              className={`${baseClassName} pl-10`}
            />
          </div>
        );

      case 'branch_dropdown':
      case 'terminal_dropdown':
      case 'bank_dropdown':
        return (
          <select
            value={fieldValue}
            onChange={(e) => handleValueChange(e.target.value)}
            disabled={disabled || isLoading}
            className={baseClassName}
          >
            <option value="">{isLoading ? t('common.loading') : t('common.select')}</option>
            {masterData.map((item) => (
              <option key={item.id} value={item.code}>
                {I18nService.getDisplayName({ displayName: item.name, displayNameId: item.nameIndonesian })} ({item.code})
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={fieldValue}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={baseClassName}
          />
        );

      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={fieldValue}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={baseClassName}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={fieldValue}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={baseClassName}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={fieldValue}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={baseClassName}
          />
        );

      case 'phone':
        return (
          <input
            type="tel"
            value={fieldValue}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={placeholder || "+62 XXX-XXXX-XXXX"}
            disabled={disabled}
            className={baseClassName}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={fieldValue}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={4}
            className={baseClassName}
          />
        );

      case 'checkbox':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={fieldValue === true || fieldValue === 'true'}
              onChange={(e) => handleValueChange(e.target.checked)}
              disabled={disabled}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">{displayName}</span>
          </label>
        );

      case 'radio':
        const options = fieldDefinition.validationRules?.options || [];
        return (
          <div className="space-y-2">
            {options.map((option: any, index: number) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`field-${fieldDefinition.id}`}
                  value={option.value || option}
                  checked={fieldValue === (option.value || option)}
                  onChange={(e) => handleValueChange(e.target.value)}
                  disabled={disabled}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm text-gray-700">
                  {typeof option === 'object' ? I18nService.getDisplayName(option) : option}
                </span>
              </label>
            ))}
          </div>
        );

      default:
        // Default to text input
        return (
          <input
            type="text"
            value={fieldValue}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={baseClassName}
          />
        );
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      {/* Field Label */}
      {fieldDefinition.fieldType?.name !== 'checkbox' && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {displayName}
          {fieldDefinition.isRequired && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}

      {/* Field Input */}
      {renderField()}

      {/* Help Text */}
      {helpText && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}

      {/* Error Message */}
      {!isValid && errorMessage && (
        <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
      )}

      {/* Loading indicator for dropdowns */}
      {isLoading && fieldDefinition.fieldType?.name.includes('dropdown') && (
        <div className="mt-1 text-xs text-blue-500">
          {t('common.loading')}...
        </div>
      )}
    </div>
  );
};

export default BSGDynamicField;