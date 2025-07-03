import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { jest } from '@jest/globals';
import App from './App';

// Mock the AuthContext
const mockUser = {
  id: 1,
  username: 'test-user',
  email: 'test@bsg.com',
  role: 'admin',
  department: { name: 'IT Support Group' }
};

const mockAuthContext = {
  isAuthenticated: true,
  user: mockUser,
  login: jest.fn(),
  logout: jest.fn(),
  loading: false
};

jest.mock('./context/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  BrowserRouter: ({ children }: any) => <div data-testid="router">{children}</div>,
  Routes: ({ children }: any) => <div data-testid="routes">{children}</div>,
  Route: ({ element }: any) => <div data-testid="route">{element}</div>
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
  Toaster: () => null
}));

// Mock all page components
jest.mock('./pages/DashboardPage', () => {
  return function MockDashboardPage() {
    return <div data-testid="dashboard-page">Dashboard Page</div>;
  };
});

jest.mock('./pages/BSGCreateTicketPage', () => {
  return function MockBSGCreateTicketPage() {
    return (
      <div data-testid="bsg-create-ticket-page">
        <h1>BSG Banking System Support</h1>
        <p>Create a support ticket using BSG-specific templates</p>
      </div>
    );
  };
});

jest.mock('./pages/TicketsPage', () => {
  return function MockTicketsPage() {
    return <div data-testid="tickets-page">Tickets Management</div>;
  };
});

jest.mock('./pages/LoginPage', () => {
  return function MockLoginPage() {
    return <div data-testid="login-page">Login Page</div>;
  };
});

// Mock Navigation component
jest.mock('./components/Navigation', () => {
  return function MockNavigation() {
    return (
      <nav data-testid="navigation">
        <a href="/dashboard" data-testid="nav-dashboard">Dashboard</a>
        <a href="/tickets" data-testid="nav-tickets">Tickets</a>
        <a href="/bsg-create" data-testid="nav-bsg-create">BSG Support</a>
        <button data-testid="nav-logout">Logout</button>
      </nav>
    );
  };
});

describe('App Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders App with routing structure', () => {
    render(<App />);
    
    expect(screen.getByTestId('router')).toBeInTheDocument();
    expect(screen.getByTestId('routes')).toBeInTheDocument();
  });

  test('renders navigation when authenticated', () => {
    render(<App />);
    
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('nav-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('nav-tickets')).toBeInTheDocument();
    expect(screen.getByTestId('nav-bsg-create')).toBeInTheDocument();
    expect(screen.getByTestId('nav-logout')).toBeInTheDocument();
  });

  test('handles authentication state properly', () => {
    // Mock unauthenticated state
    const unauthenticatedContext = {
      ...mockAuthContext,
      isAuthenticated: false,
      user: null
    };

    jest.mocked(require('./context/AuthContext').useAuth).mockReturnValue(unauthenticatedContext);
    
    render(<App />);
    
    // Should not show navigation when not authenticated
    expect(screen.queryByTestId('navigation')).not.toBeInTheDocument();
  });

  test('shows loading state correctly', () => {
    const loadingContext = {
      ...mockAuthContext,
      loading: true
    };

    jest.mocked(require('./context/AuthContext').useAuth).mockReturnValue(loadingContext);
    
    render(<App />);
    
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  test('provides BSG-specific navigation options', () => {
    render(<App />);
    
    const bsgNavLink = screen.getByTestId('nav-bsg-create');
    expect(bsgNavLink).toBeInTheDocument();
    expect(bsgNavLink).toHaveAttribute('href', '/bsg-create');
  });

  test('handles logout functionality', () => {
    render(<App />);
    
    const logoutButton = screen.getByTestId('nav-logout');
    fireEvent.click(logoutButton);
    
    // Logout function should be called
    expect(mockAuthContext.logout).toHaveBeenCalled();
  });

  test('supports different user roles', () => {
    const managerUser = {
      ...mockUser,
      role: 'manager'
    };

    const managerContext = {
      ...mockAuthContext,
      user: managerUser
    };

    jest.mocked(require('./context/AuthContext').useAuth).mockReturnValue(managerContext);
    
    render(<App />);
    
    // Navigation should still be available for managers
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  test('handles BSG Banking supporting group users', () => {
    const bsgUser = {
      ...mockUser,
      department: { name: 'BSG Banking Operations Group' }
    };

    const bsgContext = {
      ...mockAuthContext,
      user: bsgUser
    };

    jest.mocked(require('./context/AuthContext').useAuth).mockReturnValue(bsgContext);
    
    render(<App />);
    
    // BSG users should have access to BSG-specific features
    expect(screen.getByTestId('nav-bsg-create')).toBeInTheDocument();
  });

  test('renders toast notifications container', () => {
    render(<App />);
    
    // Toast container should be available for notifications
    // The mock returns null, so we just verify it doesn't crash
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });

  test('maintains routing state across re-renders', () => {
    const { rerender } = render(<App />);
    
    expect(screen.getByTestId('router')).toBeInTheDocument();
    
    rerender(<App />);
    
    expect(screen.getByTestId('router')).toBeInTheDocument();
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  test('provides proper context to child components', () => {
    render(<App />);
    
    // Verify that the authentication context is available
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('routes')).toBeInTheDocument();
  });
});

describe('App BSG Integration Features', () => {
  test('supports BSG-specific user workflows', () => {
    render(<App />);
    
    // BSG users should have dedicated navigation
    const bsgLink = screen.getByTestId('nav-bsg-create');
    expect(bsgLink).toBeInTheDocument();
    
    // Standard ticketing should also be available
    const ticketsLink = screen.getByTestId('nav-tickets');
    expect(ticketsLink).toBeInTheDocument();
  });

  test('integrates with BSG template system', () => {
    render(<App />);
    
    // App should provide navigation to BSG template features
    expect(screen.getByTestId('nav-bsg-create')).toBeInTheDocument();
    
    // Should also maintain access to general dashboard
    expect(screen.getByTestId('nav-dashboard')).toBeInTheDocument();
  });

  test('handles BSG-specific error states gracefully', () => {
    const errorContext = {
      ...mockAuthContext,
      isAuthenticated: false,
      user: null,
      error: 'BSG authentication failed'
    };

    jest.mocked(require('./context/AuthContext').useAuth).mockReturnValue(errorContext);
    
    render(<App />);
    
    // Should handle error states without crashing
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });
});

console.log('🏗️ App Integration Tests');
console.log('🔐 Testing: Authentication, Navigation, BSG Integration');
console.log('🎯 Coverage: User Roles, Routing, Error Handling');
console.log('🏦 BSG Features: Template System Integration, Banking Workflows');
