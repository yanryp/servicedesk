// src/services/auth.ts
import { api } from './api';
import { AuthResponse, LoginRequest, RegisterRequest, AuthUser } from '../types';

export const authService = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/login', credentials);
  },

  // Register user
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/register', userData);
  },

  // Get current user profile
  getProfile: async (): Promise<AuthUser> => {
    return api.get<AuthUser>('/auth/profile');
  },

  // Logout (client-side only)
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('authUser');
    return !!(token && user);
  },

  // Get stored user
  getStoredUser: (): AuthUser | null => {
    try {
      const userStr = localStorage.getItem('authUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  // Get stored token
  getStoredToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  // Get all BSG branches for user assignment (independent of department)
  getAllBranches: async (): Promise<any[]> => {
    return api.get<any[]>('/auth/branches');
  },

  // Get units by department for user management (legacy)
  getUnitsByDepartment: async (departmentId: number): Promise<any[]> => {
    return api.get<any[]>(`/auth/units/${departmentId}`);
  },

  // Get potential managers by department for user management
  getManagersByDepartment: async (departmentId: number): Promise<any[]> => {
    return api.get<any[]>(`/auth/managers/${departmentId}`);
  },
};

export default authService;