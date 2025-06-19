// src/services/categories.ts
import { api } from './api';
import { Category, SubCategory, Item, TicketTemplate } from '../types';

export const categoriesService = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    return api.get<Category[]>('/api/categories');
  },

  // Get subcategories for a category
  getSubCategories: async (categoryId: number): Promise<SubCategory[]> => {
    return api.get<SubCategory[]>(`/api/categories/${categoryId}/subcategories`);
  },

  // Get items for a subcategory
  getItemsBySubCategory: async (subCategoryId: number): Promise<Item[]> => {
    return api.get<Item[]>(`/api/categories/items-by-subcategory/${subCategoryId}`);
  },

  // Get templates for an item
  getTemplatesByItem: async (itemId: number): Promise<TicketTemplate[]> => {
    return api.get<TicketTemplate[]>(`/api/categories/templates-by-item/${itemId}`);
  },
};

export default categoriesService;