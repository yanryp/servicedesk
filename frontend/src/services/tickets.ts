// src/services/tickets.ts
import { api } from './api';
import { 
  Ticket, 
  TicketsResponse, 
  CreateTicketRequest, 
  UpdateTicketRequest, 
  TicketFilters 
} from '../types';

export const ticketsService = {
  // Get tickets with filters and pagination - Stage 4 Migration: Using Enhanced Endpoints
  getTickets: async (filters?: TicketFilters): Promise<TicketsResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const queryString = params.toString();
    const url = queryString ? `/v2/tickets?${queryString}` : '/v2/tickets';
    
    console.log('ticketsService: Using enhanced endpoint for ticket listing');
    
    // Enhanced endpoint returns different structure: { success: true, data: { tickets, pagination } }
    const response = await api.get<any>(url);
    
    // Transform response to match expected TicketsResponse format
    if (response.success && response.data) {
      return {
        tickets: response.data.tickets,
        totalPages: response.data.pagination?.totalPages || 1,
        currentPage: response.data.pagination?.currentPage || 1,
        totalTickets: response.data.pagination?.totalTickets || response.data.tickets.length
      };
    }
    
    // Fallback for unexpected response format
    return {
      tickets: Array.isArray(response) ? response : [],
      totalPages: 1,
      currentPage: 1,
      totalTickets: Array.isArray(response) ? response.length : 0
    };
  },

  // Get single ticket by ID - Stage 4 Migration: Using Enhanced Endpoints
  getTicket: async (ticketId: number): Promise<Ticket> => {
    console.log('ticketsService: Using enhanced endpoint for ticket detail');
    
    // Enhanced endpoint returns { success: true, data: ticket }
    const response = await api.get<any>(`/v2/tickets/${ticketId}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    // Fallback for unexpected response format
    return response;
  },

  // Create new ticket with attachments
  createTicket: async (ticketData: CreateTicketRequest, attachments?: FileList): Promise<Ticket> => {
    // Always use FormData since backend uses multer middleware
    const formData = new FormData();
    
    // Add ticket data (mapped to unified format)
    formData.append('title', ticketData.title);
    formData.append('description', ticketData.description);
    
    // Map legacy itemId to serviceItemId for unified service
    if (ticketData.itemId) {
      formData.append('serviceItemId', ticketData.itemId.toString());
    }
    
    // Map legacy templateId to serviceTemplateId for unified service
    if (ticketData.templateId) {
      formData.append('serviceTemplateId', ticketData.templateId.toString());
    }
    
    if (ticketData.priority) {
      formData.append('priority', ticketData.priority);
    }

    // Add custom field values
    if (ticketData.customFieldValues && ticketData.customFieldValues.length > 0) {
      formData.append('customFieldValues', JSON.stringify(ticketData.customFieldValues));
    }

    // Add categorization fields
    if (ticketData.userRootCause) {
      formData.append('userRootCause', ticketData.userRootCause);
    }
    
    if (ticketData.userIssueCategory) {
      formData.append('userIssueCategory', ticketData.userIssueCategory);
    }

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      Array.from(attachments).forEach((file) => {
        formData.append('attachments', file);
      });
    }

    console.log('ticketsService: Using unified endpoint for ticket creation');
    
    // Use unified ticket creation endpoint (Stage 2 Migration)
    return api.upload<Ticket>('/v2/tickets/unified-create', formData);
  },

  // Update ticket
  updateTicket: async (ticketId: number, ticketData: UpdateTicketRequest): Promise<Ticket> => {
    return api.put<Ticket>(`/tickets/${ticketId}`, ticketData);
  },

  // Delete ticket
  deleteTicket: async (ticketId: number): Promise<void> => {
    return api.delete(`/tickets/${ticketId}`);
  },

  // Assign ticket to user
  assignTicket: async (ticketId: number, assignedToUserId: number): Promise<Ticket> => {
    return api.patch<Ticket>(`/tickets/${ticketId}/assign`, { assignedToUserId });
  },

  // Update ticket status
  updateTicketStatus: async (ticketId: number, status: string): Promise<Ticket> => {
    return api.patch<Ticket>(`/tickets/${ticketId}/status`, { status });
  },

  // Approve ticket (Manager only) - Stage 3 Migration: Using Enhanced Endpoints
  approveTicket: async (ticketId: number, comments?: string): Promise<Ticket> => {
    console.log('ticketsService: Using enhanced approval endpoint');
    return api.post<Ticket>(`/v2/tickets/${ticketId}/approve`, { comments });
  },

  // Reject ticket (Manager only) - Stage 3 Migration: Using Enhanced Endpoints  
  rejectTicket: async (ticketId: number, comments: string): Promise<Ticket> => {
    console.log('ticketsService: Using enhanced rejection endpoint');
    return api.post<Ticket>(`/v2/tickets/${ticketId}/reject`, { comments });
  },

  // Get pending approvals (Manager only) - using enhanced endpoint
  getPendingApprovals: async (): Promise<Ticket[]> => {
    return api.get<Ticket[]>('/v2/tickets/pending-approvals');
  },

  // Download attachment - Stage 4 Migration: Using Enhanced Endpoints
  downloadAttachment: async (attachmentId: number): Promise<Blob> => {
    console.log('ticketsService: Using enhanced endpoint for attachment download');
    return api.get(`/v2/tickets/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    });
  },
};

export default ticketsService;