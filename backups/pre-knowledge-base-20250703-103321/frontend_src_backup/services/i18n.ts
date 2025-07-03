// src/services/i18n.ts
import { InternationalizationText, BSGLanguageContext } from '../types';

/**
 * Indonesian Language Support Service
 * Provides translation and localization functionality for BSG Helpdesk
 */

// Core translation dictionary
const translations: Record<string, InternationalizationText> = {
  // General UI
  'common.search': {
    en: 'Search',
    id: 'Cari'
  },
  'common.filter': {
    en: 'Filter',
    id: 'Filter'
  },
  'common.clear': {
    en: 'Clear',
    id: 'Hapus'
  },
  'common.save': {
    en: 'Save',
    id: 'Simpan'
  },
  'common.cancel': {
    en: 'Cancel',
    id: 'Batal'
  },
  'common.submit': {
    en: 'Submit',
    id: 'Kirim'
  },
  'common.loading': {
    en: 'Loading...',
    id: 'Memuat...'
  },
  'common.error': {
    en: 'Error',
    id: 'Kesalahan'
  },
  'common.success': {
    en: 'Success',
    id: 'Berhasil'
  },
  'common.required': {
    en: 'Required',
    id: 'Wajib diisi'
  },
  'common.optional': {
    en: 'Optional',
    id: 'Opsional'
  },
  'common.select': {
    en: 'Select',
    id: 'Pilih'
  },
  'common.all': {
    en: 'All',
    id: 'Semua'
  },
  'common.none': {
    en: 'None',
    id: 'Tidak ada'
  },

  // BSG Template System
  'template.search.placeholder': {
    en: 'Search templates... (e.g., OLIBs, ATM, Mobile Banking)',
    id: 'Cari template... (contoh: OLIBs, ATM, Mobile Banking)'
  },
  'template.popular.title': {
    en: 'Popular Templates',
    id: 'Template Populer'
  },
  'template.recent.title': {
    en: 'Recently Used',
    id: 'Baru Digunakan'
  },
  'template.category.title': {
    en: 'Categories',
    id: 'Kategori'
  },
  'template.select.title': {
    en: 'Select Template',
    id: 'Pilih Template'
  },
  'template.usage.count': {
    en: 'times used',
    id: 'kali digunakan'
  },
  'template.completion.time': {
    en: 'avg completion',
    id: 'rata-rata selesai'
  },

  // Banking Specific Terms
  'banking.core.system': {
    en: 'Core Banking System',
    id: 'Sistem Core Banking'
  },
  'banking.mobile.banking': {
    en: 'Mobile Banking',
    id: 'Mobile Banking'
  },
  'banking.atm.operations': {
    en: 'ATM Operations',
    id: 'Operasional ATM'
  },
  'banking.branch': {
    en: 'Branch',
    id: 'Cabang'
  },
  'banking.terminal': {
    en: 'Terminal',
    id: 'Terminal'
  },
  'banking.account.number': {
    en: 'Account Number',
    id: 'Nomor Rekening'
  },
  'banking.amount': {
    en: 'Amount',
    id: 'Jumlah'
  },
  'banking.transaction.id': {
    en: 'Transaction ID',
    id: 'ID Transaksi'
  },
  'banking.terminal.id': {
    en: 'Terminal ID',
    id: 'ID Terminal'
  },
  'banking.error.code': {
    en: 'Error Code',
    id: 'Kode Error'
  },

  // Field Types
  'field.currency.idr': {
    en: 'Indonesian Rupiah',
    id: 'Rupiah Indonesia'
  },
  'field.branch.dropdown': {
    en: 'Bank Branch Selection',
    id: 'Pilihan Cabang Bank'
  },
  'field.terminal.dropdown': {
    en: 'Terminal Selection',
    id: 'Pilihan Terminal'
  },
  'field.account.number': {
    en: 'Account Number',
    id: 'Nomor Rekening'
  },
  'field.transaction.amount': {
    en: 'Transaction Amount',
    id: 'Jumlah Transaksi'
  },

  // Error Messages
  'error.required.field': {
    en: 'This field is required',
    id: 'Kolom ini wajib diisi'
  },
  'error.invalid.amount': {
    en: 'Please enter a valid amount',
    id: 'Silakan masukkan jumlah yang valid'
  },
  'error.invalid.account': {
    en: 'Please enter a valid account number',
    id: 'Silakan masukkan nomor rekening yang valid'
  },
  'error.network': {
    en: 'Network error. Please check your connection.',
    id: 'Kesalahan jaringan. Silakan periksa koneksi Anda.'
  },
  'error.server': {
    en: 'Server error. Please try again later.',
    id: 'Kesalahan server. Silakan coba lagi nanti.'
  },

  // Success Messages
  'success.ticket.created': {
    en: 'Ticket created successfully',
    id: 'Tiket berhasil dibuat'
  },
  'success.ticket.updated': {
    en: 'Ticket updated successfully',
    id: 'Tiket berhasil diperbarui'
  },
  'success.template.saved': {
    en: 'Template saved successfully',
    id: 'Template berhasil disimpan'
  },

  // Ticket Status
  'status.pending.approval': {
    en: 'Pending Approval',
    id: 'Menunggu Persetujuan'
  },
  'status.approved': {
    en: 'Approved',
    id: 'Disetujui'
  },
  'status.in.progress': {
    en: 'In Progress',
    id: 'Sedang Dikerjakan'
  },
  'status.resolved': {
    en: 'Resolved',
    id: 'Selesai'
  },
  'status.closed': {
    en: 'Closed',
    id: 'Ditutup'
  },

  // Priority Levels
  'priority.low': {
    en: 'Low',
    id: 'Rendah'
  },
  'priority.medium': {
    en: 'Medium',
    id: 'Sedang'
  },
  'priority.high': {
    en: 'High',
    id: 'Tinggi'
  },
  'priority.urgent': {
    en: 'Urgent',
    id: 'Mendesak'
  },

  // Time and Date
  'time.minutes': {
    en: 'minutes',
    id: 'menit'
  },
  'time.hours': {
    en: 'hours',
    id: 'jam'
  },
  'time.days': {
    en: 'days',
    id: 'hari'
  },
  'time.ago': {
    en: 'ago',
    id: 'yang lalu'
  },

  // Navigation
  'nav.dashboard': {
    en: 'Dashboard',
    id: 'Dasbor'
  },
  'nav.tickets': {
    en: 'Tickets',
    id: 'Tiket'
  },
  'nav.templates': {
    en: 'Templates',
    id: 'Template'
  },
  'nav.reports': {
    en: 'Reports',
    id: 'Laporan'
  },
  'nav.settings': {
    en: 'Settings',
    id: 'Pengaturan'
  },

  // Validation Messages
  'validation.min.length': {
    en: 'Minimum {min} characters required',
    id: 'Minimal {min} karakter diperlukan'
  },
  'validation.max.length': {
    en: 'Maximum {max} characters allowed',
    id: 'Maksimal {max} karakter diizinkan'
  },
  'validation.invalid.email': {
    en: 'Please enter a valid email address',
    id: 'Silakan masukkan alamat email yang valid'
  },
  'validation.passwords.mismatch': {
    en: 'Passwords do not match',
    id: 'Kata sandi tidak cocok'
  }
};

