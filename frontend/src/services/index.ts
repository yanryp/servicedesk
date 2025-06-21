// src/services/index.ts
export { default as api } from './api';
export { default as authService } from './auth';
export { default as categoriesService } from './categories';
export { default as templatesService } from './templates';
export { default as ticketsService } from './tickets';
export { default as categorizationService } from './categorization';

// BSG Template System Services
export { BSGTemplateService, default as bsgTemplateService } from './bsgTemplate';
export { I18nService, default as i18nService, useI18n } from './i18n';

// Re-export types for convenience
export * from '../types';