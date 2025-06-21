// Shared Field Component Library for BSG Templates
import React from 'react';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UserIcon, 
  CurrencyDollarIcon,
  DocumentTextIcon,
  ClockIcon,
  BuildingOfficeIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

// Common field configurations that can be reused across templates
export const COMMON_FIELD_CONFIGS = {
  'Cabang/Capem': {
    fieldType: 'dropdown_branch',
    icon: BuildingOfficeIcon,
    category: 'location',
    color: 'border-blue-300 focus:border-blue-500',
    helpText: 'Pilih cabang atau kantor cabang pembantu tempat Anda bertugas',
    placeholder: 'Pilih Cabang/Capem',
    validation: { required: true }
  },
  'Kode User': {
    fieldType: 'text_short',
    icon: IdentificationIcon,
    category: 'user_identity',
    color: 'border-green-300 focus:border-green-500',
    helpText: 'Masukkan kode user sesuai dengan yang terdaftar di sistem',
    placeholder: 'Contoh: U001',
    validation: { required: true, maxLength: 10 }
  },
  'Nama User': {
    fieldType: 'text',
    icon: UserIcon,
    category: 'user_identity',
    color: 'border-green-300 focus:border-green-500',
    helpText: 'Masukkan nama lengkap user yang akan diproses',
    placeholder: 'Nama lengkap user',
    validation: { required: true }
  },
  'Jabatan': {
    fieldType: 'text',
    icon: UserIcon,
    category: 'user_identity',
    color: 'border-green-300 focus:border-green-500',
    helpText: 'Masukkan jabatan user di cabang/kantor',
    placeholder: 'Contoh: Teller, Customer Service',
    validation: { required: true }
  },
  'Tanggal berlaku': {
    fieldType: 'date',
    icon: CalendarIcon,
    category: 'timing',
    color: 'border-purple-300 focus:border-purple-500',
    helpText: 'Pilih tanggal mulai berlakunya perubahan yang diminta',
    placeholder: 'YYYY-MM-DD',
    validation: { required: true }
  },
  'Nominal Transaksi': {
    fieldType: 'currency',
    icon: CurrencyDollarIcon,
    category: 'transaction',
    color: 'border-yellow-300 focus:border-yellow-500',
    helpText: 'Masukkan nominal transaksi dalam rupiah',
    placeholder: 'Contoh: 1000000',
    validation: { required: true, min: 0 }
  },
  'Nomor Rekening': {
    fieldType: 'number',
    icon: DocumentTextIcon,
    category: 'customer',
    color: 'border-indigo-300 focus:border-indigo-500',
    helpText: 'Masukkan nomor rekening tanpa spasi atau tanda baca',
    placeholder: 'Contoh: 1234567890',
    validation: { required: true }
  },
  'Program Fasilitas OLIBS': {
    fieldType: 'dropdown_olibs_menu',
    icon: DocumentTextIcon,
    category: 'permissions',
    color: 'border-red-300 focus:border-red-500',
    helpText: 'Pilih fasilitas/menu OLIBS yang diperlukan user',
    placeholder: 'Pilih menu OLIBS',
    validation: { required: true }
  }
};

// Field category metadata
export const FIELD_CATEGORIES = {
  'location': {
    name: 'Informasi Lokasi',
    description: 'Data lokasi cabang dan kantor',
    icon: MapPinIcon,
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600'
  },
  'user_identity': {
    name: 'Identitas User',
    description: 'Informasi identitas dan profil user',
    icon: UserIcon,
    color: 'bg-green-50 border-green-200',
    iconColor: 'text-green-600'
  },
  'timing': {
    name: 'Waktu dan Tanggal',
    description: 'Informasi tanggal dan waktu',
    icon: ClockIcon,
    color: 'bg-purple-50 border-purple-200',
    iconColor: 'text-purple-600'
  },
  'transaction': {
    name: 'Informasi Transaksi',
    description: 'Data transaksi dan nominal',
    icon: CurrencyDollarIcon,
    color: 'bg-yellow-50 border-yellow-200',
    iconColor: 'text-yellow-600'
  },
  'customer': {
    name: 'Data Nasabah',
    description: 'Informasi nasabah dan rekening',
    icon: UserIcon,
    color: 'bg-indigo-50 border-indigo-200',
    iconColor: 'text-indigo-600'
  },
  'reference': {
    name: 'Nomor Referensi',
    description: 'Nomor arsip dan referensi',
    icon: DocumentTextIcon,
    color: 'bg-gray-50 border-gray-200',
    iconColor: 'text-gray-600'
  },
  'transfer': {
    name: 'Mutasi/Transfer',
    description: 'Informasi mutasi dan transfer',
    icon: MapPinIcon,
    color: 'bg-orange-50 border-orange-200',
    iconColor: 'text-orange-600'
  },
  'permissions': {
    name: 'Hak Akses',
    description: 'Menu dan wewenang akses',
    icon: DocumentTextIcon,
    color: 'bg-red-50 border-red-200',
    iconColor: 'text-red-600'
  }
};

