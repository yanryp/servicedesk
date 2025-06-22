// BSG Template Selection Component
import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon as SearchIcon, BuildingOffice2Icon as BuildingOfficeIcon, CubeIcon } from '@heroicons/react/24/outline';

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
    onTemplateSelect(null); // Clear template selection when category changes
  };

  const handleTemplateSelect = (template: BSGTemplate) => {
    onTemplateSelect(template);
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName) {
      case 'OLIBS':
        return <BuildingOfficeIcon className="h-5 w-5" />;
      case 'KLAIM':
        return <CubeIcon className="h-5 w-5" />;
      default:
        return <CubeIcon className="h-5 w-5" />;
    }
  };

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
      {/* Category Selection */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          🏦 BSG Banking System Templates
        </h3>
        
        {loading && categories.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading template categories...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category)}
                className={`p-4 text-left border-2 rounded-xl transition-all duration-200 hover:shadow-md ${
                  selectedCategory?.id === category.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                data-testid="template-category"
              >
                <div className="flex items-center space-x-3 mb-2">
                  {getCategoryIcon(category.name)}
                  <div className="font-medium text-slate-800">{category.display_name}</div>
                </div>
                <div className="text-sm text-gray-600 mb-2">{category.description}</div>
                <div className="text-xs text-blue-600 font-medium">
                  {category.template_count} template{category.template_count !== 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Template Selection */}
      {selectedCategory && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-slate-800">
              {selectedCategory.display_name} Templates
            </h4>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading templates...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-4 text-left border-2 rounded-xl transition-all duration-200 hover:shadow-md ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  data-testid="template-card"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-slate-800">{template.display_name}</div>
                    <div className="text-xs text-blue-600 font-medium">#{template.template_number}</div>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">{template.description}</div>
                  <div className="flex justify-between items-center text-xs">
                    <div className="text-gray-500">Used {template.usage_count} times</div>
                    <div className="text-green-600 font-medium">Score: {template.popularity_score}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && templates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? `No templates found for "${searchQuery}"` : 'No templates available in this category'}
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