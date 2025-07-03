// src/pages/CategorizationAnalyticsPage.tsx
import React from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { CategorizationAnalyticsDashboard } from '../components';

const CategorizationAnalyticsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
            <ChartBarIcon className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Categorization Analytics
        </h1>
        <p className="mt-2 text-slate-600">
          Analyze ticket classification patterns and performance metrics
        </p>
      </div>

      <CategorizationAnalyticsDashboard 
        userRole={user?.role}
        departmentId={user?.departmentId}
      />
    </div>
  );
};

export default CategorizationAnalyticsPage;