// src/services/templates.ts
// DEPRECATED: This service is deprecated as part of Stage 6 migration to unified ITIL system
// Use service templates or BSG templates instead
// TODO: Remove after migrating TemplateSelector.tsx to use modern template systems
import { api } from './api';
import { TicketTemplate } from '../types';

export const templatesService = {
  // Get all templates
  getTemplates: async (): Promise<TicketTemplate[]> => {
    return api.get<TicketTemplate[]>('/templates');
  },

  // Get template by ID with custom fields
  getTemplate: async (templateId: number): Promise<TicketTemplate> => {
    return api.get<TicketTemplate>(`/api/templates/${templateId}`);
  },

  // Create new template (Admin/Manager only)
  createTemplate: async (templateData: {
    name: string;
    description?: string;
    item_id?: number;
  }): Promise<TicketTemplate> => {
    return api.post<TicketTemplate>('/templates', templateData);
  },

  // Update template (Admin/Manager only)
  updateTemplate: async (templateId: number, templateData: Partial<{
    name: string;
    description: string;
    item_id: number;
  }>): Promise<TicketTemplate> => {
    return api.put<TicketTemplate>(`/api/templates/${templateId}`, templateData);
  },

  // Delete template (Admin/Manager only)
  deleteTemplate: async (templateId: number): Promise<void> => {
    return api.delete(`/api/templates/${templateId}`);
  },
};

export default templatesService;