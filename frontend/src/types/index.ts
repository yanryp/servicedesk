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

// Error interfaces
export interface ApiError {
  message: string;
  status?: number;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}