// src/services/departments.ts
import { api } from './api';
import { Department } from '../types';

export const departmentService = {
  // Get all departments
  getAllDepartments: async (): Promise<Department[]> => {
    const response = await api.get('/departments');
    return response;
  },

  // Get department by ID
  getDepartmentById: async (id: number): Promise<Department> => {
    const response = await api.get(`/api/departments/${id}`);
    return response.data;
  },

  // Create new department
  createDepartment: async (data: { name: string; description?: string }): Promise<Department> => {
    const response = await api.post('/departments', data);
    return response.data.department;
  },

  // Update department
  updateDepartment: async (id: number, data: { name: string; description?: string }): Promise<Department> => {
    const response = await api.put(`/api/departments/${id}`, data);
    return response.data.department;
  },

  // Delete department
  deleteDepartment: async (id: number): Promise<void> => {
    await api.delete(`/api/departments/${id}`);
  },

  // Assign user to department
  assignUserToDepartment: async (departmentId: number, userId: number): Promise<void> => {
    await api.put(`/api/departments/${departmentId}/assign-user/${userId}`);
  }
};