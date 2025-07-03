import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import BSGDynamicFieldRenderer from '../BSGDynamicFieldRenderer';

// Mock the SharedFieldLibrary
jest.mock('../SharedFieldLibrary', () => ({
  FIELD_CATEGORIES: {
    location: {
      name: 'Informasi Lokasi',
      description: 'Data lokasi cabang dan kantor',
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600'
    },
    user_identity: {
      name: 'Identitas User',
      description: 'Informasi identitas dan profil user',
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600'
    }
  },
  validateField: jest.fn(() => null),
  getFieldConfig: jest.fn(() => ({
    fieldType: 'text_short',
    validation: { required: true }
  }))
}));

// Mock API calls
global.fetch = jest.fn();

const mockFields = [
  {
    id: 1,
    fieldName: 'Cabang/Capem',
    fieldLabel: 'Cabang/Capem',
    fieldType: 'dropdown_branch',
    isRequired: true,
    category: 'location',
    sortOrder: 1,
    validationRules: { required: true }
  },
  {
    id: 2,
    fieldName: 'Kode User',
    fieldLabel: 'Kode User',
    fieldType: 'text_short',
    isRequired: true,
    category: 'user_identity',
    sortOrder: 2,
    maxLength: 10,
    validationRules: { required: true, maxLength: 10 }
  },
  {
    id: 3,
    fieldName: 'Nominal Transaksi',
    fieldLabel: 'Nominal Transaksi',
    fieldType: 'currency',
    isRequired: true,
    category: 'transaction',
    sortOrder: 3,
    validationRules: { required: true, min: 0 }
  },
  {
    id: 4,
    fieldName: 'Tanggal berlaku',
    fieldLabel: 'Tanggal berlaku',
    fieldType: 'date',
    isRequired: true,
    category: 'timing',
    sortOrder: 4,
    validationRules: { required: true }
  }
];

const mockMasterData = {
  branch: [
    { code: '001', name: 'Kantor Pusat', level: 'pusat' },
    { code: '101', name: 'Cabang Manado', level: 'cabang' },
    { code: '201', name: 'Capem Tondano', level: 'capem' }
  ]
};

