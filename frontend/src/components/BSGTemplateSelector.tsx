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

  // Mock data for development (replace with real API calls)
  const mockCategories: BSGTemplateCategory[] = [
    { id: 1, name: 'OLIBS', display_name: 'OLIBS Core Banking', template_count: 5, description: 'Online Banking System templates' },
    { id: 2, name: 'KLAIM', display_name: 'Transaction Claims', template_count: 2, description: 'Transaction claim and dispute templates' },
    { id: 3, name: 'XCARD', display_name: 'XCARD Management', template_count: 2, description: 'XCARD system user management' },
    { id: 4, name: 'TellerApp/Reporting', display_name: 'Teller Applications', template_count: 2, description: 'Teller app and reporting systems' },
    { id: 5, name: 'BSG QRIS', display_name: 'BSG QRIS', template_count: 3, description: 'QRIS payment system templates' },
    { id: 6, name: 'BSGTouch', display_name: 'BSGTouch Mobile', template_count: 4, description: 'Mobile banking application' },
    { id: 7, name: 'ATM', display_name: 'ATM Technical Support', template_count: 1, description: 'ATM technical issues and maintenance' },
    { id: 8, name: 'SMS BANKING', display_name: 'SMS Banking', template_count: 4, description: 'SMS banking service templates' },
    { id: 9, name: 'Permintaan Perpanjangan operasional', display_name: 'Operational Extensions', template_count: 1, description: 'Branch operational hour extensions' }
  ];

  const mockTemplates: { [key: number]: BSGTemplate[] } = {
    1: [ // OLIBS
      { id: 1, template_number: 1, name: 'Perubahan Menu & Limit Transaksi', display_name: 'Perubahan Menu & Limit Transaksi', description: 'Permintaan perubahan menu dan limit transaksi untuk user OLIBS', popularity_score: 95, usage_count: 45, category_name: 'OLIBS', category_display_name: 'OLIBS Core Banking' },
      { id: 2, template_number: 2, name: 'Mutasi User Pegawai', display_name: 'Mutasi User Pegawai', description: 'Mutasi pegawai antar cabang dengan perubahan wewenang OLIBS', popularity_score: 80, usage_count: 32, category_name: 'OLIBS', category_display_name: 'OLIBS Core Banking' },
      { id: 3, template_number: 3, name: 'Pendaftaran User Baru', display_name: 'Pendaftaran User Baru', description: 'Pendaftaran user baru OLIBS untuk cabang/capem', popularity_score: 90, usage_count: 38, category_name: 'OLIBS', category_display_name: 'OLIBS Core Banking' },
      { id: 4, template_number: 4, name: 'Non Aktif User', display_name: 'Non Aktif User', description: 'Penonaktifan user OLIBS yang sudah tidak aktif', popularity_score: 70, usage_count: 25, category_name: 'OLIBS', category_display_name: 'OLIBS Core Banking' },
      { id: 5, template_number: 5, name: 'Override Password', display_name: 'Override Password', description: 'Reset dan override password user OLIBS', popularity_score: 85, usage_count: 42, category_name: 'OLIBS', category_display_name: 'OLIBS Core Banking' }
    ],
    2: [ // KLAIM
      { id: 6, template_number: 6, name: 'BSGTouch – Transfer Antar Bank', display_name: 'BSGTouch – Transfer Antar Bank', description: 'Klaim transaksi transfer antar bank BSGTouch', popularity_score: 75, usage_count: 28, category_name: 'KLAIM', category_display_name: 'Transaction Claims' },
      { id: 7, template_number: 7, name: 'BSGTouch, BSGQRIS – Klaim Gagal Transaksi', display_name: 'BSGTouch, BSGQRIS – Klaim Gagal Transaksi', description: 'Klaim untuk transaksi gagal BSGTouch dan BSGQRIS', popularity_score: 80, usage_count: 35, category_name: 'KLAIM', category_display_name: 'Transaction Claims' }
    ],
    3: [ // XCARD
      { id: 8, template_number: 8, name: 'Buka Blokir dan Reset Password', display_name: 'Buka Blokir dan Reset Password', description: 'Pembukaan blokir dan reset password XCARD', popularity_score: 60, usage_count: 20, category_name: 'XCARD', category_display_name: 'XCARD Management' },
      { id: 9, template_number: 9, name: 'Pendaftaran User Baru', display_name: 'Pendaftaran User Baru', description: 'Pendaftaran user baru XCARD', popularity_score: 55, usage_count: 15, category_name: 'XCARD', category_display_name: 'XCARD Management' }
    ]
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadTemplates(selectedCategory.id);
    }
  }, [selectedCategory, searchQuery]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      // For now, use mock data
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error loading BSG categories:', error);
      setError('Failed to load template categories');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async (categoryId: number) => {
    try {
      setLoading(true);
      // For now, use mock data
      const categoryTemplates = mockTemplates[categoryId] || [];
      
      // Apply search filter
      const filteredTemplates = searchQuery 
        ? categoryTemplates.filter(template => 
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : categoryTemplates;
      
      setTemplates(filteredTemplates);
    } catch (error) {
      console.error('Error loading BSG templates:', error);
      setError('Failed to load templates');
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

  if (error) {
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
    <div className={`space-y-6 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Category Selection */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          🏦 BSG Banking System Templates
        </h3>
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <div className="mt-2 text-sm text-gray-500">Loading templates...</div>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No templates match your search' : 'No templates available'}
                </div>
              ) : (
                templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`w-full p-4 text-left border-2 rounded-xl transition-all duration-200 hover:shadow-md ${
                      selectedTemplate?.id === template.id
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            #{template.template_number}
                          </span>
                          <div className="font-medium text-slate-800">{template.name}</div>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">{template.description}</div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Popularity: {template.popularity_score}%</span>
                          <span>Used {template.usage_count} times</span>
                        </div>
                      </div>
                      {selectedTemplate?.id === template.id && (
                        <div className="ml-4 text-green-600">
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected Template Summary */}
      {selectedTemplate && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h5 className="font-semibold text-green-800 mb-2">✅ Selected Template</h5>
          <div className="text-sm">
            <div className="font-medium text-green-700">#{selectedTemplate.template_number} - {selectedTemplate.name}</div>
            <div className="text-green-600 mt-1">{selectedTemplate.description}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BSGTemplateSelector;