// src/services/index.ts
export { default as api } from './api';
export { default as authService } from './auth';
export { default as categoriesService } from './categories';
export { default as templatesService } from './templates';
export { default as ticketsService } from './tickets';

// Re-export types for convenience
export * from '../types';