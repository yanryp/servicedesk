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
  // Get tickets with filters and pagination
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
    const url = queryString ? `/api/tickets?${queryString}` : '/api/tickets';
    
    return api.get<TicketsResponse>(url);
  },

  // Get single ticket by ID
  getTicket: async (ticketId: number): Promise<Ticket> => {
    return api.get<Ticket>(`/api/tickets/${ticketId}`);
  },

  // Create new ticket with attachments
  createTicket: async (ticketData: CreateTicketRequest, attachments?: FileList): Promise<Ticket> => {
    // Always use FormData since backend uses multer middleware
    const formData = new FormData();
    
    // Add ticket data
    formData.append('title', ticketData.title);
    formData.append('description', ticketData.description);
    formData.append('itemId', ticketData.itemId.toString());
    
    if (ticketData.templateId) {
      formData.append('templateId', ticketData.templateId.toString());
    }
    
    if (ticketData.priority) {
      formData.append('priority', ticketData.priority);
    }

    // Add custom field values
    if (ticketData.customFieldValues && ticketData.customFieldValues.length > 0) {
      formData.append('customFieldValues', JSON.stringify(ticketData.customFieldValues));
    }

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      Array.from(attachments).forEach((file) => {
        formData.append('attachments', file);
      });
    }

    return api.upload<Ticket>('/api/tickets', formData);
  },

  // Update ticket
  updateTicket: async (ticketId: number, ticketData: UpdateTicketRequest): Promise<Ticket> => {
    return api.put<Ticket>(`/api/tickets/${ticketId}`, ticketData);
  },

  // Delete ticket
  deleteTicket: async (ticketId: number): Promise<void> => {
    return api.delete(`/api/tickets/${ticketId}`);
  },

  // Assign ticket to user
  assignTicket: async (ticketId: number, assignedToUserId: number): Promise<Ticket> => {
    return api.patch<Ticket>(`/api/tickets/${ticketId}/assign`, { assignedToUserId });
  },

  // Update ticket status
  updateTicketStatus: async (ticketId: number, status: string): Promise<Ticket> => {
    return api.patch<Ticket>(`/api/tickets/${ticketId}/status`, { status });
  },

  // Approve ticket (Manager only)
  approveTicket: async (ticketId: number, comments?: string): Promise<Ticket> => {
    return api.post<Ticket>(`/api/tickets/${ticketId}/approve`, { comments });
  },

  // Reject ticket (Manager only)
  rejectTicket: async (ticketId: number, comments: string): Promise<Ticket> => {
    return api.post<Ticket>(`/api/tickets/${ticketId}/reject`, { comments });
  },

  // Get pending approvals (Manager only)
  getPendingApprovals: async (): Promise<Ticket[]> => {
    return api.get<Ticket[]>('/api/tickets/pending-approvals');
  },

  // Download attachment
  downloadAttachment: async (attachmentId: number): Promise<Blob> => {
    return api.get(`/api/tickets/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    });
  },
};

export default ticketsService;