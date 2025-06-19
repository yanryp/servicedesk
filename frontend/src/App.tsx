// frontend/src/App.tsx
import React from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { 
  TicketIcon, 
  PlusCircleIcon, 
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UserIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TicketsPage from './pages/TicketsPage';
import CreateTicketPage from './pages/CreateTicketPage';
import TicketDetailPage from './pages/TicketDetailPage';
import EditTicketPage from './pages/EditTicketPage';
import ReportingPage from './pages/ReportingPage';
import ManagerDashboard from './pages/ManagerDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Display a loading message or spinner while AuthContext is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
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
              {isAuthenticated && (
                <div className="flex space-x-1">
                  <Link 
                    to="/tickets"
                    className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    <ClipboardDocumentListIcon className="w-4 h-4" />
                    <span>My Tickets</span>
                  </Link>
                  <Link 
                    to="/create-ticket"
                    className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    <PlusCircleIcon className="w-4 h-4" />
                    <span>Create Ticket</span>
                  </Link>
                  {(user?.role === 'admin' || user?.role === 'manager') && (
                    <>
                      <Link 
                        to="/manager"
                        className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>Approvals</span>
                      </Link>
                      <Link 
                        to="/reporting"
                        className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        <ChartBarIcon className="w-4 h-4" />
                        <span>Reporting</span>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 px-3 py-2 bg-slate-100 rounded-lg">
                      <UserIcon className="w-4 h-4 text-slate-600" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700">{user?.username}</span>
                        <div className="flex items-center space-x-2 -mt-0.5">
                          <span className="text-xs text-slate-500">{user?.role}</span>
                          {user?.department && (
                            <>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs text-blue-600 font-medium">{user.department.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex space-x-3">
                  <Link
                    to="/login"
                    className="text-slate-600 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/tickets" element={isAuthenticated ? <TicketsPage /> : <Navigate to="/login" />} />
          <Route path="/create-ticket" element={isAuthenticated ? <CreateTicketPage /> : <Navigate to="/login" />} />
          <Route path="/tickets/:ticketId" element={isAuthenticated ? <TicketDetailPage /> : <Navigate to="/login" />} />
          <Route path="/tickets/:ticketId/edit" element={isAuthenticated ? <EditTicketPage /> : <Navigate to="/login" />} />
          <Route path="/manager" element={<ProtectedRoute roles={['admin', 'manager']}><ManagerDashboard /></ProtectedRoute>} />
          <Route path="/reporting" element={<ProtectedRoute roles={['admin', 'manager']}><ReportingPage /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
