// src/components/CategorizationAnalyticsDashboard.tsx
import React, { useState, useEffect } from 'react';
import { categorizationService } from '../services/categorization';
import { CategorizationAnalytics } from '../types';

interface AnalyticsDashboardProps {
  userRole?: string;
  departmentId?: number;
}

const CategorizationAnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  userRole,
  departmentId
}) => {
  const [analytics, setAnalytics] = useState<CategorizationAnalytics | null>(null);
  const [trends, setTrends] = useState<any>(null);
  const [servicePatterns, setServicePatterns] = useState<any>(null);
  const [technicianPerformance, setTechnicianPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    department: departmentId || 0,
    interval: 'day' as 'day' | 'week' | 'month'
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, [filters]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filterParams = {
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        department: filters.department || undefined
      };

      // Load overview data
      const overviewData = await categorizationService.analytics.getOverview(filterParams);
      setAnalytics(overviewData);

      // Load trends
      const trendsData = await categorizationService.analytics.getTrends({
        ...filterParams,
        interval: filters.interval
      });
      setTrends(trendsData);

      // Load service patterns (if manager/admin)
      if (['manager', 'admin'].includes(userRole || '')) {
        const patternsData = await categorizationService.analytics.getServicePatterns(filterParams);
        setServicePatterns(patternsData);

        const performanceData = await categorizationService.analytics.getTechnicianPerformance(filterParams);
        setTechnicianPerformance(performanceData);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const filterParams = {
        format,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        department: filters.department || undefined
      };

      const data = await categorizationService.analytics.exportData(filterParams);
      
      if (format === 'csv') {
        // Create blob and download
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `categorization-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Download JSON
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `categorization-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error: any) {
      console.error('Export failed:', error);
    }
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Classification Analytics</h2>
          {userRole === 'admin' && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleExport('csv')}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Export CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Export JSON
              </button>
            </div>
          )}
        </div>

        {/* Date Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interval</label>
            <select
              value={filters.interval}
              onChange={(e) => setFilters(prev => ({ ...prev, interval: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadAnalytics}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'trends', 'services', 'performance'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } ${tab === 'services' || tab === 'performance' ? 
                  (!['manager', 'admin'].includes(userRole || '') ? 'hidden' : '') : ''}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Summary Cards */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm font-medium text-gray-500">Total Tickets</div>
            <div className="text-2xl font-bold text-gray-900">{analytics.overview.totalTickets}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm font-medium text-gray-500">Categorized</div>
            <div className="text-2xl font-bold text-green-600">{analytics.overview.categorizedTickets}</div>
            <div className="text-sm text-gray-500">
              {formatPercentage(analytics.overview.completionRate)} complete
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm font-medium text-gray-500">Uncategorized</div>
            <div className="text-2xl font-bold text-red-600">{analytics.overview.uncategorizedTickets}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm font-medium text-gray-500">User Accuracy</div>
            <div className={`text-2xl font-bold ${getStatusColor(analytics.qualityMetrics.userAccuracyRate)}`}>
              {formatPercentage(analytics.qualityMetrics.userAccuracyRate)}
            </div>
            <div className="text-sm text-gray-500">
              {analytics.qualityMetrics.totalOverrides} overrides
            </div>
          </div>

          {/* Distribution Charts */}
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Root Cause Distribution</h3>
            <div className="space-y-3">
              {analytics.distributions.rootCause.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {item.type.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {formatPercentage(item.percentage)}
                    </span>
                    <span className="text-sm text-gray-500 w-8 text-right">
                      ({item.count})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Issue Category Distribution</h3>
            <div className="space-y-3">
              {analytics.distributions.issueCategory.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {item.type}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {formatPercentage(item.percentage)}
                    </span>
                    <span className="text-sm text-gray-500 w-8 text-right">
                      ({item.count})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && trends && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Categorization Trends</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{trends.summary.totalPeriods}</div>
                <div className="text-sm text-gray-500">Time Periods</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{trends.summary.averageTicketsPerPeriod}</div>
                <div className="text-sm text-gray-500">Avg Tickets/Period</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatPercentage(trends.summary.averageCategorizationRate)}
                </div>
                <div className="text-sm text-gray-500">Avg Classification Rate</div>
              </div>
            </div>

            {/* Simple trends table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categorized</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trends.trends.map((trend: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trend.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trend.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trend.categorized}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trend.total > 0 ? formatPercentage((trend.categorized / trend.total) * 100) : '0%'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Service Patterns Tab */}
      {activeTab === 'services' && servicePatterns && ['manager', 'admin'].includes(userRole || '') && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Service Categorization Patterns</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Top Root Cause</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Top Category</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {servicePatterns.servicePatterns.map((service: any) => {
                  const topRootCause = Object.entries(service.rootCauseDistribution).sort((a: any, b: any) => b[1] - a[1])[0];
                  const topCategory = Object.entries(service.issueCategoryDistribution).sort((a: any, b: any) => b[1] - a[1])[0];
                  
                  return (
                    <tr key={service.serviceId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {service.serviceName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service.serviceType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {service.totalTickets}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {topRootCause ? `${topRootCause[0].replace('_', ' ')} (${topRootCause[1]})` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {topCategory ? `${topCategory[0]} (${topCategory[1]})` : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && technicianPerformance && ['manager', 'admin'].includes(userRole || '') && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Technician Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{technicianPerformance.summary.totalTechnicians}</div>
              <div className="text-sm text-gray-500">Active Technicians</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{technicianPerformance.summary.totalCategorizations}</div>
              <div className="text-sm text-gray-500">Total Classifications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{technicianPerformance.summary.averageProductivity}</div>
              <div className="text-sm text-gray-500">Avg Daily Classifications</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classifications</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Avg</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {technicianPerformance.performanceMetrics.map((metric: any) => (
                  <tr key={metric.technicianId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {metric.technician?.username || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {metric.technician?.department?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {metric.ticketsCategorized}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {metric.avgTicketsPerDay}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {metric.lastCategorization ? new Date(metric.lastCategorization).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorizationAnalyticsDashboard;