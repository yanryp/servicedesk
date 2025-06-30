// Service Catalog Admin API Service - Integrated with existing ServiceCatalog system
import { api } from './api';

// Real ServiceCatalog interface matching Prisma schema and frontend types
export interface ServiceCatalog {
  id: number;
  name: string;
  description: string | null;
  serviceType?: string;
  categoryLevel?: number;
  parentId?: number | null;
  departmentId: number;
  department?: {
    id: number;
    name: string;
  } | null;
  isActive: boolean;
  requiresApproval?: boolean;
  estimatedTime?: number | null;
  businessImpact?: string;
  createdAt: string;
  updatedAt: string;
  serviceItems?: ServiceItem[];
  _count?: {
    serviceItems: number;
  };
  // Computed statistics for admin dashboard
  statistics: {
    serviceItemCount: number;
    templateCount: number; // Now represents total custom fields
    visibleTemplateCount: number; // Now represents service items with custom fields
  };
}

export interface ServiceItem {
  id: number;
  name: string;
  description: string | null;
  requestType?: string;
  isKasdaRelated?: boolean;
  requiresGovApproval?: boolean;
  isActive: boolean;
  sortOrder: number;
  serviceCatalogId: number;
  createdAt: string;
  updatedAt: string;
  serviceCatalog?: {
    name: string;
  };
  customFieldDefinitions?: CustomFieldDefinition[];
  templates?: ServiceTemplate[]; // Keep for backward compatibility
  statistics?: {
    customFieldCount: number;
    hasCustomFields: boolean;
    templateCount: number;
    totalFields: number;
  };
}

export interface ServiceTemplate {
  id: number;
  name: string;
  description: string | null;
  templateType?: string;
  isKasdaTemplate: boolean;
  requiresBusinessApproval: boolean;
  isVisible: boolean;
  sortOrder: number;
  estimatedResolutionTime: number | null;
  defaultRootCause?: string | null;
  defaultIssueType?: string | null;
  serviceItemId: number;
  createdAt: string;
  updatedAt: string;
  serviceItem?: {
    name: string;
    serviceCatalog?: {
      name: string;
    };
  };
  customFieldDefinitions?: CustomFieldDefinition[];
  _count?: {
    customFieldDefinitions: number;
  };
}

export interface CustomFieldDefinition {
  id: number;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  options: any;
  isRequired: boolean;
  isKasdaSpecific: boolean;
  placeholder: string | null;
  defaultValue: string | null;
  validationRules: any;
  sortOrder: number;
  isVisible: boolean;
  serviceTemplateId?: number | null; // Optional for backward compatibility
  serviceItemId?: number | null; // New field for direct attachment to ServiceItems
  createdAt: string;
  updatedAt: string;
  serviceTemplate?: {
    name: string;
  };
  serviceItem?: {
    name: string;
  };
}

export interface CreateServiceCatalogRequest {
  name: string;
  description?: string | null;
  serviceType?: string;
  categoryLevel?: number;
  parentId?: number | null;
  departmentId: number;
  isActive?: boolean;
  requiresApproval?: boolean;
  estimatedTime?: number | null;
  businessImpact?: string;
}

export interface CreateServiceItemRequest {
  name: string;
  description?: string | null;
  serviceCatalogId: number;
  requestType?: string;
  isKasdaRelated?: boolean;
  requiresGovApproval?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface CreateServiceTemplateRequest {
  name: string;
  description?: string | null;
  serviceItemId: number;
  templateType?: string;
  isKasdaTemplate?: boolean;
  requiresBusinessApproval?: boolean;
  isVisible?: boolean;
  sortOrder?: number;
  estimatedResolutionTime?: number | null;
  defaultRootCause?: string | null;
  defaultIssueType?: string | null;
}

export interface CreateCustomFieldRequest {
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  serviceTemplateId: number;
  options?: any;
  isRequired?: boolean;
  isKasdaSpecific?: boolean;
  placeholder?: string | null;
  defaultValue?: string | null;
  validationRules?: any;
  sortOrder?: number;
  isVisible?: boolean;
}

export const serviceCatalogAdminService = {
  // Service Catalogs - Use dedicated admin endpoint with full statistics
  getCatalogs: async (): Promise<ServiceCatalog[]> => {
    try {
      // Use the existing working admin endpoint for detailed catalog data
      const response = await api.get<{
        success: boolean;
        data: ServiceCatalog[];
        meta: any;
      }>('/service-catalog-admin/catalogs');
      
      if (!response.success) {
        throw new Error('Failed to fetch service catalogs');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching catalogs for admin:', error);
      throw error;
    }
  },

  createCatalog: async (data: CreateServiceCatalogRequest): Promise<ServiceCatalog> => {
    const response = await api.post<{
      success: boolean;
      data: ServiceCatalog;
      message: string;
    }>('/service-catalog-admin/catalogs', data);
    return response.data;
  },

  updateCatalog: async (id: string, data: Partial<CreateServiceCatalogRequest>): Promise<ServiceCatalog> => {
    const response = await api.put<{
      success: boolean;
      data: ServiceCatalog;
      message: string;
    }>(`/service-catalog-admin/catalogs/${id}`, data);
    return response.data;
  },

  deleteCatalog: async (id: string): Promise<void> => {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/service-catalog-admin/catalogs/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete catalog');
    }
  },

  // Service Items
  getItems: async (catalogId?: string): Promise<ServiceItem[]> => {
    const url = catalogId 
      ? `/service-catalog-admin/catalogs/${catalogId}/items`
      : '/service-catalog-admin/items';
    const response = await api.get<{
      success: boolean;
      data: ServiceItem[];
    }>(url);
    return response.data;
  },

  createItem: async (data: CreateServiceItemRequest): Promise<ServiceItem> => {
    const response = await api.post<{
      success: boolean;
      data: ServiceItem;
      message: string;
    }>('/service-catalog-admin/items', data);
    return response.data;
  },

  updateItem: async (id: string, data: Partial<CreateServiceItemRequest>): Promise<ServiceItem> => {
    const response = await api.put<{
      success: boolean;
      data: ServiceItem;
      message: string;
    }>(`/service-catalog-admin/items/${id}`, data);
    return response.data;
  },

  deleteItem: async (id: string): Promise<void> => {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/service-catalog-admin/items/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete service item');
    }
  },

