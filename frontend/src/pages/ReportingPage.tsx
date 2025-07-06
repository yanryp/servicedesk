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
  UserGroupIcon,
  BuildingOffice2Icon,
  DocumentCheckIcon,
  CubeTransparentIcon,
  GlobeAsiaAustraliaIcon
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
    pendingApprovals: number;
    avgApprovalTime: number;
    branchCount: number;
    activeUsers: number;
  };
  charts: {
    ticketsByStatus: Array<{ status: string; count: number }>;
    ticketsByPriority: Array<{ priority: string; count: number }>;
    ticketsByCategory: Array<{ category: string; count: number }>;
    slaMetrics: {
      breached: number;
      approaching: number;
      onTime: number;
      compliance: number;
    };
    ticketTrends: Array<{ date: string; count: number }>;
    approvalTrends: Array<{ date: string; approved: number; rejected: number; pending: number }>;
  };
  technicians: Array<{
    username: string;
    assignedTickets: number;
    resolvedTickets: number;
    avgResolutionHours: number;
    department: string;
  }>;
  branches: Array<{
    name: string;
    code: string;
    type: string;
    ticketCount: number;
    avgApprovalTime: number;
    slaCompliance: number;
    managerName: string;
  }>;
  approvalMetrics: {
    totalApprovals: number;
    avgApprovalTime: number;
    approvalRate: number;
    fastestApprover: string;
    slowestApprover: string;
  };
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading BSG Enterprise Analytics...</p>
          <p className="text-sm text-gray-500 mt-1">Analyzing 51 branches and 159 users</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-red-800">Analytics Service Error</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <p className="mt-1 text-xs text-red-600">Please check if the backend reporting API is configured correctly.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!dashboardData) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data Available</h3>
          <p className="text-gray-500 mb-4">BSG Enterprise analytics are not yet configured.</p>
          <p className="text-sm text-gray-400">Contact your system administrator to enable reporting features.</p>
        </div>
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

  const categoryChartData = {
    labels: dashboardData.charts.ticketsByCategory?.map(item => item.category) || [],
    datasets: [
      {
        label: 'Tickets by Category',
        data: dashboardData.charts.ticketsByCategory?.map(item => item.count) || [],
        backgroundColor: [
          '#1E40AF', // BSGDirect - blue
          '#059669', // KASDA - green
          '#DC2626', // IT Infrastructure - red
          '#7C2D12', // Network & Security - brown
          '#6366F1', // Applications - indigo
        ],
        borderColor: [
          '#1E3A8A',
          '#047857',
          '#B91C1C',
          '#451A03',
          '#4F46E5',
        ],
        borderWidth: 1,
      },
    ],
  };

  const approvalTrendsData = {
    labels: dashboardData.charts.approvalTrends?.map(item => 
      new Date(item.date).toLocaleDateString()
    ) || [],
    datasets: [
      {
        label: 'Approved',
        data: dashboardData.charts.approvalTrends?.map(item => item.approved) || [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Rejected',
        data: dashboardData.charts.approvalTrends?.map(item => item.rejected) || [],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Pending',
        data: dashboardData.charts.approvalTrends?.map(item => item.pending) || [],
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">BSG Enterprise Reporting</h1>
            <p className="text-gray-600">Banking network analytics, approval workflows, and SLA metrics</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Network Coverage</p>
              <p className="text-lg font-bold text-blue-600">{dashboardData.overview.branchCount} Branches</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-lg font-bold text-green-600">{dashboardData.overview.activeUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
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

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DocumentCheckIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.overview.pendingApprovals}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Approval</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.overview.avgApprovalTime}h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
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

        {/* Tickets by Category */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">BSG Service Categories</h3>
          <div className="h-64">
            <Bar data={categoryChartData} options={chartOptions} />
          </div>
        </div>

        {/* Approval Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Workflow Trends</h3>
          <div className="h-64">
            <Line data={approvalTrendsData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Management Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Branch Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <BuildingOffice2Icon className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">BSG Branch Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tickets
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SLA
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(dashboardData.branches || []).slice(0, 8).map((branch, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{branch.name}</div>
                        <div className="text-xs text-gray-500">{branch.code}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        branch.type === 'CABANG' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {branch.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {branch.ticketCount}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <span className={`font-medium ${
                        branch.slaCompliance >= 90 ? 'text-green-600' : 
                        branch.slaCompliance >= 75 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {branch.slaCompliance.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Approval Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <DocumentCheckIcon className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Manager Approval Metrics</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-600">Total Approvals</p>
                <p className="text-2xl font-bold text-blue-900">
                  {dashboardData.approvalMetrics?.totalApprovals || 0}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-600">Approval Rate</p>
                <p className="text-2xl font-bold text-green-900">
                  {(dashboardData.approvalMetrics?.approvalRate || 0).toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fastest Approver:</span>
                  <span className="text-sm font-medium text-green-600">
                    {dashboardData.approvalMetrics?.fastestApprover || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Approval Time:</span>
                  <span className="text-sm font-medium text-blue-600">
                    {(dashboardData.approvalMetrics?.avgApprovalTime || 0).toFixed(1)}h
                  </span>
                </div>
              </div>
            </div>
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
                  Department
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
              {(dashboardData.technicians || []).map((tech, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tech.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      tech.department === 'Information Technology' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {tech.department}
                    </span>
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
                    <span className={`font-medium ${
                      tech.assignedTickets > 0 
                        ? (tech.resolvedTickets / tech.assignedTickets) >= 0.8 
                          ? 'text-green-600' 
                          : (tech.resolvedTickets / tech.assignedTickets) >= 0.6 
                            ? 'text-yellow-600' 
                            : 'text-red-600'
                        : 'text-gray-500'
                    }`}>
                      {tech.assignedTickets > 0 
                        ? `${((tech.resolvedTickets / tech.assignedTickets) * 100).toFixed(1)}%`
                        : 'N/A'
                      }
                    </span>
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
