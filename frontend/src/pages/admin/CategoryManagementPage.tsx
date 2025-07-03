import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  FolderIcon,
  TrashIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { knowledgeBaseService, KnowledgeCategory } from '../../services/knowledgeBase';
import { LoadingSpinner } from '../../components/ui';
import toast from 'react-hot-toast';

interface CategoryFormData {
  name: string;
  description: string;
  parentId: string;
  icon: string;
  color: string;
  sortOrder: number;
}

const CategoryManagementPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<KnowledgeCategory | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parentId: '',
    icon: '',
    color: '#3B82F6',
    sortOrder: 0
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await knowledgeBaseService.getCategories();
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sortOrder' ? parseInt(value) || 0 : value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    }

    if (formData.name.trim().length < 2) {
      errors.name = 'Category name must be at least 2 characters';
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parentId: '',
      icon: '',
      color: '#3B82F6',
      sortOrder: 0
    });
    setFormErrors({});
    setEditingCategory(null);
  };

  const handleCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (category: KnowledgeCategory) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId?.toString() || '',
      icon: category.icon || '',
      color: category.color || '#3B82F6',
      sortOrder: category.sortOrder
    });
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        parentId: formData.parentId ? parseInt(formData.parentId) : undefined,
        icon: formData.icon.trim() || undefined,
        color: formData.color,
        sortOrder: formData.sortOrder
      };

      if (editingCategory) {
        // Note: Update functionality would need to be implemented in the backend
        toast.error('Category editing not yet implemented in backend');
      } else {
        await knowledgeBaseService.createCategory(categoryData);
        toast.success('Category created successfully');
      }

      setShowForm(false);
      resetForm();
      loadCategories();
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast.error(error.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  const buildCategoryTree = (categories: KnowledgeCategory[], parentId: number | null = null): KnowledgeCategory[] => {
    return categories
      .filter(cat => cat.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(cat => ({
        ...cat,
        children: buildCategoryTree(categories, cat.id) as KnowledgeCategory[]
      }));
  };

  const renderCategoryTree = (categories: KnowledgeCategory[], level: number = 0) => {
    return categories.map(category => (
      <div key={category.id}>
        <div 
          className={`flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 ${
            level > 0 ? 'ml-8 border-l-2 border-gray-200 dark:border-gray-700' : ''
          }`}
        >
          <div className="flex items-center flex-1">
            <div 
              className="w-4 h-4 rounded mr-3"
              style={{ backgroundColor: category.color || '#3B82F6' }}
            />
            <FolderIcon className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {category.description}
                </p>
              )}
              <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span>
                  {category._count?.articles || 0} articles
                </span>
                {category.icon && (
                  <span className="ml-4">
                    Icon: {category.icon}
                  </span>
                )}
                <span className="ml-4">
                  Sort: {category.sortOrder}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEdit(category)}
              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              title="Edit Category"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            {/* Note: Delete functionality would need backend implementation */}
            <button
              onClick={() => toast.error('Delete functionality not yet implemented')}
              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              title="Delete Category"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {category.children && category.children.length > 0 && (
          <div>
            {renderCategoryTree(category.children as KnowledgeCategory[], level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const rootCategories = buildCategoryTree(categories);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/knowledge-base/admin')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <FolderIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Category Management</h1>
            </div>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Category
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Categories List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
              {rootCategories.length === 0 ? (
                <div className="text-center py-12">
                  <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No categories</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Get started by creating a new category.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={handleCreate}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      New Category
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {renderCategoryTree(rootCategories)}
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white ${
                        formErrors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Category name"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white ${
                        formErrors.description ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Category description"
                    />
                    {formErrors.description && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.description}</p>
                    )}
                  </div>

                  {/* Parent Category */}
                  <div>
                    <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Parent Category
                    </label>
                    <select
                      id="parentId"
                      name="parentId"
                      value={formData.parentId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">No Parent (Root Category)</option>
                      {categories
                        .filter(cat => editingCategory ? cat.id !== editingCategory.id : true)
                        .map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Icon */}
                  <div>
                    <label htmlFor="icon" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Icon
                    </label>
                    <input
                      type="text"
                      id="icon"
                      name="icon"
                      value={formData.icon}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Icon name or emoji"
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Color
                    </label>
                    <div className="mt-1 flex items-center space-x-2">
                      <input
                        type="color"
                        id="color"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="h-10 w-16 border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      id="sortOrder"
                      name="sortOrder"
                      value={formData.sortOrder}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="0"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <LoadingSpinner size="xs" className="mr-2" />
                      ) : null}
                      {editingCategory ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManagementPage;