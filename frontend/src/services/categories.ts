// src/services/categories.ts
import { api } from './api';
import { Category, SubCategory, Item, TicketTemplate } from '../types';

export const categoriesService = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    return api.get<Category[]>('/categories');
  },

  // Get subcategories for a category
  getSubCategories: async (categoryId: number): Promise<SubCategory[]> => {
    return api.get<SubCategory[]>(`/categories/${categoryId}/subcategories`);
  },

  // Get items for a subcategory
  getItemsBySubCategory: async (subCategoryId: number): Promise<Item[]> => {
    return api.get<Item[]>(`/categories/items-by-subcategory/${subCategoryId}`);
  },

  // Get templates for an item
  getTemplatesByItem: async (itemId: number): Promise<TicketTemplate[]> => {
    return api.get<TicketTemplate[]>(`/categories/templates-by-item/${itemId}`);
  },
};

export default categoriesService;