// src/services/categorization.ts
import { api } from './api';
import {
  CategorizationSuggestion,
  CategorizationOption,
  CategorizationRequest,
  BulkCategorizationRequest,
  CategorizationAnalytics,
  Ticket,
  ApiResponse
} from '../types';

export const categorizationService = {
  // Get categorization suggestions for a service item
  async getSuggestions(serviceItemId: number): Promise<{
    serviceItem: any;
    suggestions: CategorizationSuggestion;
    options: {
      issueCategories: CategorizationOption[];
      rootCauses: CategorizationOption[];
    };
  }> {
    const response = await api.get(`/categorization/suggestions/${serviceItemId}`);
    return response.data.data;
  },

  // Update ticket categorization
  async updateCategorization(
    ticketId: number,
    categorization: CategorizationRequest
  ): Promise<{
    ticket: Ticket;
    categorization: any;
    auditTrail: any[];
  }> {
    const response = await api.put(`/categorization/${ticketId}`, categorization);
    return response.data.data;
  },

  // Bulk categorization
  async bulkCategorization(
    request: BulkCategorizationRequest
  ): Promise<{
    processedTickets: number;
    skippedTickets: number;
    categorization: {
      rootCause: string;
      issueCategory: string;
      reason: string;
    };
  }> {
    const response = await api.post('/categorization/bulk', request);
    return response.data.data;
  },

  // Get uncategorized tickets
  async getUncategorizedTickets(params?: {
    page?: number;
    limit?: number;
    department?: number;
    priority?: string;
  }): Promise<{
    tickets: Ticket[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalTickets: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    summary: {
      uncategorized: number;
      requiresRootCause: number;
      requiresIssueCategory: number;
    };
  }> {
    const response = await api.get('/categorization/uncategorized', { params });
    
    // The api.get() method already extracts response.data, so we need to check if it contains the actual data
    // or if it has a nested data property
    if (response.data && response.data.tickets) {
      // Direct data structure - response already contains the data we need
      return response.data;
    } else if (response.data && response.data.data) {
      // Nested data structure - extract the inner data
      return response.data.data;
    } else {
      // Fallback to response directly
      return response;
    }
  },

  // Lock/unlock ticket classification
  async lockClassification(
    ticketId: number,
    locked: boolean,
    reason?: string
  ): Promise<{
    ticketId: number;
    isLocked: boolean;
  }> {
    const response = await api.post(`/categorization/${ticketId}/lock`, {
      locked,
      reason
    });
    return response.data.data;
  },

  // Analytics endpoints
  analytics: {
    // Get categorization overview
    async getOverview(params?: {
      startDate?: string;
      endDate?: string;
      department?: number;
    }): Promise<CategorizationAnalytics> {
      const response = await api.get('/analytics/categorization/overview', { params });
      const data = response.data.data; // The backend returns nested data under response.data.data
      
      // The API already returns the data in the correct structure with overview nested
      return {
        overview: data.overview,
        distributions: data.distributions,
        qualityMetrics: data.qualityMetrics
      };
    },

    // Get categorization trends
    async getTrends(params?: {
      startDate?: string;
      endDate?: string;
      department?: number;
      interval?: 'day' | 'week' | 'month';
    }): Promise<{
      trends: any[];
      summary: {
        totalPeriods: number;
        averageTicketsPerPeriod: number;
        averageCategorizationRate: number;
      };
      config: {
        interval: string;
        startDate?: string;
        endDate?: string;
        department?: number;
      };
    }> {
      const response = await api.get('/analytics/categorization/trends', { params });
      return response.data.data;
    },

    // Get service patterns
    async getServicePatterns(params?: {
      startDate?: string;
      endDate?: string;
      department?: number;
    }): Promise<{
      servicePatterns: any[];
      summary: {
        totalServices: number;
        totalAnalyzedTickets: number;
        topService: any;
        serviceTypes: Record<string, number>;
      };
    }> {
      const response = await api.get('/analytics/categorization/service-patterns', { params });
      return response.data.data;
    },

    // Get technician performance
    async getTechnicianPerformance(params?: {
      startDate?: string;
      endDate?: string;
      department?: number;
    }): Promise<{
      performanceMetrics: any[];
      summary: {
        totalTechnicians: number;
        totalCategorizations: number;
        topPerformer: any;
        averageProductivity: number;
      };
    }> {
      const response = await api.get('/analytics/categorization/technician-performance', { params });
      return response.data.data;
    },

    // Export data
    async exportData(params?: {
      format?: 'json' | 'csv';
      startDate?: string;
      endDate?: string;
      department?: number;
    }): Promise<Blob | any> {
      const format = params?.format || 'json';
      
      if (format === 'csv') {
        const response = await api.get('/analytics/categorization/export', {
          params,
          responseType: 'blob'
        });
        return response.data;
      } else {
        const response = await api.get('/analytics/categorization/export', { params });
        return response.data.data;
      }
    }
  }
};

export default categorizationService;