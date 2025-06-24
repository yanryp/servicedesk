// frontend/src/App.tsx
import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { 
  Bars3Icon,
  TicketIcon
} from '@heroicons/react/24/outline';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TicketsPage from './pages/TicketsPage';
// CreateTicketPage removed in Stage 6 migration - use ServiceCatalogV2Page or BSGCreateTicketPage instead
import TicketDetailPage from './pages/TicketDetailPage';
import EditTicketPage from './pages/EditTicketPage';
import ReportingPage from './pages/ReportingPage';
import ManagerDashboard from './pages/ManagerDashboard';
import CategorizationAnalyticsPage from './pages/CategorizationAnalyticsPage';
import UncategorizedTicketsPage from './pages/UncategorizedTicketsPage';
import ServiceCatalogPage from './pages/ServiceCatalogPage';
import ServiceCatalogV2Page from './pages/ServiceCatalogV2Page';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

function App() {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Display a loading message or spinner while AuthContext is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Login/Register pages don't need sidebar
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Toaster for notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #334155',
              fontSize: '14px',
            },
            success: {
              style: {
                background: '#059669',
                color: '#ffffff',
              },
            },
            error: {
              style: {
                background: '#dc2626',
                color: '#ffffff',
              },
            },
          }}
        />

        {/* Simple header for non-authenticated pages */}
        <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-slate-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                  <TicketIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    BSG Helpdesk
                  </span>
                  <span className="text-xs text-slate-500 -mt-1">Support Portal</span>
                </div>
              </Link>
              <Link
                to="/login"
                className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Login to BSG Helpdesk
              </Link>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex overflow-hidden">
      {/* Toaster for notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #334155',
            fontSize: '14px',
          },
          success: {
            style: {
              background: '#059669',
              color: '#ffffff',
            },
          },
          error: {
            style: {
              background: '#dc2626',
              color: '#ffffff',
            },
          },
        }}
      />

      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={mobileSidebarOpen}
        onMobileToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white/80 backdrop-blur-md border-b border-slate-200/50 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Bars3Icon className="w-6 h-6 text-slate-600" />
            </button>
            <h1 className="text-lg font-semibold text-slate-800">BSG Helpdesk</h1>
            <div className="w-10 h-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 max-w-7xl">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/admin/register" element={<ProtectedRoute roles={['admin']}><RegisterPage /></ProtectedRoute>} />
              <Route path="/tickets" element={<TicketsPage />} />
              {/* CreateTicketPage route removed in Stage 6 migration - redirect to service catalog */}
              <Route path="/create-ticket" element={<Navigate to="/service-catalog-v2" replace />} />
              <Route path="/service-catalog" element={<ServiceCatalogPage />} />
              <Route path="/service-catalog-v2" element={<ServiceCatalogV2Page />} />
              <Route path="/tickets/:ticketId" element={<TicketDetailPage />} />
              <Route path="/tickets/:ticketId/edit" element={<EditTicketPage />} />
              <Route path="/manager" element={<ProtectedRoute roles={['admin', 'manager']}><ManagerDashboard /></ProtectedRoute>} />
              <Route path="/reporting" element={<ProtectedRoute roles={['admin', 'manager']}><ReportingPage /></ProtectedRoute>} />
              <Route path="/categorization/analytics" element={<ProtectedRoute roles={['admin', 'manager']}><CategorizationAnalyticsPage /></ProtectedRoute>} />
              <Route path="/categorization/queue" element={<ProtectedRoute roles={['admin', 'manager', 'technician']}><UncategorizedTicketsPage /></ProtectedRoute>} />
              {/* Catch-all redirect to home for authenticated users */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