// Shared field validation functions
export const validateField = (fieldName: string, value: any, fieldConfig: any): string | null => {
  const config = COMMON_FIELD_CONFIGS[fieldName as keyof typeof COMMON_FIELD_CONFIGS];
  if (!config) return null;

  const validation = config.validation;
  
  // Required validation
  if (validation.required && (!value || value.toString().trim() === '')) {
    return `${fieldName} is required`;
  }
  
  // Max length validation
  if (validation.maxLength && value && value.toString().length > validation.maxLength) {
    return `${fieldName} must not exceed ${validation.maxLength} characters`;
  }
  
  // Min value validation (for numbers)
  if (validation.min !== undefined && value !== undefined && parseFloat(value) < validation.min) {
    return `${fieldName} must be at least ${validation.min}`;
  }
  
  // Field type specific validation
  if (config.fieldType === 'number' && value && isNaN(parseFloat(value))) {
    return `${fieldName} must be a valid number`;
  }
  
  if (config.fieldType === 'currency' && value && (isNaN(parseFloat(value)) || parseFloat(value) < 0)) {
    return `${fieldName} must be a valid positive amount`;
  }
  
  return null;
};

// Get field configuration by name
export const getFieldConfig = (fieldName: string) => {
  return COMMON_FIELD_CONFIGS[fieldName as keyof typeof COMMON_FIELD_CONFIGS] || null;
};

// Get all fields by category
export const getFieldsByCategory = (category: string) => {
  return Object.entries(COMMON_FIELD_CONFIGS)
    .filter(([_, config]) => config.category === category)
    .map(([name, config]) => ({ name, ...config }));
};

// Generate field statistics
export const getFieldStatistics = () => {
  const categoryStats: Record<string, number> = {};
  const typeStats: Record<string, number> = {};
  
  Object.values(COMMON_FIELD_CONFIGS).forEach(config => {
    categoryStats[config.category] = (categoryStats[config.category] || 0) + 1;
    typeStats[config.fieldType] = (typeStats[config.fieldType] || 0) + 1;
  });
  
  return {
    totalFields: Object.keys(COMMON_FIELD_CONFIGS).length,
    categories: categoryStats,
    fieldTypes: typeStats
  };
};

// Reusable field component props interface
export interface SharedFieldProps {
  fieldName: string;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  error?: string;
  showHelp?: boolean;
  className?: string;
}

// Pre-configured shared field components
export const SharedBranchField: React.FC<SharedFieldProps> = ({ 
  fieldName, value, onChange, disabled = false, error, showHelp = true, className = '' 
}) => {
  const config = COMMON_FIELD_CONFIGS['Cabang/Capem'];
  const Icon = config.icon;
  
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="flex items-center text-sm font-medium text-gray-700">
        <Icon className="h-4 w-4 mr-2" />
        Cabang/Capem
        <span className="text-red-500 ml-1">*</span>
      </label>
      
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          block w-full px-4 py-3 border rounded-xl shadow-sm transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:bg-gray-100
          ${config.color}
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
        `}
      >
        <option value="">{config.placeholder}</option>
        {/* Options will be loaded dynamically */}
      </select>
      
      {showHelp && (
        <p className="text-sm text-gray-500">{config.helpText}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export const SharedUserCodeField: React.FC<SharedFieldProps> = ({ 
  fieldName, value, onChange, disabled = false, error, showHelp = true, className = '' 
}) => {
  const config = COMMON_FIELD_CONFIGS['Kode User'];
  const Icon = config.icon;
  
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="flex items-center text-sm font-medium text-gray-700">
        <Icon className="h-4 w-4 mr-2" />
        Kode User
        <span className="text-red-500 ml-1">*</span>
      </label>
      
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={config.validation.maxLength}
        placeholder={config.placeholder}
        className={`
          block w-full px-4 py-3 border rounded-xl shadow-sm transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:bg-gray-100
          ${config.color}
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
        `}
      />
      
      {showHelp && (
        <p className="text-sm text-gray-500">{config.helpText}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      <p className="text-xs text-gray-400">
        {(value || '').length}/{config.validation.maxLength} karakter
      </p>
    </div>
  );
};

export const SharedCurrencyField: React.FC<SharedFieldProps> = ({ 
  fieldName, value, onChange, disabled = false, error, showHelp = true, className = '' 
}) => {
  const config = COMMON_FIELD_CONFIGS['Nominal Transaksi'];
  const Icon = config.icon;
  
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="flex items-center text-sm font-medium text-gray-700">
        <Icon className="h-4 w-4 mr-2" />
        Nominal Transaksi
        <span className="text-red-500 ml-1">*</span>
      </label>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 sm:text-sm">Rp</span>
        </div>
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || '')}
          disabled={disabled}
          placeholder={config.placeholder}
          step="0.01"
          min="0"
          className={`
            block w-full pl-12 px-4 py-3 border rounded-xl shadow-sm transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:bg-gray-100
            ${config.color}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          `}
        />
      </div>
      
      {showHelp && (
        <p className="text-sm text-gray-500">{config.helpText}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Export utility to create a field from configuration
export const createFieldFromConfig = (fieldName: string, props: SharedFieldProps) => {
  const config = getFieldConfig(fieldName);
  if (!config) return null;
  
  switch (fieldName) {
    case 'Cabang/Capem':
      return <SharedBranchField key={fieldName} fieldName={fieldName} {...props} />;
    case 'Kode User':
      return <SharedUserCodeField key={fieldName} fieldName={fieldName} {...props} />;
    case 'Nominal Transaksi':
      return <SharedCurrencyField key={fieldName} fieldName={fieldName} {...props} />;
    default:
      return null;
  }
};

export default {
  COMMON_FIELD_CONFIGS,
  FIELD_CATEGORIES,
  validateField,
  getFieldConfig,
  getFieldsByCategory,
  getFieldStatistics,
  SharedBranchField,
  SharedUserCodeField,
  SharedCurrencyField,
  createFieldFromConfig
};