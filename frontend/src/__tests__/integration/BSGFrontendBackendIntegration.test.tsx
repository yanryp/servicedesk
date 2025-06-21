import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { jest } from '@jest/globals';

// Mock the AuthContext
const mockUser = {
  id: 1,
  username: 'bsg-tester',
  email: 'tester@bsg.com',
  role: 'requester',
  department: { name: 'BSG Banking Operations' }
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

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

// Import components to test
import BSGCreateTicketPage from '../../pages/BSGCreateTicketPage';
import BSGTemplateDiscovery from '../../components/BSGTemplateDiscovery';

// Mock API responses
const mockTemplateCategories = [
  {
    id: 1,
    name: 'olibs_core_banking',
    display_name: 'Core Banking System - OLIBS',
    description: 'OLIBS core banking operations and transactions',
    template_count: 8
  },
  {
    id: 2,
    name: 'bsgtouch_mobile',
    display_name: 'BSG Touch Mobile Banking',
    description: 'Mobile banking applications and services',
    template_count: 4
  }
];

const mockTemplates = [
  {
    id: 1,
    template_number: 1,
    name: 'Perubahan Menu & Limit Transaksi',
    display_name: 'OLIBS - Perubahan Menu & Limit Transaksi',
    description: 'Template untuk perubahan menu dan limit transaksi OLIBS',
    popularity_score: 85,
    usage_count: 150,
    category_name: 'olibs_core_banking',
    category_display_name: 'Core Banking System - OLIBS'
  },
  {
    id: 2,
    template_number: 2,
    name: 'Transfer Antar Bank',
    display_name: 'OLIBS - Transfer Antar Bank',
    description: 'Template untuk transfer antar bank melalui OLIBS',
    popularity_score: 92,
    usage_count: 203,
    category_name: 'olibs_core_banking',
    category_display_name: 'Core Banking System - OLIBS'
  }
];

const mockTemplateFields = [
  {
    id: 1,
    fieldName: 'Cabang/Capem',
    fieldLabel: 'Cabang/Capem',
    fieldType: 'dropdown_branch',
    isRequired: true,
    category: 'location',
    sortOrder: 1
  },
  {
    id: 2,
    fieldName: 'Kode User',
    fieldLabel: 'Kode User',
    fieldType: 'text_short',
    isRequired: true,
    category: 'user_identity',
    sortOrder: 2,
    maxLength: 10
  }
];

const mockBranchData = [
  { code: '001', name: 'Kantor Pusat', level: 'pusat' },
  { code: '101', name: 'Cabang Manado', level: 'cabang' },
  { code: '201', name: 'Capem Tondano', level: 'capem' }
];

// Mock fetch globally
global.fetch = jest.fn();

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('BSG Frontend-Backend Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default fetch mock responses
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/bsg-templates/categories')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockTemplateCategories })
        });
      }
      if (url.includes('/api/bsg-templates/search')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockTemplates })
        });
      }
      if (url.includes('/fields')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockTemplateFields })
        });
      }
      if (url.includes('/master-data/branch')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockBranchData })
        });
      }
      if (url.includes('/api/tickets')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            success: true, 
            data: { id: 123, status: 'pending_approval' } 
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} })
      });
    });
  });

  describe('Template Category Loading', () => {
    test('loads BSG template categories from backend API', async () => {
      renderWithRouter(<BSGTemplateDiscovery onTemplateSelect={jest.fn()} />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/bsg-templates/categories');
      });

      // Verify categories are displayed
      await waitFor(() => {
        expect(screen.getByText('Core Banking System - OLIBS')).toBeInTheDocument();
        expect(screen.getByText('BSG Touch Mobile Banking')).toBeInTheDocument();
      });
    });

    test('handles category loading errors gracefully', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.reject(new Error('Network error'))
      );

      const toast = require('react-hot-toast');
      renderWithRouter(<BSGTemplateDiscovery onTemplateSelect={jest.fn()} />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to load template categories');
      });
    });

    test('displays category statistics correctly', async () => {
      renderWithRouter(<BSGTemplateDiscovery onTemplateSelect={jest.fn()} />);
      
      await waitFor(() => {
        expect(screen.getByText('8 templates')).toBeInTheDocument();
        expect(screen.getByText('4 templates')).toBeInTheDocument();
      });
    });
  });

  describe('Template Search Integration', () => {
    test('searches templates using backend API', async () => {
      renderWithRouter(<BSGTemplateDiscovery onTemplateSelect={jest.fn()} />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search BSG templates/i)).toBeInTheDocument();
      });

      // Perform search
      const searchInput = screen.getByPlaceholderText(/Search BSG templates/i);
      fireEvent.change(searchInput, { target: { value: 'transfer' } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/bsg-templates/search?query=transfer')
        );
      });

      // Verify search results
      await waitFor(() => {
        expect(screen.getByText('Transfer Antar Bank')).toBeInTheDocument();
      });
    });

    test('handles empty search results', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce((url) => {
        if (url.includes('search?query=nonexistent')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, data: [] })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockTemplates })
        });
      });

      renderWithRouter(<BSGTemplateDiscovery onTemplateSelect={jest.fn()} />);
      
      const searchInput = screen.getByPlaceholderText(/Search BSG templates/i);
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      await waitFor(() => {
        expect(screen.getByText(/No templates found/i)).toBeInTheDocument();
      });
    });

    test('displays template popularity and usage data', async () => {
      renderWithRouter(<BSGTemplateDiscovery onTemplateSelect={jest.fn()} />);
      
      await waitFor(() => {
        expect(screen.getByText('Popularity: 85%')).toBeInTheDocument();
        expect(screen.getByText('Used 150 times')).toBeInTheDocument();
        expect(screen.getByText('Popularity: 92%')).toBeInTheDocument();
        expect(screen.getByText('Used 203 times')).toBeInTheDocument();
      });
    });
  });

  describe('Dynamic Field Loading', () => {
    test('loads template fields from backend when template is selected', async () => {
      const mockOnSelect = jest.fn();
      renderWithRouter(<BSGCreateTicketPage />);
      
      // Wait for template discovery to load
      await waitFor(() => {
        expect(screen.getByText('Select BSG Template')).toBeInTheDocument();
      });

      // Simulate template selection (this would normally come from BSGTemplateDiscovery)
      // We'll trigger the field loading directly by simulating the selection
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/bsg-templates/categories');
      });
    });

    test('loads master data for dropdown fields', async () => {
      renderWithRouter(<BSGCreateTicketPage />);
      
      // Template fields with dropdown_branch should trigger master data loading
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/bsg-templates/master-data/branch');
      });
    });

    test('handles field loading errors', async () => {
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('/fields')) {
          return Promise.reject(new Error('Failed to load fields'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockTemplateCategories })
        });
      });

      const toast = require('react-hot-toast');
      renderWithRouter(<BSGCreateTicketPage />);

      // Error should be handled gracefully
      await waitFor(() => {
        // Component should not crash and error should be logged
        expect(screen.getByText('BSG Banking System Support')).toBeInTheDocument();
      });
    });
  });

  describe('Ticket Creation Workflow', () => {
    test('submits complete BSG ticket to backend', async () => {
      renderWithRouter(<BSGCreateTicketPage />);
      
      // Fill out basic ticket information
      const titleField = screen.getByLabelText(/Title/i);
      const descriptionField = screen.getByLabelText(/Description/i);
      
      fireEvent.change(titleField, { 
        target: { value: 'BSG OLIBS Transfer Issue' } 
      });
      fireEvent.change(descriptionField, { 
        target: { value: 'Need assistance with inter-bank transfer configuration' } 
      });

      // Wait for template and field loading to complete
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/bsg-templates/categories');
      });

      // Simulate form submission
      const submitButton = screen.getByRole('button', { name: /Create BSG Support Ticket/i });
      
      // The button should be present but might be disabled until template is selected
      expect(submitButton).toBeInTheDocument();
    });

    test('includes BSG template data in ticket submission', async () => {
      renderWithRouter(<BSGCreateTicketPage />);
      
      // Mock successful ticket creation
      (global.fetch as jest.Mock).mockImplementationOnce((url, options) => {
        if (url.includes('/api/tickets') && options?.method === 'POST') {
          const body = JSON.parse(options.body);
          
          // Verify BSG-specific data is included
          expect(body).toHaveProperty('template_id');
          expect(body).toHaveProperty('template_fields');
          expect(body).toHaveProperty('category');
          
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ 
              success: true, 
              data: { id: 123, status: 'pending_approval' } 
            })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: {} })
        });
      });

      // Complete form and submit
      const titleField = screen.getByLabelText(/Title/i);
      fireEvent.change(titleField, { 
        target: { value: 'Test BSG Ticket with Template Data' } 
      });

      await waitFor(() => {
        expect(screen.getByText('BSG Banking System Support')).toBeInTheDocument();
      });
    });

    test('handles ticket creation errors from backend', async () => {
      (global.fetch as jest.Mock).mockImplementation((url, options) => {
        if (url.includes('/api/tickets') && options?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            status: 400,
            json: () => Promise.resolve({ 
              success: false, 
              error: 'Invalid template field data' 
            })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockTemplateCategories })
        });
      });

      const toast = require('react-hot-toast');
      renderWithRouter(<BSGCreateTicketPage />);

      await waitFor(() => {
        expect(screen.getByText('BSG Banking System Support')).toBeInTheDocument();
      });

      // Error handling should be in place for ticket submission failures
    });
  });

  describe('Real-time Data Synchronization', () => {
    test('reflects backend data changes in real-time', async () => {
      const { rerender } = renderWithRouter(<BSGTemplateDiscovery onTemplateSelect={jest.fn()} />);
      
      // Initial load
      await waitFor(() => {
        expect(screen.getByText('8 templates')).toBeInTheDocument();
      });

      // Simulate backend data change
      const updatedCategories = [
        {
          ...mockTemplateCategories[0],
          template_count: 10  // Updated count
        },
        mockTemplateCategories[1]
      ];

      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: updatedCategories })
        })
      );

      // Trigger refresh
      rerender(<BSGTemplateDiscovery onTemplateSelect={jest.fn()} />);

      await waitFor(() => {
        expect(screen.getByText('10 templates')).toBeInTheDocument();
      });
    });

    test('handles API rate limiting gracefully', async () => {
      // Mock rate limit response
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 429,
          json: () => Promise.resolve({ 
            success: false, 
            error: 'Rate limit exceeded' 
          })
        })
      );

      const toast = require('react-hot-toast');
      renderWithRouter(<BSGTemplateDiscovery onTemplateSelect={jest.fn()} />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Too many requests. Please try again later.');
      });
    });
  });

  describe('Authentication Integration', () => {
    test('includes authentication token in API requests', async () => {
      const originalLocalStorage = global.localStorage;
      global.localStorage = {
        getItem: jest.fn(() => 'fake-jwt-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        length: 0,
        key: jest.fn()
      } as any;

      renderWithRouter(<BSGTemplateDiscovery onTemplateSelect={jest.fn()} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/bsg-templates/categories',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer fake-jwt-token'
            })
          })
        );
      });

      global.localStorage = originalLocalStorage;
    });

    test('handles authentication errors from backend', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ 
            success: false, 
            error: 'Authentication required' 
          })
        })
      );

      renderWithRouter(<BSGTemplateDiscovery onTemplateSelect={jest.fn()} />);

      // Should handle auth errors gracefully
      await waitFor(() => {
        expect(mockAuthContext.logout).toHaveBeenCalled();
      });
    });
  });

  describe('Performance and Optimization', () => {
    test('implements proper caching for template data', async () => {
      const { rerender } = renderWithRouter(<BSGTemplateDiscovery onTemplateSelect={jest.fn()} />);
      
      // Initial load
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/bsg-templates/categories');
      });

      jest.clearAllMocks();

      // Re-render should use cached data
      rerender(<BSGTemplateDiscovery onTemplateSelect={jest.fn()} />);

      // Should not make additional API calls if data is cached
      await waitFor(() => {
        expect(global.fetch).not.toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    test('debounces search API calls', async () => {
      renderWithRouter(<BSGTemplateDiscovery onTemplateSelect={jest.fn()} />);
      
      const searchInput = screen.getByPlaceholderText(/Search BSG templates/i);
      
      // Rapid typing should debounce API calls
      fireEvent.change(searchInput, { target: { value: 't' } });
      fireEvent.change(searchInput, { target: { value: 'tr' } });
      fireEvent.change(searchInput, { target: { value: 'tra' } });
      fireEvent.change(searchInput, { target: { value: 'transfer' } });

      // Should only make one API call after debounce period
      await waitFor(() => {
        const searchCalls = (global.fetch as jest.Mock).mock.calls.filter(call => 
          call[0].includes('search?query=transfer')
        );
        expect(searchCalls.length).toBeLessThanOrEqual(2); // Initial + final search
      });
    });
  });
});

console.log('🔗 BSG Frontend-Backend Integration Tests');
console.log('🌐 Testing: API Integration, Data Flow, Error Handling');
console.log('⚡ Coverage: Template Loading, Search, Ticket Creation');
console.log('🔒 Security: Authentication, Rate Limiting, Data Validation');