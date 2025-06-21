// src/services/bsgTemplate.ts
import { api } from './api';
import {
  BSGTemplate,
  BSGTemplateCategory,
  BSGTemplateSearchRequest,
  BSGTemplateSearchResponse,
  BSGMasterDataRequest,
  BSGMasterDataResponse,
  BSGFieldTypesResponse,
  BSGFieldType,
  MasterDataEntity,
  BSGBranch,
  BSGTerminal,
  BSGBank,
  BSGTemplateUsageLog,
  BSGTemplateAnalytics
} from '../types';

/**
 * BSG Template System API Service
 * Provides methods to interact with the BSG banking template system
 */
export class BSGTemplateService {
  
  // Template Management APIs
  
  /**
   * Search for templates based on criteria
   */
  static async searchTemplates(request: BSGTemplateSearchRequest): Promise<BSGTemplateSearchResponse> {
    const params = new URLSearchParams();
    
    if (request.query) params.append('query', request.query);
    if (request.categoryId) params.append('categoryId', request.categoryId.toString());
    if (request.subcategoryId) params.append('subcategoryId', request.subcategoryId.toString());
    if (request.language) params.append('language', request.language);
    if (request.limit) params.append('limit', request.limit.toString());
    if (request.offset) params.append('offset', request.offset.toString());
    
    return api.get<BSGTemplateSearchResponse>(`/api/template-management/search?${params.toString()}`);
  }

  /**
   * Get popular templates
   */
  static async getPopularTemplates(language: 'en' | 'id' = 'en', limit: number = 10): Promise<BSGTemplateSearchResponse> {
    return api.get<BSGTemplateSearchResponse>(`/api/template-management/popular?language=${language}&limit=${limit}`);
  }

  /**
   * Get template categories
   */
  static async getCategories(language: 'en' | 'id' = 'en'): Promise<{ success: boolean; data: BSGTemplateCategory[] }> {
    return api.get(`/api/template-management/categories?language=${language}`);
  }

  /**
   * Get template by ID
   */
  static async getTemplateById(templateId: number, language: 'en' | 'id' = 'en'): Promise<{ success: boolean; data: BSGTemplate }> {
    return api.get(`/api/template-management/templates/${templateId}?language=${language}`);
  }

  /**
   * Get recently used templates for current user
   */
  static async getRecentTemplates(limit: number = 5): Promise<{ success: boolean; data: BSGTemplate[] }> {
    return api.get(`/api/template-management/recent?limit=${limit}`);
  }

  /**
   * Log template usage
   */
  static async logTemplateUsage(
    templateId: number,
    usageType: 'view' | 'start' | 'complete' | 'abandon',
    ticketId?: number,
    completionTime?: number
  ): Promise<{ success: boolean }> {
    return api.post('/api/template-management/usage', {
      templateId,
      usageType,
      ticketId,
      completionTime
    });
  }

  // Master Data APIs

  /**
   * Get master data entities by type
   */
  static async getMasterData(request: BSGMasterDataRequest): Promise<BSGMasterDataResponse> {
    const params = new URLSearchParams();
    
    if (request.search) params.append('search', request.search);
    if (request.parentId) params.append('parentId', request.parentId.toString());
    if (request.isActive !== undefined) params.append('isActive', request.isActive.toString());
    if (request.limit) params.append('limit', request.limit.toString());
    if (request.offset) params.append('offset', request.offset.toString());
    
    return api.get<BSGMasterDataResponse>(`/api/master-data/${request.type}?${params.toString()}`);
  }

  /**
   * Get BSG bank branches
   */
  static async getBranches(search?: string, limit?: number): Promise<BSGMasterDataResponse> {
    return this.getMasterData({
      type: 'branch',
      search,
      limit,
      isActive: true
    });
  }

  /**
   * Get BSG terminals
   */
  static async getTerminals(search?: string, branchCode?: string, limit?: number): Promise<BSGMasterDataResponse> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (branchCode) params.append('branchCode', branchCode);
    if (limit) params.append('limit', limit.toString());
    params.append('isActive', 'true');
    
    return api.get<BSGMasterDataResponse>(`/api/master-data/terminal?${params.toString()}`);
  }

  /**
   * Get bank codes
   */
  static async getBankCodes(search?: string, atmBersama?: boolean, limit?: number): Promise<BSGMasterDataResponse> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (atmBersama !== undefined) params.append('atmBersama', atmBersama.toString());
    if (limit) params.append('limit', limit.toString());
    params.append('isActive', 'true');
    
    return api.get<BSGMasterDataResponse>(`/api/master-data/bank_code?${params.toString()}`);
  }

  // Field Types APIs

  /**
   * Get all field types
   */
  static async getFieldTypes(): Promise<BSGFieldTypesResponse> {
    return api.get<BSGFieldTypesResponse>('/api/field-types');
  }

  /**
   * Get field type by name
   */
  static async getFieldTypeByName(fieldTypeName: string): Promise<{ success: boolean; data: BSGFieldType }> {
    return api.get(`/api/field-types/${fieldTypeName}`);
  }

  /**
   * Get field types by category
   */
  static async getFieldTypesByCategory(category: string): Promise<{ success: boolean; data: BSGFieldType[] }> {
    return api.get(`/api/field-types/category/${category}`);
  }

  // Validation and Helper Methods

  /**
   * Validate currency IDR value
   */
  static validateCurrencyIDR(value: string): { isValid: boolean; errorMessage?: string } {
    if (!value || value.trim() === '') {
      return { isValid: false, errorMessage: 'Amount is required' };
    }

    // Remove currency formatting
    const numericValue = value.replace(/[^\d]/g, '');
    const amount = parseInt(numericValue);

    if (isNaN(amount) || amount <= 0) {
      return { isValid: false, errorMessage: 'Please enter a valid amount' };
    }

    if (amount > 999999999999) { // 999 billion IDR
      return { isValid: false, errorMessage: 'Amount is too large' };
    }

    return { isValid: true };
  }

  /**
   * Format currency IDR
   */
  static formatCurrencyIDR(amount: number | string): string {
    const numericAmount = typeof amount === 'string' ? parseInt(amount.replace(/[^\d]/g, '')) : amount;
    
    if (isNaN(numericAmount)) return 'Rp 0';
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericAmount);
  }

  /**
   * Validate account number
   */
  static validateAccountNumber(value: string, bankCode?: string): { isValid: boolean; errorMessage?: string } {
    if (!value || value.trim() === '') {
      return { isValid: false, errorMessage: 'Account number is required' };
    }

    // Remove spaces and special characters
    const cleanValue = value.replace(/[^\d]/g, '');

    if (cleanValue.length < 6) {
      return { isValid: false, errorMessage: 'Account number must be at least 6 digits' };
    }

    if (cleanValue.length > 20) {
      return { isValid: false, errorMessage: 'Account number must not exceed 20 digits' };
    }

    // Bank-specific validation could be added here based on bankCode
    return { isValid: true };
  }

  /**
   * Validate terminal ID
   */
  static validateTerminalID(value: string): { isValid: boolean; errorMessage?: string } {
    if (!value || value.trim() === '') {
      return { isValid: false, errorMessage: 'Terminal ID is required' };
    }

    // Terminal ID format: usually alphanumeric, 6-12 characters
    const cleanValue = value.replace(/[^A-Za-z0-9]/g, '');

    if (cleanValue.length < 6) {
      return { isValid: false, errorMessage: 'Terminal ID must be at least 6 characters' };
    }

    if (cleanValue.length > 12) {
      return { isValid: false, errorMessage: 'Terminal ID must not exceed 12 characters' };
    }

    return { isValid: true };
  }

  // Analytics APIs (for admin/manager dashboard)

  /**
   * Get template analytics
   */
  static async getTemplateAnalytics(
    startDate?: string,
    endDate?: string,
    departmentId?: number
  ): Promise<{ success: boolean; data: BSGTemplateAnalytics }> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (departmentId) params.append('departmentId', departmentId.toString());
    
    return api.get(`/api/template-management/analytics?${params.toString()}`);
  }

  // Utility Methods

  /**
   * Get display name based on current language
   */
  static getDisplayName(item: { displayName: string; displayNameId?: string }, language: 'en' | 'id' = 'en'): string {
    if (language === 'id' && item.displayNameId) {
      return item.displayNameId;
    }
    return item.displayName;
  }

  /**
   * Get description based on current language
   */
  static getDescription(item: { description?: string; descriptionId?: string }, language: 'en' | 'id' = 'en'): string {
    if (language === 'id' && item.descriptionId) {
      return item.descriptionId;
    }
    return item.description || '';
  }

  /**
   * Build search query string for templates
   */
  static buildSearchQuery(filters: {
    query?: string;
    category?: string;
    subcategory?: string;
    recent?: boolean;
    popular?: boolean;
  }): string {
    const parts: string[] = [];
    
    if (filters.query) parts.push(filters.query);
    if (filters.category) parts.push(`category:${filters.category}`);
    if (filters.subcategory) parts.push(`subcategory:${filters.subcategory}`);
    if (filters.recent) parts.push('recent:true');
    if (filters.popular) parts.push('popular:true');
    
    return parts.join(' ');
  }

  /**
   * Parse search query string
   */
  static parseSearchQuery(query: string): {
    text: string;
    filters: Record<string, string>;
  } {
    const filters: Record<string, string> = {};
    const textParts: string[] = [];
    
    const parts = query.split(' ');
    
    for (const part of parts) {
      if (part.includes(':')) {
        const [key, value] = part.split(':');
        filters[key] = value;
      } else {
        textParts.push(part);
      }
    }
    
    return {
      text: textParts.join(' '),
      filters
    };
  }
}

// Export both class and default export for flexibility
export default BSGTemplateService;