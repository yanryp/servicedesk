// Enhanced BSG Template Selection Component
import React, { useState, useEffect, useMemo } from 'react';
import { 
  MagnifyingGlassIcon as SearchIcon, 
  BuildingOffice2Icon as BuildingOfficeIcon, 
  CubeIcon,
  StarIcon,
  ClockIcon,
  DocumentIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface BSGTemplateCategory {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  icon?: string;
  template_count: number;
}

interface BSGTemplate {
  id: number;
  template_number: number;
  name: string;
  display_name: string;
  description?: string;
  popularity_score: number;
  usage_count: number;
  category_name: string;
  category_display_name: string;
}

interface BSGTemplateSelectorProps {
  onTemplateSelect: (template: BSGTemplate | null) => void;
  selectedTemplate?: BSGTemplate | null;
  disabled?: boolean;
}

const BSGTemplateSelector: React.FC<BSGTemplateSelectorProps> = ({
  onTemplateSelect,
  selectedTemplate,
  disabled = false
}) => {
  const [categories, setCategories] = useState<BSGTemplateCategory[]>([]);
  const [templates, setTemplates] = useState<BSGTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<BSGTemplateCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');  
  const [favorites, setFavorites] = useState<number[]>([]);
  // const [recentTemplates, setRecentTemplates] = useState<BSGTemplate[]>([]); // For future use
  const [viewMode, setViewMode] = useState<'categories' | 'templates'>('categories');

  // Load categories from API
  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadTemplates(selectedCategory.id);
    }
  }, [selectedCategory, searchQuery]);

  const loadCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${baseUrl}/bsg-templates/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setCategories(result.data || []);
      } else {
        throw new Error('Failed to load categories');
      }
    } catch (err) {
      console.error('Error loading BSG categories:', err);
      setError('Failed to load template categories');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async (categoryId: number) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${baseUrl}/bsg-templates/templates?categoryId=${categoryId}&search=${searchQuery}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setTemplates(result.data || []);
      } else {
        throw new Error('Failed to load templates');
      }
    } catch (err) {
      console.error('Error loading BSG templates:', err);
      setError('Failed to load templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: BSGTemplateCategory) => {
    setSelectedCategory(category);
    setViewMode('templates');
    onTemplateSelect(null); // Clear template selection when category changes
  };

  const handleBackToCategories = () => {
    setViewMode('categories');
    setSelectedCategory(null);
    setSearchQuery('');
    onTemplateSelect(null);
  };

  const handleTemplateSelect = (template: BSGTemplate) => {
    onTemplateSelect(template);
  };

  const getCategoryIcon = (categoryName: string) => {
    const iconClass = "h-5 w-5";
    switch (categoryName) {
      case 'OLIBS':
        return <BuildingOfficeIcon className={iconClass} />;
      case 'BSGTouch':
        return <DocumentIcon className={iconClass} />;
      case 'KASDA':
        return <SparklesIcon className={iconClass} />;
      case 'ATM':
        return <CubeIcon className={iconClass} />;
      case 'KLAIM':
        return <CheckCircleIcon className={iconClass} />;
      default:
        return <CubeIcon className={iconClass} />;
    }
  };

  const getCategoryColor = (categoryName: string) => {
    switch (categoryName) {
      case 'OLIBS': return 'from-blue-500 to-blue-600';
      case 'BSGTouch': return 'from-purple-500 to-purple-600';
      case 'KASDA': return 'from-green-500 to-green-600';
      case 'ATM': return 'from-orange-500 to-orange-600';
      case 'KLAIM': return 'from-indigo-500 to-indigo-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const toggleFavorite = (templateId: number) => {
    setFavorites(prev => 
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const getEstimatedTime = (template: BSGTemplate) => {
    // Estimate based on complexity (could be enhanced with real data)
    const baseTime = 5; // minutes
    const complexityMultiplier = Math.min(template.template_number / 10, 3);
    return Math.round(baseTime + complexityMultiplier);
  };

  const filteredTemplates = useMemo(() => {
    let filtered = templates;
    
    if (searchQuery) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category_display_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort by: favorites first, then by popularity score
    return filtered.sort((a, b) => {
      const aIsFavorite = favorites.includes(a.id) ? 1 : 0;
      const bIsFavorite = favorites.includes(b.id) ? 1 : 0;
      
      if (aIsFavorite !== bIsFavorite) {
        return bIsFavorite - aIsFavorite;
      }
      
      return b.popularity_score - a.popularity_score;
    });
  }, [templates, searchQuery, favorites]);

  if (error && categories.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Error loading BSG templates</div>
        <div className="text-sm text-gray-500">{error}</div>
        <button 
          onClick={loadCategories}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${disabled ? 'opacity-50 pointer-events-none' : ''}`} data-testid="bsg-template-discovery">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {viewMode === 'templates' && (
            <button
              onClick={handleBackToCategories}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowRightIcon className="h-4 w-4 rotate-180" />
              <span className="text-sm font-medium">Back to Categories</span>
            </button>
          )}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 flex items-center">
              🏦 BSG Banking System Templates
              {selectedCategory && (
                <span className="ml-2 text-sm font-normal text-slate-600">
                  / {selectedCategory.display_name}
                </span>
              )}
            </h3>
            {viewMode === 'categories' && (
              <p className="text-sm text-slate-600 mt-1">
                Select a banking service category to view available templates
              </p>
            )}
          </div>
        </div>
        
        {/* Global Search - Always visible */}
        {viewMode === 'templates' && (
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        )}
      </div>

      {/* Category Selection */}
      {viewMode === 'categories' && (
        <div>
          {loading && categories.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading template categories...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  className="group p-6 text-left border border-gray-200 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-transparent hover:-translate-y-1 bg-white"
                  data-testid="template-category"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(category.name)} rounded-xl flex items-center justify-center shadow-lg`}>
                      {getCategoryIcon(category.name)}
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-500">Templates</div>
                      <div className="text-lg font-bold text-gray-900">{category.template_count}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {category.display_name}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <span className="text-xs text-blue-600 font-medium">
                      {category.name} Category
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Enhanced Template Selection */}
      {viewMode === 'templates' && selectedCategory && (
        <div className="space-y-6">
          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 bg-gradient-to-r ${getCategoryColor(selectedCategory.name)} rounded-lg flex items-center justify-center shadow-lg`}>
                {getCategoryIcon(selectedCategory.name)}
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">
                  {selectedCategory.display_name} Templates
                </h4>
                <p className="text-sm text-slate-600">
                  {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>
            </div>
            
            {favorites.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-yellow-600">
                <StarIconSolid className="h-4 w-4" />
                <span>{favorites.length} favorite{favorites.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading templates...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTemplates.map((template) => {
                const isFavorite = favorites.includes(template.id);
                const estimatedTime = getEstimatedTime(template);
                const isSelected = selectedTemplate?.id === template.id;
                
                return (
                  <div
                    key={template.id}
                    className={`group relative bg-white border-2 rounded-xl transition-all duration-300 hover:shadow-lg ${
                      isSelected
                        ? 'border-blue-500 shadow-lg ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    data-testid="template-card"
                  >
                    {/* Template Card Header */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              isFavorite ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              #{template.template_number}
                            </span>
                            {template.popularity_score > 80 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Popular
                              </span>
                            )}
                          </div>
                          <h5 className="font-semibold text-slate-800 mb-2 line-clamp-2">
                            {template.display_name}
                          </h5>
                          <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                            {template.description}
                          </p>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(template.id);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            isFavorite 
                              ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50' 
                              : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                          }`}
                        >
                          {isFavorite ? (
                            <StarIconSolid className="h-5 w-5" />
                          ) : (
                            <StarIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      
                      {/* Template Metrics */}
                      <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <ClockIcon className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="text-xs text-gray-500">Est. Time</div>
                          <div className="text-sm font-medium text-gray-900">{estimatedTime}m</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <DocumentIcon className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="text-xs text-gray-500">Usage</div>
                          <div className="text-sm font-medium text-gray-900">{template.usage_count}</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <CheckCircleIcon className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="text-xs text-gray-500">Score</div>
                          <div className="text-sm font-medium text-gray-900">{template.popularity_score}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Template Card Footer */}
                    <div className="px-6 pb-6">
                      <button
                        onClick={() => handleTemplateSelect(template)}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                        }`}
                      >
                        {isSelected ? (
                          <span className="flex items-center justify-center space-x-2">
                            <CheckCircleIcon className="h-4 w-4" />
                            <span>Selected</span>
                          </span>
                        ) : (
                          <span className="flex items-center justify-center space-x-2">
                            <span>Select Template</span>
                            <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        )}
                      </button>
                    </div>
                    
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircleIcon className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!loading && filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Templates Found</h4>
              <p className="text-gray-500">
                {searchQuery 
                  ? `No templates found matching "${searchQuery}" in ${selectedCategory.display_name}`
                  : `No templates available in ${selectedCategory.display_name} category`
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected Template Display */}
      {selectedTemplate && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4" data-testid="selected-template">
          <h4 className="font-semibold text-blue-800 mb-2">Selected BSG Template</h4>
          <div className="text-sm text-blue-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div><strong>Category:</strong> {selectedTemplate.category_display_name}</div>
              <div><strong>Template #:</strong> {selectedTemplate.template_number}</div>
              <div className="sm:col-span-2"><strong>Type:</strong> {selectedTemplate.name}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BSGTemplateSelector;