/**
 * I18n Service Class
 */
export class I18nService {
  private static currentLanguage: 'en' | 'id' = 'id'; // Default to Indonesian for BSG
  private static listeners: Array<(lang: 'en' | 'id') => void> = [];

  /**
   * Get current language
   */
  static getCurrentLanguage(): 'en' | 'id' {
    return this.currentLanguage;
  }

  /**
   * Set current language
   */
  static setLanguage(language: 'en' | 'id'): void {
    this.currentLanguage = language;
    localStorage.setItem('bsg-language', language);
    this.notifyListeners(language);
  }

  /**
   * Initialize language from localStorage
   */
  static initialize(): void {
    const savedLanguage = localStorage.getItem('bsg-language') as 'en' | 'id';
    if (savedLanguage && ['en', 'id'].includes(savedLanguage)) {
      this.currentLanguage = savedLanguage;
    }
  }

  /**
   * Subscribe to language changes
   */
  static subscribe(callback: (lang: 'en' | 'id') => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Notify all listeners of language change
   */
  private static notifyListeners(language: 'en' | 'id'): void {
    this.listeners.forEach(listener => listener(language));
  }

  /**
   * Translate a key to current language
   */
  static translate(key: string, params?: Record<string, string | number>): string {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    let text = translation[this.currentLanguage] || translation.en || key;

    // Replace parameters if provided
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(new RegExp(`{${param}}`, 'g'), value.toString());
      });
    }

    return text;
  }

  /**
   * Short alias for translate
   */
  static t(key: string, params?: Record<string, string | number>): string {
    return this.translate(key, params);
  }

  /**
   * Get all translations for a specific language
   */
  static getAllTranslations(language: 'en' | 'id'): Record<string, string> {
    const result: Record<string, string> = {};
    Object.entries(translations).forEach(([key, value]) => {
      result[key] = value[language] || value.en || key;
    });
    return result;
  }

  /**
   * Add custom translations
   */
  static addTranslations(newTranslations: Record<string, InternationalizationText>): void {
    Object.assign(translations, newTranslations);
  }

  /**
   * Format currency for Indonesian locale
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Format number for Indonesian locale
   */
  static formatNumber(number: number): string {
    return new Intl.NumberFormat('id-ID').format(number);
  }

  /**
   * Format date for Indonesian locale
   */
  static formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = this.currentLanguage === 'id' ? 'id-ID' : 'en-US';
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };

    return new Intl.DateTimeFormat(locale, options || defaultOptions).format(dateObj);
  }

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  static formatRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 60) {
      return `${diffMinutes} ${this.t('time.minutes')} ${this.t('time.ago')}`;
    } else if (diffHours < 24) {
      return `${diffHours} ${this.t('time.hours')} ${this.t('time.ago')}`;
    } else {
      return `${diffDays} ${this.t('time.days')} ${this.t('time.ago')}`;
    }
  }

  /**
   * Get language-specific display name
   */
  static getDisplayName(item: { displayName: string; displayNameId?: string }): string {
    if (this.currentLanguage === 'id' && item.displayNameId) {
      return item.displayNameId;
    }
    return item.displayName;
  }

  /**
   * Get language-specific description
   */
  static getDescription(item: { description?: string; descriptionId?: string }): string {
    if (this.currentLanguage === 'id' && item.descriptionId) {
      return item.descriptionId;
    }
    return item.description || '';
  }
}

/**
 * React Hook for using I18n
 */
export function useI18n(): BSGLanguageContext {
  const currentLanguage = I18nService.getCurrentLanguage();
  
  return {
    currentLanguage,
    translations,
    setLanguage: I18nService.setLanguage.bind(I18nService),
    t: I18nService.t.bind(I18nService)
  };
}

// Initialize on module load
I18nService.initialize();

export default I18nService;