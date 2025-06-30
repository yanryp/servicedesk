// src/components/BSGTemplateDiscovery.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BSGTemplate, 
  BSGTemplateCategory, 
  BSGTemplateSearchRequest,
  BSGTemplateSearchResponse 
} from '../types';
import { BSGTemplateService, useI18n, I18nService } from '../services';

interface BSGTemplateDiscoveryProps {
  onTemplateSelect: (template: BSGTemplate) => void;
  selectedTemplateId?: number;
  searchQuery?: string;
  categoryFilter?: number;
  className?: string;
}

const BSGTemplateDiscovery: React.FC<BSGTemplateDiscoveryProps> = ({
  onTemplateSelect,
  selectedTemplateId,
  searchQuery = '',
  categoryFilter,
  className = ''
}) => {
  const { t, currentLanguage } = useI18n();
  const [templates, setTemplates] = useState<BSGTemplate[]>([]);
  const [categories, setCategories] = useState<BSGTemplateCategory[]>([]);
  const [popularTemplates, setPopularTemplates] = useState<BSGTemplate[]>([]);
  const [recentTemplates, setRecentTemplates] = useState<BSGTemplate[]>([]);
  const [searchInput, setSearchInput] = useState<string>(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(categoryFilter);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'search' | 'popular' | 'recent' | 'categories'>('search');

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [currentLanguage]);

  // Perform search when inputs change
  useEffect(() => {
    if (activeTab === 'search') {
      performSearch();
    }
  }, [searchInput, selectedCategory, activeTab]);

  const loadInitialData = async () => {
    try {
      // Load categories
      const categoriesResponse = await BSGTemplateService.getCategories(currentLanguage);
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }

      // Load popular templates
      const popularResponse = await BSGTemplateService.getPopularTemplates(currentLanguage, 10);
      setPopularTemplates(popularResponse.data || []);

      // Load recent templates
      try {
        const recentResponse = await BSGTemplateService.getRecentTemplates(5);
        if (recentResponse.success) {
          setRecentTemplates(recentResponse.data);
        }
      } catch (error) {
        // Recent templates might fail if user hasn't used any yet
        setRecentTemplates([]);
      }

    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const performSearch = async () => {
    if (!searchInput.trim() && !selectedCategory) {
      setTemplates([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchRequest: BSGTemplateSearchRequest = {
        query: searchInput.trim() || undefined,
        categoryId: selectedCategory,
        language: currentLanguage,
        limit: 50
      };

      const response: BSGTemplateSearchResponse = await BSGTemplateService.searchTemplates(searchRequest);
      setTemplates(response.data || []);
    } catch (error) {
      console.error('Search failed:', error);
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateClick = async (template: BSGTemplate) => {
    // Log template view
    try {
      await BSGTemplateService.logTemplateUsage(template.id, 'view');
    } catch (error) {
      console.error('Failed to log template view:', error);
    }

    onTemplateSelect(template);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSelectedCategory(undefined);
    setTemplates([]);
  };

  // Template card component
  const TemplateCard: React.FC<{ template: BSGTemplate; isSelected?: boolean }> = ({ 
    template, 
    isSelected = false 
  }) => (
    <div
      onClick={() => handleTemplateClick(template)}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
          {I18nService.getDisplayName(template)}
        </h3>
        <div className="flex items-center space-x-1 ml-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {template.popularityScore || 0}
          </span>
        </div>
      </div>
      
      {template.category && (
        <div className="mb-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {I18nService.getDisplayName(template.category)}
          </span>
        </div>
      )}

      <p className="text-xs text-gray-600 line-clamp-2 mb-3">
        {I18nService.getDescription(template)}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{template.fieldDefinitions?.length || 0} {t('template.fields')}</span>
        <span className="flex items-center">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {t('template.select')}
        </span>
      </div>
    </div>
  );

  // Tab content renderers
  const renderSearchTab = () => (
    <div>
      {/* Search Controls */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('template.search.placeholder')}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div>
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : undefined)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t('template.category.all')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {I18nService.getDisplayName(category)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Results */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplateId === template.id}
            />
          ))}
        </div>
      ) : (searchInput.trim() || selectedCategory) ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>{t('template.search.no.results')}</p>
          <p className="text-sm mt-1">{t('template.search.try.different')}</p>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p>{t('template.search.start.typing')}</p>
        </div>
      )}
    </div>
  );

  const renderPopularTab = () => (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('template.popular.title')}
      </h3>
      {popularTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplateId === template.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>{t('template.popular.empty')}</p>
        </div>
      )}
    </div>
  );

  const renderRecentTab = () => (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('template.recent.title')}
      </h3>
      {recentTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplateId === template.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{t('template.recent.empty')}</p>
        </div>
      )}
    </div>
  );

  const renderCategoriesTab = () => (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('template.category.title')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => {
              setSelectedCategory(category.id);
              setActiveTab('search');
            }}
            className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
          >
            <h4 className="font-medium text-gray-900 mb-2">
              {I18nService.getDisplayName(category)}
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              {I18nService.getDescription(category)}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{category.templates?.length || 0} {t('template.templates')}</span>
              <span className="text-blue-600">{t('template.browse')} →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {[
            { key: 'search', label: t('template.tab.search'), icon: '🔍' },
            { key: 'popular', label: t('template.tab.popular'), icon: '⭐' },
            { key: 'recent', label: t('template.tab.recent'), icon: '🕒' },
            { key: 'categories', label: t('template.tab.categories'), icon: '📁' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'search' && renderSearchTab()}
        {activeTab === 'popular' && renderPopularTab()}
        {activeTab === 'recent' && renderRecentTab()}
        {activeTab === 'categories' && renderCategoriesTab()}
      </div>
    </div>
  );
};

export default BSGTemplateDiscovery;