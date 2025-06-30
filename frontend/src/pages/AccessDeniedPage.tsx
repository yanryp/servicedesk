// src/pages/AccessDeniedPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ExclamationTriangleIcon, 
  ArrowLeftIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { Card, Button } from '../components/ui';

const AccessDeniedPage: React.FC = () => {
  const { user } = useAuth();

  const getRoleBasedMessage = () => {
    switch (user?.role) {
      case 'requester':
        return {
          title: 'Access Restricted',
          message: 'This section is only available to technicians, managers, and administrators.',
          suggestion: 'You can create tickets through the Service Catalog or view your existing tickets.'
        };
      case 'technician':
        return {
          title: 'Management Access Required',
          message: 'This section requires manager or administrator privileges.',
          suggestion: 'Focus on your assigned tickets in the Technician Workspace.'
        };
      case 'manager':
        return {
          title: 'Administrator Access Required',
          message: 'This section is only available to system administrators.',
          suggestion: 'You can manage approvals and view reports in your manager dashboard.'
        };
      default:
        return {
          title: 'Access Denied',
          message: 'You do not have permission to access this section.',
          suggestion: 'Please contact your administrator if you believe this is an error.'
        };
    }
  };

  const { title, message, suggestion } = getRoleBasedMessage();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card variant="elevated" padding="xl" className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {title}
        </h1>
        
        <p className="text-gray-600 mb-4">
          {message}
        </p>
        
        <p className="text-sm text-gray-500 mb-8">
          {suggestion}
        </p>
        
        <div className="space-y-3">
          <Button
            onClick={() => window.history.back()}
            variant="primary"
            size="lg"
            icon={ArrowLeftIcon}
            iconPosition="left"
            fullWidth
          >
            Go Back
          </Button>
          
          <Link to="/">
            <Button
              variant="outline"
              size="lg"
              icon={HomeIcon}
              iconPosition="left"
              fullWidth
            >
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default AccessDeniedPage;