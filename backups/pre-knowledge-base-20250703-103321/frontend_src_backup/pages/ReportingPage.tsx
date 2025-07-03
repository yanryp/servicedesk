// src/pages/ReportingPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { 
  ChartBarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface DashboardData {
  overview: {
    totalTickets: number;
    slaCompliance: number;
    avgResolutionTime: number;
    resolvedTickets: number;
  };
  charts: {
    ticketsByStatus: Array<{ status: string; count: number }>;
    ticketsByPriority: Array<{ priority: string; count: number }>;
    slaMetrics: {
      breached: number;
      approaching: number;
      onTime: number;
      compliance: number;
    };
    ticketTrends: Array<{ date: string; count: number }>;
  };
  technicians: Array<{
    username: string;
    assignedTickets: number;
    resolvedTickets: number;
    avgResolutionHours: number;
  }>;
}

const ReportingPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (user?.role !== 'admin') {
        setError('You are not authorized to view this page.');
        setLoading(false);
        return;
      }
      
      try {
        const data = await api.get<DashboardData>('/reports/dashboard');
        setDashboardData(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="ml-3 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!dashboardData) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <p className="text-gray-500">No dashboard data available.</p>
      </div>
    );
  }

  // Chart configurations
  const statusChartData = {
    labels: dashboardData.charts.ticketsByStatus.map(item => 
      item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' ')
    ),
    datasets: [
      {
        label: 'Tickets by Status',
        data: dashboardData.charts.ticketsByStatus.map(item => item.count),
        backgroundColor: [
          '#3B82F6', // blue
          '#10B981', // green
          '#F59E0B', // yellow
          '#EF4444', // red
          '#8B5CF6', // purple
        ],
        borderColor: [
          '#2563EB',
          '#059669',
          '#D97706',
          '#DC2626',
          '#7C3AED',
        ],
        borderWidth: 1,
      },
    ],
  };

  const priorityChartData = {
    labels: dashboardData.charts.ticketsByPriority.map(item => 
      item.priority.charAt(0).toUpperCase() + item.priority.slice(1)
    ),
    datasets: [
      {
        label: 'Tickets by Priority',
        data: dashboardData.charts.ticketsByPriority.map(item => item.count),
        backgroundColor: [
          '#DC2626', // urgent - red
          '#F59E0B', // high - yellow
          '#3B82F6', // medium - blue
          '#10B981', // low - green
        ],
      },
    ],
  };

  const slaChartData = {
    labels: ['On Time', 'Approaching SLA', 'Breached'],
    datasets: [
      {
        label: 'SLA Status',
        data: [
          dashboardData.charts.slaMetrics.onTime,
          dashboardData.charts.slaMetrics.approaching,
          dashboardData.charts.slaMetrics.breached,
        ],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderColor: ['#059669', '#D97706', '#DC2626'],
        borderWidth: 1,
      },
    ],
  };

  const trendsChartData = {
    labels: dashboardData.charts.ticketTrends.map(item => 
      new Date(item.date).toLocaleDateString()
    ),
    datasets: [
      {
        label: 'Tickets Created',
        data: dashboardData.charts.ticketTrends.map(item => item.count),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reporting Dashboard</h1>
        <p className="text-gray-600">Comprehensive analytics and SLA metrics for ticket management</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.overview.totalTickets}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">SLA Compliance</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.min(dashboardData.overview.slaCompliance, 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Resolution</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.overview.avgResolutionTime}h
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ArrowTrendingUpIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.overview.resolvedTickets}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tickets by Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tickets by Status</h3>
          <div className="h-64">
            <Bar data={statusChartData} options={chartOptions} />
          </div>
        </div>

        {/* Tickets by Priority */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tickets by Priority</h3>
          <div className="h-64">
            <Doughnut data={priorityChartData} options={chartOptions} />
          </div>
        </div>

        {/* SLA Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SLA Status</h3>
          <div className="h-64">
            <Doughnut data={slaChartData} options={chartOptions} />
          </div>
        </div>

        {/* Ticket Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Trends (30 Days)</h3>
          <div className="h-64">
            <Line data={trendsChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Technician Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <UserGroupIcon className="h-6 w-6 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Technician Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Technician
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resolved
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Resolution Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resolution Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.technicians.map((tech, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tech.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tech.assignedTickets}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tech.resolvedTickets}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tech.avgResolutionHours}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tech.assignedTickets > 0 
                      ? `${((tech.resolvedTickets / tech.assignedTickets) * 100).toFixed(1)}%`
                      : 'N/A'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportingPage;
