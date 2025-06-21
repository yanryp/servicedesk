// src/types/index.ts

// Enums
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketStatus = 
  | 'open'
  | 'in_progress'
  | 'pending_requester_response'
  | 'resolved'
  | 'closed'
  | 'awaiting_approval'
  | 'approved'
  | 'rejected'
  | 'pending-approval'
  | 'awaiting-changes'
  | 'assigned'
  | 'cancelled';

export type UserRole = 'admin' | 'manager' | 'technician' | 'requester';

export type CustomFieldType = 'text' | 'number' | 'date' | 'dropdown' | 'radio' | 'checkbox';

// Department interface
export interface Department {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  users?: User[];
  categories?: Category[];
  _count?: {
    users: number;
    categories: number;
  };
}

// User interfaces
export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  departmentId?: number;
  managerId?: number;
  createdAt: string;
  updatedAt: string;
  department?: Department;
  manager?: User;
  subordinates?: User[];
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  departmentId?: number;
  department?: Department;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

// Category interfaces
export interface Category {
  id: number;
  name: string;
  departmentId?: number;
  department?: Department;
  subCategories?: SubCategory[];
}

export interface SubCategory {
  id: number;
  name: string;
  categoryId: number;
  category?: Category;
  items?: Item[];
}

export interface Item {
  id: number;
  name: string;
  subCategoryId: number;
  subCategory?: SubCategory;
  templates?: TicketTemplate[];
}

// Template and Custom Field interfaces
export interface CustomFieldDefinition {
  id: number;
  templateId: number;
  fieldName: string;
  fieldLabel?: string;
  fieldType: CustomFieldType;
  options?: string[] | null;
  isRequired: boolean;
  placeholder?: string;
  defaultValue?: string;
}

export interface TicketTemplate {
  id: number;
  name: string;
  description?: string;
  itemId?: number;
  item?: Item;
  customFieldDefinitions?: CustomFieldDefinition[];
  customFields?: CustomFieldDefinition[]; // Alternative naming used in API
}

export interface TicketCustomFieldValue {
  id?: number;
  ticketId?: number;
  fieldDefinitionId: number;
  value: string;
  fieldDefinition?: CustomFieldDefinition;
}

// Ticket interfaces
export interface TicketAttachment {
  id: number;
  ticketId: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType?: string;
  uploadedByUserId?: number;
  createdAt: string;
  uploadedBy?: User;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdByUserId: number;
  assignedToUserId?: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  slaDueDate?: string;
  itemId?: number;
  templateId?: number;
  managerComments?: string;
  
  // Categorization fields
  userRootCause?: RootCauseType;
  userIssueCategory?: IssueCategoryType;
  userCategorizedAt?: string;
  techRootCause?: RootCauseType;
  techIssueCategory?: IssueCategoryType;
  techCategorizedAt?: string;
  confirmedRootCause?: RootCauseType;
  confirmedIssueCategory?: IssueCategoryType;
  isClassificationLocked?: boolean;
  techOverrideReason?: string;
  
  // Relations
  createdBy?: User;
  assignedTo?: User;
  item?: Item;
  template?: TicketTemplate;
  attachments?: TicketAttachment[];
  customFieldValues?: TicketCustomFieldValue[];
}

// Request/Response interfaces
export interface CreateTicketRequest {
  title: string;
  description: string;
  itemId: number;
  templateId?: number;
  priority?: TicketPriority;
  customFieldValues?: Omit<TicketCustomFieldValue, 'id' | 'ticketId'>[];
  userRootCause?: RootCauseType;
  userIssueCategory?: IssueCategoryType;
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedToUserId?: number;
  managerComments?: string;
  customFieldValues?: Omit<TicketCustomFieldValue, 'id' | 'ticketId'>[];
}

export interface TicketsResponse {
  tickets: Ticket[];
  totalPages: number;
  currentPage: number;
  totalTickets: number;
}

export interface TicketFilters {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  search?: string;
  assignedToUserId?: number;
  createdByUserId?: number;
}

// Form interfaces
export interface TicketFormData {
  title: string;
  description: string;
  priority: TicketPriority;
  categoryId?: number;
  subCategoryId?: number;
  itemId?: number;
  templateId?: number;
  customFieldValues: Record<string, string>;
  attachments?: FileList;
}

// API Response interfaces
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  database: 'connected' | 'disconnected';
  timestamp: string;
}

// Categorization types
export type RootCauseType = 'human_error' | 'system_error' | 'external_factor' | 'undetermined';
export type IssueCategoryType = 'request' | 'complaint' | 'problem';

export interface TicketCategorization {
  userRootCause?: RootCauseType;
  userIssueCategory?: IssueCategoryType;
  userCategorizedAt?: string;
  techRootCause?: RootCauseType;
  techIssueCategory?: IssueCategoryType;
  techCategorizedAt?: string;
  confirmedRootCause?: RootCauseType;
  confirmedIssueCategory?: IssueCategoryType;
  isLocked?: boolean;
}

export interface CategorizationSuggestion {
  issueCategory: IssueCategoryType;
  rootCause: RootCauseType;
  confidence: 'low' | 'medium' | 'high';
}

export interface CategorizationOption {
  value: string;
  label: string;
  description: string;
}

export interface CategorizationRequest {
  rootCause?: RootCauseType;
  issueCategory?: IssueCategoryType;
  overrideReason?: string;
  reason?: string;
}

export interface BulkCategorizationRequest {
  ticketIds: number[];
  rootCause: RootCauseType;
  issueCategory: IssueCategoryType;
  reason: string;
}

