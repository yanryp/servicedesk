import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { jest } from '@jest/globals';
import BSGCreateTicketPage from '../BSGCreateTicketPage';

// Mock the AuthContext
const mockUser = {
  id: 1,
  username: 'test-user',
  email: 'test@bsg.com',
  role: 'requester',
  department: { name: 'IT Department' }
};

const mockAuthContext = {
  isAuthenticated: true,
  user: mockUser,
  login: jest.fn(),
  logout: jest.fn(),
  loading: false
};

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

// Mock BSGTemplateSelector component
jest.mock('../../components', () => ({
  BSGTemplateSelector: ({ onTemplateSelect, selectedTemplate }: any) => (
    <div data-testid="bsg-template-selector">
      <button 
        onClick={() => onTemplateSelect(mockTemplate)}
        data-testid="select-template-button"
      >
        Select Template
      </button>
      {selectedTemplate && (
        <div data-testid="selected-template">
          Selected: {selectedTemplate.name}
        </div>
      )}
    </div>
  )
}));

// Mock BSGDynamicFieldRenderer component
jest.mock('../../components/BSGDynamicFieldRenderer', () => {
  return function MockBSGDynamicFieldRenderer({ fields, values, onChange, errors }: any) {
    return (
      <div data-testid="bsg-dynamic-field-renderer">
        {fields.map((field: any) => (
          <div key={field.fieldName} data-testid={`field-${field.fieldName}`}>
            <label>{field.fieldLabel}</label>
            <input
              type="text"
              value={values[field.fieldName] || ''}
              onChange={(e) => onChange(field.fieldName, e.target.value)}
              data-testid={`input-${field.fieldName}`}
            />
            {errors[field.fieldName] && (
              <span data-testid={`error-${field.fieldName}`}>
                {errors[field.fieldName]}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };
});

// Mock data
const mockTemplate = {
  id: 1,
  template_number: 1,
  name: 'Perubahan Menu & Limit Transaksi',
  display_name: 'OLIBS - Perubahan Menu & Limit Transaksi',
  description: 'Template untuk perubahan menu dan limit transaksi OLIBS',
  popularity_score: 85,
  usage_count: 150,
  category_name: 'olibs_core_banking',
  category_display_name: 'Core Banking System - OLIBS'
};

const mockTemplateFields = [
  {
    fieldName: 'Cabang/Capem',
    fieldLabel: 'Cabang/Capem',
    fieldType: 'dropdown_branch',
    isRequired: true,
    category: 'location'
  },
  {
    fieldName: 'Kode User',
    fieldLabel: 'Kode User',
    fieldType: 'text_short',
    isRequired: true,
    category: 'user_identity',
    maxLength: 10
  },
  {
    fieldName: 'Nama User',
    fieldLabel: 'Nama User',
    fieldType: 'text',
    isRequired: true,
    category: 'user_identity'
  }
];

// Mock fetch
global.fetch = jest.fn();

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('BSGCreateTicketPage Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/fields')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTemplateFields)
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} })
      });
    });
  });

  test('renders BSG create ticket page with all sections', () => {
    renderWithRouter(<BSGCreateTicketPage />);
    
    // Check main sections
    expect(screen.getByText('BSG Banking System Support')).toBeInTheDocument();
    expect(screen.getByText(/Create a support ticket using BSG-specific templates/i)).toBeInTheDocument();
    expect(screen.getByText('Ticket Details')).toBeInTheDocument();
    
    // Check form fields
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Attachments/i)).toBeInTheDocument();
  });

  test('shows template selector component', () => {
    renderWithRouter(<BSGCreateTicketPage />);
    
    expect(screen.getByTestId('bsg-template-selector')).toBeInTheDocument();
  });

  test('shows user information section', () => {
    renderWithRouter(<BSGCreateTicketPage />);
    
    expect(screen.getByText('Requester Information')).toBeInTheDocument();
    expect(screen.getByText(mockUser.username)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    expect(screen.getByText(mockUser.department.name)).toBeInTheDocument();
    expect(screen.getByText(mockUser.role)).toBeInTheDocument();
  });

  test('template selection workflow', async () => {
    renderWithRouter(<BSGCreateTicketPage />);
    
    // Initially no template selected
    expect(screen.queryByTestId('selected-template')).not.toBeInTheDocument();
    
    // Select a template
    const selectButton = screen.getByTestId('select-template-button');
    fireEvent.click(selectButton);
    
    // Wait for template to be selected and fields to load
    await waitFor(() => {
      expect(screen.getByTestId('selected-template')).toBeInTheDocument();
    });
    
    // Check that template information is displayed
    expect(screen.getByText(/Selected: Perubahan Menu & Limit Transaksi/i)).toBeInTheDocument();
    
    // Check that template metadata is shown
    expect(screen.getByText('Selected BSG Template')).toBeInTheDocument();
    expect(screen.getByText(mockTemplate.category_display_name)).toBeInTheDocument();
    expect(screen.getByText(mockTemplate.template_number.toString())).toBeInTheDocument();
  });

  test('dynamic field loading after template selection', async () => {
    renderWithRouter(<BSGCreateTicketPage />);
    
    // Select template
    const selectButton = screen.getByTestId('select-template-button');
    fireEvent.click(selectButton);
    
    // Wait for fields to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`/api/bsg-templates/${mockTemplate.id}/fields`);
    });
    
    // Check that dynamic fields are rendered
    await waitFor(() => {
      expect(screen.getByTestId('bsg-dynamic-field-renderer')).toBeInTheDocument();
    });
    
    // Check individual fields
    expect(screen.getByTestId('field-Cabang/Capem')).toBeInTheDocument();
    expect(screen.getByTestId('field-Kode User')).toBeInTheDocument();
    expect(screen.getByTestId('field-Nama User')).toBeInTheDocument();
  });

  test('auto-population of title and description', async () => {
    renderWithRouter(<BSGCreateTicketPage />);
    
    const titleField = screen.getByLabelText(/Title/i) as HTMLInputElement;
    const descriptionField = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
    
    // Initially empty
    expect(titleField.value).toBe('');
    expect(descriptionField.value).toBe('');
    
    // Select template
    const selectButton = screen.getByTestId('select-template-button');
    fireEvent.click(selectButton);
    
    // Wait for auto-population
    await waitFor(() => {
      expect(titleField.value).toContain(mockTemplate.category_display_name);
      expect(titleField.value).toContain(mockTemplate.name);
    });
    
    if (mockTemplate.description) {
      expect(descriptionField.value).toBe(mockTemplate.description);
    }
  });

  test('field validation workflow', async () => {
    renderWithRouter(<BSGCreateTicketPage />);
    
    // Select template and wait for fields
    const selectButton = screen.getByTestId('select-template-button');
    fireEvent.click(selectButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('field-Kode User')).toBeInTheDocument();
    });
    
    // Fill form with invalid data
    const titleField = screen.getByLabelText(/Title/i);
    fireEvent.change(titleField, { target: { value: 'Test' } }); // Too short
    
    // Try to submit
    const submitButton = screen.getByRole('button', { name: /Create BSG Support Ticket/i });
    fireEvent.click(submitButton);
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/Title must be at least 5 characters/i)).toBeInTheDocument();
    });
  });

  test('field value changes and error handling', async () => {
    renderWithRouter(<BSGCreateTicketPage />);
    
    // Select template
    const selectButton = screen.getByTestId('select-template-button');
    fireEvent.click(selectButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('input-Kode User')).toBeInTheDocument();
    });
    
    // Change field value
    const kodeUserInput = screen.getByTestId('input-Kode User');
    fireEvent.change(kodeUserInput, { target: { value: 'U001' } });
    
    // Check that value is updated
    expect((kodeUserInput as HTMLInputElement).value).toBe('U001');
  });

  test('form submission with complete data', async () => {
    renderWithRouter(<BSGCreateTicketPage />);
    
    // Fill basic form
    const titleField = screen.getByLabelText(/Title/i);
    const descriptionField = screen.getByLabelText(/Description/i);
    
    fireEvent.change(titleField, { target: { value: 'Test BSG Ticket Creation' } });
    fireEvent.change(descriptionField, { target: { value: 'Testing complete BSG workflow with dynamic fields' } });
    
    // Select template
    const selectButton = screen.getByTestId('select-template-button');
    fireEvent.click(selectButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('input-Kode User')).toBeInTheDocument();
    });
    
    // Fill template fields
    const kodeUserInput = screen.getByTestId('input-Kode User');
    const namaUserInput = screen.getByTestId('input-Nama User');
    
    fireEvent.change(kodeUserInput, { target: { value: 'U001' } });
    fireEvent.change(namaUserInput, { target: { value: 'Test User' } });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /Create BSG Support Ticket/i });
    fireEvent.click(submitButton);
    
    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/Creating BSG Ticket.../i)).toBeInTheDocument();
    });
  });

  test('form reset functionality', async () => {
    renderWithRouter(<BSGCreateTicketPage />);
    
    // Fill form
    const titleField = screen.getByLabelText(/Title/i) as HTMLInputElement;
    fireEvent.change(titleField, { target: { value: 'Test Title' } });
    
    // Select template
    const selectButton = screen.getByTestId('select-template-button');
    fireEvent.click(selectButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('selected-template')).toBeInTheDocument();
    });
    
    // Reset form
    const resetButton = screen.getByRole('button', { name: /Reset/i });
    fireEvent.click(resetButton);
    
    // Check that form is cleared
    expect(titleField.value).toBe('');
    expect(screen.queryByTestId('selected-template')).not.toBeInTheDocument();
  });

  test('file attachment handling', () => {
    renderWithRouter(<BSGCreateTicketPage />);
    
    const fileInput = screen.getByLabelText(/Attachments/i) as HTMLInputElement;
    expect(fileInput.multiple).toBe(true);
    expect(fileInput.accept).toContain('.pdf');
    expect(fileInput.accept).toContain('.jpg');
    expect(fileInput.accept).toContain('.doc');
    
    // Check file size and type limits information
    expect(screen.getByText(/Max 5 files/i)).toBeInTheDocument();
    expect(screen.getByText(/Max 10MB each/i)).toBeInTheDocument();
  });

  test('priority selection options', () => {
    renderWithRouter(<BSGCreateTicketPage />);
    
    const prioritySelect = screen.getByLabelText(/Priority/i);
    
    // Check all priority options are available
    expect(screen.getByRole('option', { name: /Low - Minor issue/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Medium - Moderate impact/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /High - Significant impact/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Urgent - Critical issue/i })).toBeInTheDocument();
  });

  test('loading state during field fetch', async () => {
    // Mock slow API response
    (global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve(mockTemplateFields)
      }), 1000))
    );
    
    renderWithRouter(<BSGCreateTicketPage />);
    
    // Select template
    const selectButton = screen.getByTestId('select-template-button');
    fireEvent.click(selectButton);
    
    // Should show loading state
    expect(screen.getByText(/Loading template fields.../i)).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading template fields.../i)).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('error handling for failed field loading', async () => {
    // Mock API error
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    const toast = require('react-hot-toast');
    
    renderWithRouter(<BSGCreateTicketPage />);
    
    // Select template
    const selectButton = screen.getByTestId('select-template-button');
    fireEvent.click(selectButton);
    
    // Should show error toast
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error loading template fields');
    });
  });

  test('submit button disabled without template selection', () => {
    renderWithRouter(<BSGCreateTicketPage />);
    
    const submitButton = screen.getByRole('button', { name: /Create BSG Support Ticket/i }) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
  });

  test('submit button enabled after template selection', async () => {
    renderWithRouter(<BSGCreateTicketPage />);
    
    // Select template
    const selectButton = screen.getByTestId('select-template-button');
    fireEvent.click(selectButton);
    
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Create BSG Support Ticket/i }) as HTMLButtonElement;
      expect(submitButton.disabled).toBe(false);
    });
  });

  test('unauthenticated user handling', () => {
    // Mock unauthenticated state
    const unauthenticatedContext = {
      ...mockAuthContext,
      isAuthenticated: false,
      user: null
    };

    jest.mocked(require('../../context/AuthContext').useAuth).mockReturnValue(unauthenticatedContext);
    
    renderWithRouter(<BSGCreateTicketPage />);
    
    expect(screen.getByText(/Please log in to create a BSG ticket/i)).toBeInTheDocument();
  });
});

console.log('🎫 BSGCreateTicketPage Integration Tests');
console.log('🔧 Testing: Template Selection, Dynamic Fields, Form Validation');
console.log('📊 Coverage: User Workflow, Error Handling, State Management');
console.log('✅ Features: Auto-population, File Upload, Priority Selection');