  // Service Templates
  getTemplates: async (itemId?: string): Promise<ServiceTemplate[]> => {
    const url = itemId 
      ? `/service-catalog-admin/items/${itemId}/templates`
      : '/service-catalog-admin/templates';
    const response = await api.get<{
      success: boolean;
      data: ServiceTemplate[];
    }>(url);
    return response.data;
  },

  createTemplate: async (data: CreateServiceTemplateRequest): Promise<ServiceTemplate> => {
    const response = await api.post<{
      success: boolean;
      data: ServiceTemplate;
      message: string;
    }>('/service-catalog-admin/templates', data);
    return response.data;
  },

  updateTemplate: async (id: string, data: Partial<CreateServiceTemplateRequest>): Promise<ServiceTemplate> => {
    const response = await api.put<{
      success: boolean;
      data: ServiceTemplate;
      message: string;
    }>(`/service-catalog-admin/templates/${id}`, data);
    return response.data;
  },

  deleteTemplate: async (id: string): Promise<void> => {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/service-catalog-admin/templates/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete template');
    }
  },

  // Custom Field Definitions (ServiceTemplate-based - legacy)
  getCustomFields: async (templateId?: string): Promise<CustomFieldDefinition[]> => {
    const url = templateId 
      ? `/service-catalog-admin/templates/${templateId}/custom-fields`
      : '/service-catalog-admin/custom-fields';
    const response = await api.get<{
      success: boolean;
      data: CustomFieldDefinition[];
    }>(url);
    return response.data;
  },

  createCustomField: async (data: CreateCustomFieldRequest): Promise<CustomFieldDefinition> => {
    const response = await api.post<{
      success: boolean;
      data: CustomFieldDefinition;
      message: string;
    }>('/service-catalog-admin/custom-fields', data);
    return response.data;
  },

  updateCustomField: async (id: string, data: Partial<CreateCustomFieldRequest>): Promise<CustomFieldDefinition> => {
    const response = await api.put<{
      success: boolean;
      data: CustomFieldDefinition;
      message: string;
    }>(`/service-catalog-admin/custom-fields/${id}`, data);
    return response.data;
  },

  deleteCustomField: async (id: string): Promise<void> => {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/service-catalog-admin/custom-fields/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete custom field');
    }
  },

  // ServiceItem Custom Fields (new direct approach)
  getServiceItemCustomFields: async (itemId: string): Promise<CustomFieldDefinition[]> => {
    const response = await api.get<{
      success: boolean;
      data: CustomFieldDefinition[];
      meta: any;
    }>(`/service-catalog-admin/items/${itemId}/custom-fields`);
    return response.data;
  },

  createServiceItemCustomField: async (itemId: string, data: Omit<CreateCustomFieldRequest, 'serviceTemplateId'>): Promise<CustomFieldDefinition> => {
    const response = await api.post<{
      success: boolean;
      data: CustomFieldDefinition;
      message: string;
    }>(`/service-catalog-admin/items/${itemId}/custom-fields`, data);
    return response.data;
  },

  updateServiceItemCustomField: async (fieldId: string, data: Partial<Omit<CreateCustomFieldRequest, 'serviceTemplateId'>>): Promise<CustomFieldDefinition> => {
    const response = await api.put<{
      success: boolean;
      data: CustomFieldDefinition;
      message: string;
    }>(`/service-catalog-admin/items/custom-fields/${fieldId}`, data);
    return response.data;
  },

  deleteServiceItemCustomField: async (fieldId: string): Promise<void> => {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/service-catalog-admin/items/custom-fields/${fieldId}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete custom field');
    }
  },

  // Bulk Operations
  reorderCatalogs: async (catalogIds: string[]): Promise<void> => {
    await api.post('/service-catalog-admin/catalogs/reorder', { catalogIds });
  },

  reorderItems: async (itemIds: string[]): Promise<void> => {
    await api.post('/service-catalog-admin/items/reorder', { itemIds });
  },

  reorderCustomFields: async (fieldIds: string[]): Promise<void> => {
    await api.post('/service-catalog-admin/custom-fields/reorder', { fieldIds });
  },

  // Import/Export
  exportCatalogData: async (): Promise<Blob> => {
    const response = await api.get('/service-catalog-admin/export', {
      responseType: 'blob',
    });
    return response;
  },

  importCatalogData: async (file: File): Promise<{ message: string; imported: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.upload<{ message: string; imported: number }>('/service-catalog-admin/import', formData);
    return response;
  },
};

export default serviceCatalogAdminService;