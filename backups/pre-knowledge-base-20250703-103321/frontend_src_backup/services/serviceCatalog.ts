// Service Catalog API Service
import { api } from './api';

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  serviceCount: number;
  type: 'bsg_category' | 'static_category';
}

export interface Service {
  id: string;
  name: string;
  description: string;
  categoryId?: string;
  templateId?: number;
  popularity?: number;
  usageCount?: number;
  hasFields?: boolean;
  fieldCount?: number;
  type: 'bsg_service' | 'static_service';
}

export interface ServiceField {
  id: number;
  name: string;
  label: string;
  type: string;
  required: boolean;
  description?: string;
  placeholder?: string;
  helpText?: string;
  maxLength?: number;
  validationRules?: any;
  options: ServiceFieldOption[];
  // Additional metadata for dropdown handling
  originalFieldType?: string;
  isDropdownField?: boolean;
  masterDataType?: string;
}

export interface ServiceFieldOption {
  value: string;
  label: string;
  isDefault: boolean;
}

export interface ServiceTemplate {
  id: string;
  templateId?: number;
  name: string;
  description?: string;
  category?: {
    name: string;
    displayName: string;
    description?: string;
  };
  fields: ServiceField[];
  type: 'bsg_template' | 'static_service';
}

export interface CreateTicketRequest {
  serviceId: string;
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  fieldValues?: Record<string, any>;
  attachments?: File[];
  rootCause?: string;
  issueCategory?: string;
}

export interface CreateTicketResponse {
  success: boolean;
  data: {
    ticketId: number;
    title: string;
    status: string;
    createdAt: string;
  };
  message: string;
}

export const serviceCatalogService = {
  // Get all service catalog categories
  getCategories: async (): Promise<ServiceCategory[]> => {
    const response = await api.get<{
      success: boolean;
      data: ServiceCategory[];
      userContext: any;
    }>('/service-catalog/categories');
    return response.data;
  },

  // Get services for a specific category
  getServicesByCategory: async (categoryId: string): Promise<Service[]> => {
    const response = await api.get<{
      success: boolean;
      data: Service[];
    }>(`/service-catalog/category/${categoryId}/services`);
    return response.data;
  },

  // Get service template details and fields
  getServiceTemplate: async (serviceId: string): Promise<ServiceTemplate> => {
    const response = await api.get<{
      success: boolean;
      data: ServiceTemplate;
    }>(`/service-catalog/service/${serviceId}/template`);
    return response.data;
  },

  // Search services across all categories
  searchServices: async (query: string): Promise<Service[]> => {
    const response = await api.get<{
      success: boolean;
      data: Service[];
      query: string;
      resultCount: number;
    }>(`/service-catalog/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Create ticket from service catalog
  createTicket: async (request: CreateTicketRequest): Promise<CreateTicketResponse> => {
    // If there are attachments, use FormData for multipart upload
    if (request.attachments && request.attachments.length > 0) {
      const formData = new FormData();
      
      // Add basic ticket data
      formData.append('serviceId', request.serviceId);
      formData.append('title', request.title);
      formData.append('description', request.description);
      if (request.priority) {
        formData.append('priority', request.priority);
      }
      
      // Add field values as JSON
      if (request.fieldValues) {
        formData.append('fieldValues', JSON.stringify(request.fieldValues));
      }
      
      // Add Issue Classification fields
      if (request.rootCause) {
        formData.append('rootCause', request.rootCause);
      }
      if (request.issueCategory) {
        formData.append('issueCategory', request.issueCategory);
      }
      
      // Add attachments
      request.attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });
      
      // Use upload method for multipart data
      const response = await api.upload<CreateTicketResponse>('/service-catalog/create-ticket', formData);
      return response;
    } else {
      // No attachments, use regular JSON post
      const response = await api.post<CreateTicketResponse>('/service-catalog/create-ticket', request);
      return response;
    }
  }
};

export default serviceCatalogService;