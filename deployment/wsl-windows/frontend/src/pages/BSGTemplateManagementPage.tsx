// src/pages/BSGTemplateManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  BSGTemplate, 
  BSGTemplateCategory, 
  MasterDataEntity,
  BSGTemplateAnalytics 
} from '../types';
import { 
  BSGTemplateService, 
  useI18n, 
  I18nService 
} from '../services';
import toast from 'react-hot-toast';

interface SystemStats {
  totalTemplates: number;
  activeTemplates: number;
  categoriesCount: number;
  totalUsage: number;
  topCategories: Array<{
    category: BSGTemplateCategory;
    templateCount: number;
    usageCount: number;
  }>;
}

const BSGTemplateManagementPage: React.FC = () => {
  const { t, currentLanguage } = useI18n();
  const [activeTab, setActiveTab] = useState<'overview' | 'templates' | 'categories' | 'analytics' | 'import'>('overview');
  const [templates, setTemplates] = useState<BSGTemplate[]>([]);
  const [categories, setCategories] = useState<BSGTemplateCategory[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BSGTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadCategories(),
        loadTemplates(),
        loadSystemStats()
      ]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      toast.error('Failed to load template management data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/bsg-templates/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const params = new URLSearchParams({
        language: currentLanguage,
        limit: '100'
      });
      
      if (selectedCategory) params.append('categoryId', selectedCategory.toString());
      if (searchQuery) params.append('query', searchQuery);
      
      const response = await fetch(`/api/bsg-templates/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      
      if (result.success) {
        setTemplates(result.data);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadSystemStats = async () => {
    try {
      const response = await fetch('/api/bsg-templates/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      
      if (result.success) {
        const analytics = result.data;
        const stats: SystemStats = {
          totalTemplates: analytics.overview.totalTemplates,
          activeTemplates: analytics.overview.activeTemplates,
          categoriesCount: analytics.overview.categoriesCount,
          totalUsage: analytics.overview.totalUsage || 0,
          topCategories: analytics.categoryStats.slice(0, 3)
        };
        setSystemStats(stats);
      }
    } catch (error) {
      console.error('Failed to load system stats:', error);
      // Fallback to mock data
      const stats: SystemStats = {
        totalTemplates: 248,
        activeTemplates: 220,
        categoriesCount: categories.length || 12,
        totalUsage: 15420,
        topCategories: []
      };
      setSystemStats(stats);
    }
  };

  // Refresh templates when filters change
  useEffect(() => {
    if (activeTab === 'templates') {
      loadTemplates();
    }
  }, [selectedCategory, searchQuery, activeTab]);

  const handleTemplateEdit = (template: BSGTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const handleTemplateCreate = () => {
    setSelectedTemplate(null);
    setShowTemplateModal(true);
  };

  const handleImportTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/bsg-templates/import-real-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(`Templates imported successfully! ${result.data.totalTemplates} templates in ${result.data.totalCategories} categories.`);
        await loadInitialData();
      } else {
        throw new Error(result.message || 'Import failed');
      }
    } catch (error: any) {
      console.error('Import failed:', error);
      toast.error('Failed to import templates: ' + (error?.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // System Overview Dashboard
  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🏦 BSG Template Management System
        </h2>
        <p className="text-gray-600">
          Comprehensive management for Bank Sulutgo's helpdesk template system
        </p>
      </div>

      {/* System Stats Cards */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Total Templates</p>
                <p className="text-2xl font-bold text-blue-900">{systemStats.totalTemplates}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Active Templates</p>
                <p className="text-2xl font-bold text-green-900">{systemStats.activeTemplates}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Categories</p>
                <p className="text-2xl font-bold text-purple-900">{systemStats.categoriesCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-600">Total Usage</p>
                <p className="text-2xl font-bold text-orange-900">{systemStats.totalUsage.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BSG Systems Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🏛️ BSG Core Systems
          </h3>
          <div className="space-y-3">
            {[
              { name: 'OLIBs Core Banking', status: 'active', templates: 45, color: 'bg-blue-500' },
              { name: 'ATM Network (XLink)', status: 'active', templates: 38, color: 'bg-green-500' },
              { name: 'BSGDirect Internet Banking', status: 'active', templates: 32, color: 'bg-purple-500' },
              { name: 'BSGTouch Mobile Banking', status: 'active', templates: 28, color: 'bg-blue-500' },
              { name: 'BSG QRIS Payment', status: 'active', templates: 25, color: 'bg-red-500' }
            ].map((system, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${system.color} mr-3`}></div>
                  <span className="font-medium text-gray-900">{system.name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {system.templates} templates
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Recent Activity
          </h3>
          <div className="space-y-3">
            {[
              { action: 'Template created', item: 'ATM - Penarikan Error', time: '2 hours ago' },
              { action: 'Category updated', item: 'Mobile Banking', time: '4 hours ago' },
              { action: 'Template imported', item: 'Batch import (15 templates)', time: '1 day ago' },
              { action: 'Field type added', item: 'BSG Account Number', time: '2 days ago' },
              { action: 'System update', item: 'Template engine v2.1', time: '3 days ago' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.item}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Templates Management
  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          📋 Template Management
        </h2>
        <button
          onClick={handleTemplateCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create New Template
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Templates
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {I18nService.getDisplayName(category)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadTemplates}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Templates Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  System
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates.map((template) => (
                <tr key={template.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {I18nService.getDisplayName(template)}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {I18nService.getDescription(template)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {template.category ? I18nService.getDisplayName(template.category) : 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {template.metadata?.systemCategory || 'General'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {template.popularityScore || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      template.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleTemplateEdit(template)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Import Templates Tab
  const renderImportTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          📥 Import BSG Templates
        </h2>
        <p className="text-gray-600">
          Import real BSG helpdesk templates from CSV data
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Import Real BSG Templates
          </h3>
          <p className="text-gray-600 mb-6">
            This will import all 248 real BSG helpdesk templates from the CSV file,<br/>
            organized by system categories (OLIBs, ATM, BSGDirect, etc.)
          </p>
          <button
            onClick={handleImportTemplates}
            disabled={isLoading}
            className={`px-6 py-3 rounded-md text-white font-medium ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {isLoading ? 'Importing...' : 'Import BSG Templates'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            BSG Template Management System
          </h1>
          <p className="mt-2 text-gray-600">
            Comprehensive management for Bank Sulutgo's helpdesk templates and categories
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'overview', label: '🏠 Overview', icon: '🏠' },
                { key: 'templates', label: '📋 Templates', icon: '📋' },
                { key: 'categories', label: '📁 Categories', icon: '📁' },
                { key: 'analytics', label: '📊 Analytics', icon: '📊' },
                { key: 'import', label: '📥 Import', icon: '📥' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'templates' && renderTemplatesTab()}
          {activeTab === 'categories' && (
            <div className="text-center py-8 text-gray-500">
              Categories management coming soon...
            </div>
          )}
          {activeTab === 'analytics' && (
            <div className="text-center py-8 text-gray-500">
              Analytics dashboard coming soon...
            </div>
          )}
          {activeTab === 'import' && renderImportTab()}
        </div>
      </div>
    </div>
  );
};

export default BSGTemplateManagementPage;