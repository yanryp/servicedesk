// src/pages/TicketAnalyticsPage.tsx
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
  ExclamationCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  DocumentMagnifyingGlassIcon,
  ChartPieIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  BugAntIcon,
  WrenchScrewdriverIcon,
  ComputerDesktopIcon
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

interface TicketAnalytics {
  overview: {
    totalTickets: number;
    mostCommonCategory: string;
    mostCommonPriority: string;
    averageResolutionDays: number;
    reopenRate: number;
    escalationRate: number;
  };
  problemAnalysis: {
    topCategories: Array<{ category: string; count: number; avgResolutionHours: number }>;
    topSubcategories: Array<{ subcategory: string; count: number; impact: string }>;
    rootCauses: Array<{ cause: string; count: number; prevention: string }>;
    recurringIssues: Array<{ issue: string; occurrences: number; lastSeen: string }>;
  };
  trends: {
    monthlyTrends: Array<{ month: string; created: number; resolved: number; reopened: number }>;
    priorityTrends: Array<{ date: string; urgent: number; high: number; medium: number; low: number }>;
    resolutionTimeByCategory: Array<{ category: string; avgHours: number; target: number }>;
  };
  insights: {
    bottlenecks: Array<{ area: string; description: string; impact: string; recommendation: string }>;
    patterns: Array<{ pattern: string; frequency: string; suggestion: string }>;
    improvements: Array<{ area: string; currentState: string; recommendation: string; expectedImpact: string }>;
  };
  branches: {
    branchIssues: Array<{ 
      branchName: string; 
      branchCode: string;
      commonIssues: Array<{ issue: string; count: number }>;
      avgResolutionTime: number;
      escalationRate: number;
    }>;
    geographicPatterns: Array<{ region: string; issues: Array<{ type: string; count: number }> }>;
  };
}

const TicketAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<TicketAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('3m'); // 3 months default
  const { user } = useAuth();

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (user?.role !== 'admin') {
        setError('You are not authorized to view ticket analytics.');
        setLoading(false);
        return;
      }
      
      try {
        const data = await api.get<TicketAnalytics>(`/analytics/tickets?timeRange=${timeRange}`);
        setAnalytics(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch ticket analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing Ticket Patterns...</p>
          <p className="text-sm text-gray-500 mt-1">Processing insights from BSG network data</p>
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
              <p className="mt-1 text-xs text-red-600">Please check if the analytics API is configured correctly.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <DocumentMagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data Available</h3>
          <p className="text-gray-500 mb-4">Ticket analytics are not yet configured.</p>
          <p className="text-sm text-gray-400">Contact your system administrator to enable analytics features.</p>
        </div>
      </div>
    );
  }

  // Chart configurations
  const categoryChartData = {
    labels: analytics.problemAnalysis.topCategories.map(item => item.category),
    datasets: [
      {
        label: 'Ticket Count',
        data: analytics.problemAnalysis.topCategories.map(item => item.count),
        backgroundColor: [
          '#EF4444', // Red for high volume
          '#F59E0B', // Yellow for medium volume
          '#3B82F6', // Blue for normal volume
          '#10B981', // Green for low volume
          '#8B5CF6', // Purple for misc
        ],
        borderColor: [
          '#DC2626',
          '#D97706',
          '#2563EB',
          '#059669',
          '#7C3AED',
        ],
        borderWidth: 1,
      },
    ],
  };

  const resolutionTimeChartData = {
    labels: analytics.trends.resolutionTimeByCategory.map(item => item.category),
    datasets: [
      {
        label: 'Actual Resolution Time (hours)',
        data: analytics.trends.resolutionTimeByCategory.map(item => item.avgHours),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: '#DC2626',
        borderWidth: 1,
      },
      {
        label: 'Target Resolution Time (hours)',
        data: analytics.trends.resolutionTimeByCategory.map(item => item.target),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: '#059669',
        borderWidth: 1,
      },
    ],
  };

  const trendsChartData = {
    labels: analytics.trends.monthlyTrends.map(item => item.month),
    datasets: [
      {
        label: 'Created',
        data: analytics.trends.monthlyTrends.map(item => item.created),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Resolved',
        data: analytics.trends.monthlyTrends.map(item => item.resolved),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Reopened',
        data: analytics.trends.monthlyTrends.map(item => item.reopened),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">BSG Ticket Analytics & Insights</h1>
            <p className="text-gray-600">Deep analysis of ticket patterns, problems, and improvement opportunities</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1m">Last Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentMagnifyingGlassIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Analyzed</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalTickets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Top Problem</p>
              <p className="text-lg font-bold text-gray-900">{analytics.overview.mostCommonCategory}</p>
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
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.averageResolutionDays}d</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ArrowTrendingUpIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reopen Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.reopenRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Escalation Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.escalationRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ChartPieIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Priority Focus</p>
              <p className="text-lg font-bold text-gray-900">{analytics.overview.mostCommonPriority}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {/* Problem Categories */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Common Problems</h3>
          <div className="h-64">
            <Bar data={categoryChartData} options={chartOptions} />
          </div>
        </div>

        {/* Resolution Time Analysis */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolution Time vs Target</h3>
          <div className="h-64">
            <Bar data={resolutionTimeChartData} options={chartOptions} />
          </div>
        </div>

        {/* Ticket Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Volume Trends</h3>
          <div className="h-64">
            <Line data={trendsChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Problem Analysis Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Root Causes Analysis */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <BugAntIcon className="h-6 w-6 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Root Causes Analysis</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Root Cause
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Occurrences
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prevention Strategy
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.problemAnalysis.rootCauses.map((cause, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{cause.cause}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        cause.count > 20 ? 'bg-red-100 text-red-800' :
                        cause.count > 10 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {cause.count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{cause.prevention}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recurring Issues */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <ComputerDesktopIcon className="h-6 w-6 text-orange-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Recurring Issues</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Seen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.problemAnalysis.recurringIssues.map((issue, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{issue.issue}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        issue.occurrences > 15 ? 'bg-red-100 text-red-800' :
                        issue.occurrences > 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {issue.occurrences}x
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(issue.lastSeen).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Bottlenecks */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Identified Bottlenecks</h3>
          </div>
          <div className="space-y-4">
            {analytics.insights.bottlenecks.map((bottleneck, index) => (
              <div key={index} className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-red-800">{bottleneck.area}</h4>
                <p className="text-sm text-gray-600 mb-2">{bottleneck.description}</p>
                <p className="text-xs text-gray-500">Impact: {bottleneck.impact}</p>
                <p className="text-xs font-medium text-blue-600 mt-1">{bottleneck.recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Patterns */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <LightBulbIcon className="h-6 w-6 text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Detected Patterns</h3>
          </div>
          <div className="space-y-4">
            {analytics.insights.patterns.map((pattern, index) => (
              <div key={index} className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-semibold text-yellow-800">{pattern.pattern}</h4>
                <p className="text-sm text-gray-600 mb-2">Frequency: {pattern.frequency}</p>
                <p className="text-xs font-medium text-green-600">{pattern.suggestion}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Improvement Opportunities */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <WrenchScrewdriverIcon className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Improvement Opportunities</h3>
          </div>
          <div className="space-y-4">
            {analytics.insights.improvements.map((improvement, index) => (
              <div key={index} className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-green-800">{improvement.area}</h4>
                <p className="text-sm text-gray-600 mb-1">Current: {improvement.currentState}</p>
                <p className="text-xs font-medium text-blue-600 mb-1">{improvement.recommendation}</p>
                <p className="text-xs text-green-600">Expected: {improvement.expectedImpact}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Branch Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <ComputerDesktopIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">BSG Branch Issue Patterns</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Common Issues
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Resolution
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Escalation Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.branches.branchIssues.slice(0, 10).map((branch, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{branch.branchName}</div>
                      <div className="text-sm text-gray-500">{branch.branchCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {branch.commonIssues.slice(0, 3).map((issue, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <span className="text-sm text-gray-700">{issue.issue}</span>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {issue.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {branch.avgResolutionTime}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`font-medium ${
                      branch.escalationRate > 15 ? 'text-red-600' :
                      branch.escalationRate > 10 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {branch.escalationRate}%
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

export default TicketAnalyticsPage;