export interface CategorizationAnalytics {
  overview: {
    totalTickets: number;
    categorizedTickets: number;
    uncategorizedTickets: number;
    completionRate: number;
  };
  distributions: {
    rootCause: Array<{
      type: RootCauseType;
      count: number;
      percentage: number;
    }>;
    issueCategory: Array<{
      type: IssueCategoryType;
      count: number;
      percentage: number;
    }>;
  };
  qualityMetrics: {
    totalOverrides: number;
    userAccuracyRate: number;
  };
}

// BSG Template System Types

// Master Data Types
export interface MasterDataEntity {
  id: number;
  type: string;
  code: string;
  name: string;
  nameIndonesian?: string;
  description?: string;
  metadata?: Record<string, any>;
  parentId?: number;
  departmentId?: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: MasterDataEntity;
  children?: MasterDataEntity[];
  department?: Department;
}

// Field Type System
export interface BSGFieldType {
  id: number;
  name: string;
  displayName: string;
  displayNameId: string; // Indonesian name
  category: string;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'object';
  validationRules?: Record<string, any>;
  metadata?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Enhanced Template System
export interface BSGTemplate {
  id: number;
  name: string;
  displayName: string;
  displayNameId: string; // Indonesian name
  description?: string;
  descriptionId?: string; // Indonesian description
  categoryId: number;
  subcategoryId?: number;
  fieldDefinitions: BSGFieldDefinition[];
  metadata?: Record<string, any>;
  popularityScore: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: BSGTemplateCategory;
  subcategory?: BSGTemplateSubcategory;
}

export interface BSGTemplateCategory {
  id: number;
  name: string;
  displayName: string;
  displayNameId: string; // Indonesian name
  description?: string;
  descriptionId?: string; // Indonesian description
  parentId?: number;
  sortOrder: number;
  isActive: boolean;
  parent?: BSGTemplateCategory;
  children?: BSGTemplateCategory[];
  templates?: BSGTemplate[];
}

export interface BSGTemplateSubcategory {
  id: number;
  name: string;
  displayName: string;
  displayNameId: string; // Indonesian name
  categoryId: number;
  sortOrder: number;
  isActive: boolean;
  category?: BSGTemplateCategory;
  templates?: BSGTemplate[];
}

export interface BSGFieldDefinition {
  id: number;
  templateId: number;
  fieldTypeId: number;
  name: string;
  displayName: string;
  displayNameId: string; // Indonesian name
  placeholder?: string;
  placeholderId?: string; // Indonesian placeholder
  helpText?: string;
  helpTextId?: string; // Indonesian help text
  isRequired: boolean;
  sortOrder: number;
  validationRules?: Record<string, any>;
  fieldType?: BSGFieldType;
}

// API Request/Response Types
export interface BSGTemplateSearchRequest {
  query?: string;
  categoryId?: number;
  subcategoryId?: number;
  language?: 'en' | 'id';
  limit?: number;
  offset?: number;
}

export interface BSGTemplateSearchResponse {
  data: BSGTemplate[];
  total: number;
  categories: BSGTemplateCategory[];
  suggestions?: string[];
}

export interface BSGMasterDataRequest {
  type: string;
  search?: string;
  parentId?: number;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface BSGMasterDataResponse {
  success: boolean;
  data: MasterDataEntity[];
  total: number;
  message?: string;
}

export interface BSGFieldTypesResponse {
  success: boolean;
  data: {
    all: BSGFieldType[];
    byCategory: Record<string, BSGFieldType[]>;
  };
  message?: string;
}

// Usage Tracking
export interface BSGTemplateUsageLog {
  id: number;
  templateId: number;
  userId: number;
  departmentId?: number;
  ticketId?: number;
  usageType: 'view' | 'start' | 'complete' | 'abandon';
  completionTime?: number; // milliseconds
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// Form and Validation Types
export interface BSGDynamicFieldValue {
  fieldDefinitionId: number;
  value: any;
  isValid?: boolean;
  errorMessage?: string;
}

export interface BSGTicketFormData {
  templateId: number;
  title: string;
  description: string;
  priority: TicketPriority;
  fieldValues: BSGDynamicFieldValue[];
}

// Indonesian Language Support
export interface InternationalizationText {
  en: string;
  id: string; // Indonesian
}

export interface BSGLanguageContext {
  currentLanguage: 'en' | 'id';
  translations: Record<string, InternationalizationText>;
  setLanguage: (lang: 'en' | 'id') => void;
  t: (key: string) => string;
}

// Banking Specific Types
export interface BSGBranch extends MasterDataEntity {
  metadata: {
    branch_code: string;
    region: string;
    area: string;
    address?: string;
    phone?: string;
    manager_name?: string;
  };
}

export interface BSGTerminal extends MasterDataEntity {
  metadata: {
    terminal_type: 'ATM' | 'CDM' | 'CRM' | 'KTM';
    location: string;
    branch_code?: string;
    ip_address?: string;
    vendor?: string;
    model?: string;
    installation_date?: string;
  };
}

export interface BSGBank extends MasterDataEntity {
  metadata: {
    bank_type: 'COMMERCIAL' | 'SYARIAH' | 'RURAL' | 'FOREIGN';
    is_atm_bersama: boolean;
    swift_code?: string;
    website?: string;
  };
}

// Analytics and Reporting
export interface BSGTemplateAnalytics {
  popularTemplates: Array<{
    template: BSGTemplate;
    usageCount: number;
    completionRate: number;
    avgCompletionTime: number;
  }>;
  categoryDistribution: Array<{
    category: BSGTemplateCategory;
    usageCount: number;
    percentage: number;
  }>;
  departmentUsage: Array<{
    department: Department;
    usageCount: number;
    favoriteTemplates: BSGTemplate[];
  }>;
  timeSeriesUsage: Array<{
    date: string;
    usageCount: number;
    uniqueUsers: number;
  }>;
}

// Error interfaces
export interface ApiError {
  message: string;
  status?: number;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}