describe('BSGDynamicFieldRenderer', () => {
  const defaultProps = {
    templateId: 1,
    fields: mockFields,
    values: {},
    onChange: jest.fn(),
    errors: {},
    disabled: false,
    showCategories: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockMasterData.branch })
    });
  });

  test('renders all field types correctly', () => {
    render(<BSGDynamicFieldRenderer {...defaultProps} />);
    
    // Check if all field types are rendered
    expect(screen.getByLabelText(/Cabang\/Capem/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kode User/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nominal Transaksi/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tanggal berlaku/i)).toBeInTheDocument();
  });

  test('organizes fields by categories when showCategories is true', () => {
    render(<BSGDynamicFieldRenderer {...defaultProps} showCategories={true} />);
    
    // Should show category headers
    expect(screen.getByText('Informasi Lokasi')).toBeInTheDocument();
    expect(screen.getByText('Identitas User')).toBeInTheDocument();
  });

  test('renders fields in linear layout when showCategories is false', () => {
    render(<BSGDynamicFieldRenderer {...defaultProps} showCategories={false} />);
    
    // Should not show category headers
    expect(screen.queryByText('Informasi Lokasi')).not.toBeInTheDocument();
    expect(screen.queryByText('Identitas User')).not.toBeInTheDocument();
    
    // But all fields should still be present
    expect(screen.getByLabelText(/Cabang\/Capem/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kode User/i)).toBeInTheDocument();
  });

  test('handles dropdown_branch field type with master data loading', async () => {
    render(<BSGDynamicFieldRenderer {...defaultProps} />);
    
    // Find the branch dropdown
    const branchDropdown = screen.getByLabelText(/Cabang\/Capem/i);
    expect(branchDropdown).toBeInTheDocument();
    
    // Should load master data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/bsg-templates/master-data/branch');
    });
  });

  test('handles text_short field type with character limits', () => {
    render(<BSGDynamicFieldRenderer {...defaultProps} />);
    
    const kodeUserField = screen.getByLabelText(/Kode User/i) as HTMLInputElement;
    expect(kodeUserField).toBeInTheDocument();
    expect(kodeUserField.maxLength).toBe(10);
  });

  test('handles currency field type with proper formatting', () => {
    render(<BSGDynamicFieldRenderer {...defaultProps} />);
    
    const currencyField = screen.getByLabelText(/Nominal Transaksi/i);
    expect(currencyField).toBeInTheDocument();
    
    // Should have currency prefix indicator
    expect(screen.getByText('Rp')).toBeInTheDocument();
  });

  test('handles date field type', () => {
    render(<BSGDynamicFieldRenderer {...defaultProps} />);
    
    const dateField = screen.getByLabelText(/Tanggal berlaku/i) as HTMLInputElement;
    expect(dateField).toBeInTheDocument();
    expect(dateField.type).toBe('date');
  });

  test('displays required field indicators', () => {
    render(<BSGDynamicFieldRenderer {...defaultProps} />);
    
    // All fields in mockFields are required, so should see asterisks
    const requiredIndicators = screen.getAllByText('*');
    expect(requiredIndicators.length).toBeGreaterThan(0);
  });

  test('calls onChange when field values change', () => {
    const mockOnChange = jest.fn();
    render(<BSGDynamicFieldRenderer {...defaultProps} onChange={mockOnChange} />);
    
    const kodeUserField = screen.getByLabelText(/Kode User/i);
    fireEvent.change(kodeUserField, { target: { value: 'U001' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('Kode User', 'U001');
  });

  test('displays validation errors', () => {
    const errorsWithMessages = {
      'Kode User': 'This field is required'
    };
    
    render(<BSGDynamicFieldRenderer {...defaultProps} errors={errorsWithMessages} />);
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  test('disables all fields when disabled prop is true', () => {
    render(<BSGDynamicFieldRenderer {...defaultProps} disabled={true} />);
    
    const kodeUserField = screen.getByLabelText(/Kode User/i) as HTMLInputElement;
    const dateField = screen.getByLabelText(/Tanggal berlaku/i) as HTMLInputElement;
    
    expect(kodeUserField.disabled).toBe(true);
    expect(dateField.disabled).toBe(true);
  });

  test('handles field sorting correctly', () => {
    const fieldsWithDifferentOrder = [
      { ...mockFields[1], sortOrder: 1 }, // Kode User first
      { ...mockFields[0], sortOrder: 2 }  // Cabang/Capem second
    ];
    
    render(<BSGDynamicFieldRenderer {...defaultProps} fields={fieldsWithDifferentOrder} />);
    
    // Fields should be rendered in sort order
    const fieldElements = screen.getAllByRole('textbox');
    // First textbox should be Kode User (based on sort order)
    expect(fieldElements[0]).toHaveAttribute('placeholder', expect.stringContaining('Kode User'));
  });

  test('handles empty fields array gracefully', () => {
    render(<BSGDynamicFieldRenderer {...defaultProps} fields={[]} />);
    
    // Should render without crashing and show no fields message
    expect(screen.getByText(/No fields to display/i)).toBeInTheDocument();
  });

  test('loads and displays master data options for dropdown fields', async () => {
    render(<BSGDynamicFieldRenderer {...defaultProps} />);
    
    await waitFor(() => {
      const branchDropdown = screen.getByLabelText(/Cabang\/Capem/i);
      expect(branchDropdown).toBeInTheDocument();
    });
    
    // Should have loaded the master data options
    expect(global.fetch).toHaveBeenCalledWith('/api/bsg-templates/master-data/branch');
  });

  test('handles master data loading errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    render(<BSGDynamicFieldRenderer {...defaultProps} />);
    
    await waitFor(() => {
      // Should still render the dropdown, but with error handling
      const branchDropdown = screen.getByLabelText(/Cabang\/Capem/i);
      expect(branchDropdown).toBeInTheDocument();
    });
  });

  test('respects field value props', () => {
    const valuesWithData = {
      'Kode User': 'U001',
      'Nominal Transaksi': 1000000
    };
    
    render(<BSGDynamicFieldRenderer {...defaultProps} values={valuesWithData} />);
    
    const kodeUserField = screen.getByLabelText(/Kode User/i) as HTMLInputElement;
    const currencyField = screen.getByLabelText(/Nominal Transaksi/i) as HTMLInputElement;
    
    expect(kodeUserField.value).toBe('U001');
    expect(currencyField.value).toBe('1000000');
  });

  test('supports field validation integration', () => {
    const mockValidateField = require('../SharedFieldLibrary').validateField;
    
    render(<BSGDynamicFieldRenderer {...defaultProps} />);
    
    const kodeUserField = screen.getByLabelText(/Kode User/i);
    fireEvent.blur(kodeUserField);
    
    // Validation should be called on blur
    expect(mockValidateField).toHaveBeenCalled();
  });

  test('handles currency formatting correctly', () => {
    render(<BSGDynamicFieldRenderer {...defaultProps} />);
    
    const currencyField = screen.getByLabelText(/Nominal Transaksi/i) as HTMLInputElement;
    
    // Test currency input
    fireEvent.change(currencyField, { target: { value: '1000000' } });
    
    // Should call onChange with numeric value
    expect(defaultProps.onChange).toHaveBeenCalledWith('Nominal Transaksi', 1000000);
  });

  test('provides accessible form controls', () => {
    render(<BSGDynamicFieldRenderer {...defaultProps} />);
    
    // All form controls should have proper labels
    const kodeUserField = screen.getByLabelText(/Kode User/i);
    const branchField = screen.getByLabelText(/Cabang\/Capem/i);
    
    expect(kodeUserField).toHaveAttribute('id');
    expect(branchField).toHaveAttribute('id');
    
    // Required fields should be properly marked
    expect(kodeUserField).toHaveAttribute('required');
    expect(branchField).toHaveAttribute('required');
  });
});

console.log('🧪 BSGDynamicFieldRenderer Component Tests');
console.log('🎯 Testing: Field Rendering, Validation, Master Data Integration');
console.log('📊 Coverage: All Field Types, Categories, Error Handling');
console.log('♿ Accessibility: Form Controls, Labels, Required Indicators');