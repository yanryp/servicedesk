import { useState, useEffect, useCallback } from 'react';

export interface FieldDefinition {
  id: number;
  fieldName: string;
  fieldLabel: string;
  fieldType: 'text' | 'number' | 'date' | 'datetime' | 'dropdown' | 'textarea' | 'checkbox';
  isRequired: boolean;
  placeholder?: string;
  helpText?: string;
  validationRules?: {
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    pattern?: string;
    errorMessage?: string;
    source?: string;
    type?: string;
    options?: Array<{
      value: string;
      label: string;
      description?: string;
      metadata?: any;
    }>;
  };
  sortOrder: number;
  defaultValue?: string;
}

export interface TemplateFieldsData {
  template: {
    id: number;
    name: string;
    serviceName: string;
    catalogName: string;
  };
  fields: FieldDefinition[];
  fieldCount: number;
}

export interface ValidationError {
  fieldName: string;
  fieldLabel: string;
  errors: string[];
}

export interface ValidationResult {
  isValid: boolean;
  validatedFields: Array<{
    fieldName: string;
    fieldLabel: string;
    value: string;
    isValid: boolean;
  }>;
  validationErrors: ValidationError[];
  summary: {
    totalFields: number;
    validFields: number;
    invalidFields: number;
  };
}

interface UseTemplateFieldsResult {
  // Template fields data
  fieldsData: TemplateFieldsData | null;
  fields: FieldDefinition[];
  loading: boolean;
  error: string | null;
  
  // Field values management
  fieldValues: Record<string, string>;
  updateFieldValue: (fieldName: string, value: string) => void;
  resetFieldValues: () => void;
  
  // Validation
  validationResult: ValidationResult | null;
  validateFields: () => Promise<boolean>;
  
  // Actions
  loadTemplateFields: (templateId: number) => Promise<void>;
  clearTemplate: () => void;
}

export const useTemplateFields = (): UseTemplateFieldsResult => {
  const [fieldsData, setFieldsData] = useState<TemplateFieldsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Get auth token
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('authToken');
  }, []);

  // API request helper
  const apiRequest = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`http://localhost:3001${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }, [getAuthToken]);

  // Load template fields from API
  const loadTemplateFields = useCallback(async (templateId: number) => {
    if (!templateId) {
      setFieldsData(null);
      setFieldValues({});
      setValidationResult(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest(`/api/service-templates/${templateId}/fields`);
      
      if (response.success) {
        setFieldsData(response.data);
        
        // Initialize field values with defaults
        const initialValues: Record<string, string> = {};
        response.data.fields.forEach((field: FieldDefinition) => {
          initialValues[field.fieldName] = field.defaultValue || '';
        });
        setFieldValues(initialValues);
        setValidationResult(null);
      } else {
        throw new Error(response.message || 'Failed to load template fields');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setFieldsData(null);
      setFieldValues({});
      console.error('Error loading template fields:', err);
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  // Update individual field value
  const updateFieldValue = useCallback((fieldName: string, value: string) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear validation result when values change
    if (validationResult) {
      setValidationResult(null);
    }
  }, [validationResult]);

  // Reset all field values
  const resetFieldValues = useCallback(() => {
    if (fieldsData) {
      const resetValues: Record<string, string> = {};
      fieldsData.fields.forEach(field => {
        resetValues[field.fieldName] = field.defaultValue || '';
      });
      setFieldValues(resetValues);
    } else {
      setFieldValues({});
    }
    setValidationResult(null);
  }, [fieldsData]);

  // Validate fields
  const validateFields = useCallback(async (): Promise<boolean> => {
    if (!fieldsData) {
      setValidationResult(null);
      return true;
    }

    try {
      const response = await apiRequest(`/api/service-templates/${fieldsData.template.id}/validate-fields`, {
        method: 'POST',
        body: JSON.stringify({ fieldValues }),
      });

      if (response.success) {
        setValidationResult(response.data);
        return response.data.isValid;
      } else {
        throw new Error(response.message || 'Field validation failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Validation error occurred';
      setError(errorMessage);
      console.error('Error validating fields:', err);
      return false;
    }
  }, [fieldsData, fieldValues, apiRequest]);

  // Clear template data
  const clearTemplate = useCallback(() => {
    setFieldsData(null);
    setFieldValues({});
    setValidationResult(null);
    setError(null);
  }, []);

  // Derived values
  const fields = fieldsData?.fields || [];

  return {
    // Template fields data
    fieldsData,
    fields,
    loading,
    error,
    
    // Field values management
    fieldValues,
    updateFieldValue,
    resetFieldValues,
    
    // Validation
    validationResult,
    validateFields,
    
    // Actions
    loadTemplateFields,
    clearTemplate,
  };
};

// Hook for loading master data options
export interface MasterDataOption {
  value: string;
  label: string;
  description?: string;
  metadata?: any;
  id: number;
}

interface UseMasterDataResult {
  data: MasterDataOption[];
  loading: boolean;
  error: string | null;
  loadMasterData: (type: string, filters?: Record<string, string>) => Promise<void>;
}

export const useMasterData = (): UseMasterDataResult => {
  const [data, setData] = useState<MasterDataOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get auth token
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('authToken');
  }, []);

  // API request helper
  const apiRequest = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`http://localhost:3001${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }, [getAuthToken]);

  // Load master data from API
  const loadMasterData = useCallback(async (type: string, filters: Record<string, string> = {}) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams(filters);
      const url = `/api/master-data/${type}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiRequest(url);
      
      if (response.success) {
        setData(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to load master data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setData([]);
      console.error('Error loading master data:', err);
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  return {
    data,
    loading,
    error,
    loadMasterData,
  };
};