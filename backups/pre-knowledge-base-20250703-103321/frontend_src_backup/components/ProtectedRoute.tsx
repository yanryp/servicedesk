// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AccessDeniedPage from '../pages/AccessDeniedPage';

interface ProtectedRouteProps {
  children: React.ReactElement;
  roles: string[];
  requireOwnership?: boolean; // For ticket ownership checks
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  roles, 
  requireOwnership = false 
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const { ticketId } = useParams();

  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!user) {
    // User not logged in, redirect to login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!roles.includes(user.role)) {
    // User does not have the required role, show access denied page
    return <AccessDeniedPage />;
  }

  // For ticket ownership checks (basic implementation)
  // Note: In a full implementation, this would need to fetch ticket data
  // to verify ownership. For now, we allow all authenticated users with proper roles
  if (requireOwnership && ticketId) {
    // Allow technicians, managers, and admins to access any ticket
    // Requesters would need additional ownership verification (to be implemented in the component itself)
    if (user.role === 'requester') {
      // This should be enhanced to check actual ticket ownership
      // For now, we'll let the individual page components handle this
      console.log('Ticket ownership check needed for requester:', { ticketId, userId: user.id });
    }
  }

  return children;
};

export default ProtectedRoute;
