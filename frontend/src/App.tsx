// frontend/src/App.tsx
import React, { useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
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
import ServiceCatalogAdminPage from './pages/ServiceCatalogAdminPage';
import SLAPolicyPage from './pages/admin/SLAPolicyPage';
import SupportingGroupsPage from './pages/admin/SupportingGroupsPage';
import TechnicianWorkspace from './components/technician/TechnicianWorkspace';
import TechnicianTicketsPage from './pages/TechnicianTicketsPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import ArticleViewPage from './pages/ArticleViewPage';
import KnowledgeBaseAdminPage from './pages/admin/KnowledgeBaseAdminPage';
import ArticleEditorPage from './pages/admin/ArticleEditorPage';
import CategoryManagementPage from './pages/admin/CategoryManagementPage';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

function App() {
  const { user, isLoading, isAuthenticated } = useAuth();
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
        {/* Enhanced Mobile Header */}
        <header className="lg:hidden bg-white/90 backdrop-blur-md border-b border-slate-200/50 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 active:scale-95"
            >
              <Bars3Icon className="w-6 h-6 text-slate-600" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <TicketIcon className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                BSG Helpdesk
              </h1>
            </div>
            <div className="w-10 h-10 flex items-center justify-center">
              {user && (
                <div className="w-8 h-8 bg-gradient-to-r from-slate-400 to-slate-600 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {user.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            {/* Technician Workspace - Full-screen inbox-style interface without container */}
            <Route path="/technician/workspace" element={<ProtectedRoute roles={['technician', 'manager', 'admin']}><TechnicianWorkspace /></ProtectedRoute>} />
            
            {/* All other routes wrapped in container */}
            <Route path="/" element={<div className="container mx-auto p-6 max-w-7xl"><HomePage /></div>} />
            <Route path="/admin/register" element={<ProtectedRoute roles={['admin']}><div className="container mx-auto p-6 max-w-7xl"><RegisterPage /></div></ProtectedRoute>} />
            
            {/* Tickets - Redirect technicians to workspace, others to regular tickets page */}
            <Route path="/tickets" element={
              user?.role === 'technician' ? (
                <Navigate to="/technician/workspace" replace />
              ) : (
                <div className="container mx-auto p-6 max-w-7xl"><TicketsPage /></div>
              )
            } />
            
            {/* CreateTicketPage route removed in Stage 6 migration - redirect to service catalog */}
            <Route path="/create-ticket" element={<Navigate to="/service-catalog-v2" replace />} />
            <Route path="/service-catalog" element={<ProtectedRoute roles={['requester', 'technician', 'manager', 'admin']}><div className="container mx-auto p-6 max-w-7xl"><ServiceCatalogPage /></div></ProtectedRoute>} />
            <Route path="/service-catalog-v2" element={<ProtectedRoute roles={['requester', 'technician', 'manager', 'admin']}><div className="container mx-auto p-6 max-w-7xl"><ServiceCatalogV2Page /></div></ProtectedRoute>} />
            <Route path="/service-catalog-admin" element={<ProtectedRoute roles={['admin']}><div className="container mx-auto p-6 max-w-7xl"><ServiceCatalogAdminPage /></div></ProtectedRoute>} />
            
            {/* Knowledge Base Routes */}
            <Route path="/knowledge-base" element={<ProtectedRoute roles={['requester', 'technician', 'manager', 'admin']}><KnowledgeBasePage /></ProtectedRoute>} />
            <Route path="/knowledge-base/articles/:id" element={<ProtectedRoute roles={['requester', 'technician', 'manager', 'admin']}><ArticleViewPage /></ProtectedRoute>} />
            
            {/* Knowledge Base Admin Routes */}
            <Route path="/knowledge-base/admin" element={<ProtectedRoute roles={['admin', 'manager']}><KnowledgeBaseAdminPage /></ProtectedRoute>} />
            <Route path="/knowledge-base/admin/articles/new" element={<ProtectedRoute roles={['admin', 'manager']}><ArticleEditorPage /></ProtectedRoute>} />
            <Route path="/knowledge-base/admin/articles/:id/edit" element={<ProtectedRoute roles={['admin', 'manager']}><ArticleEditorPage /></ProtectedRoute>} />
            <Route path="/knowledge-base/admin/categories" element={<ProtectedRoute roles={['admin', 'manager']}><CategoryManagementPage /></ProtectedRoute>} />
            <Route path="/admin/sla-policies" element={<ProtectedRoute roles={['admin']}><div className="container mx-auto p-6 max-w-7xl"><SLAPolicyPage /></div></ProtectedRoute>} />
            <Route path="/admin/supporting-groups" element={<ProtectedRoute roles={['admin']}><SupportingGroupsPage /></ProtectedRoute>} />
            <Route path="/tickets/:ticketId" element={<ProtectedRoute roles={['requester', 'technician', 'manager', 'admin']}><div className="container mx-auto p-6 max-w-7xl"><TicketDetailPage /></div></ProtectedRoute>} />
            <Route path="/tickets/:ticketId/edit" element={<ProtectedRoute roles={['requester', 'technician', 'manager', 'admin']}><div className="container mx-auto p-6 max-w-7xl"><EditTicketPage /></div></ProtectedRoute>} />
            <Route path="/manager" element={<ProtectedRoute roles={['admin', 'manager']}><div className="container mx-auto p-6 max-w-7xl"><ManagerDashboard /></div></ProtectedRoute>} />
            <Route path="/reporting" element={<ProtectedRoute roles={['admin', 'manager']}><div className="container mx-auto p-6 max-w-7xl"><ReportingPage /></div></ProtectedRoute>} />
            <Route path="/categorization/analytics" element={<ProtectedRoute roles={['admin', 'manager']}><div className="container mx-auto p-6 max-w-7xl"><CategorizationAnalyticsPage /></div></ProtectedRoute>} />
            <Route path="/categorization/queue" element={<ProtectedRoute roles={['admin', 'technician']}><div className="container mx-auto p-6 max-w-7xl"><UncategorizedTicketsPage /></div></ProtectedRoute>} />
            <Route path="/technician/tickets" element={<ProtectedRoute roles={['technician', 'manager', 'admin']}><div className="container mx-auto p-6 max-w-7xl"><TechnicianTicketsPage /></div></ProtectedRoute>} />
            {/* Catch-all redirect to home for authenticated users */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
