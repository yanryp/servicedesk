// src/components/CategorySelector.tsx
import React, { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Category, SubCategory, Item } from '../types';
import { categoriesService } from '../services/categories';

interface CategorySelectorProps {
  onItemSelect: (item: Item | null) => void;
  selectedItemId?: number;
  disabled?: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  onItemSelect, 
  selectedItemId,
  disabled = false 
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  const [loading, setLoading] = useState({
    categories: true,
    subCategories: false,
    items: false,
  });

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(prev => ({ ...prev, categories: true }));
        const categoriesData = await categoriesService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(prev => ({ ...prev, categories: false }));
      }
    };

    loadCategories();
  }, []);

  // Load subcategories when category is selected
  useEffect(() => {
    if (selectedCategoryId) {
      const loadSubCategories = async () => {
        try {
          setLoading(prev => ({ ...prev, subCategories: true }));
          const subCategoriesData = await categoriesService.getSubCategories(selectedCategoryId);
          setSubCategories(subCategoriesData);
          setItems([]);
          setSelectedSubCategoryId(null);
          setSelectedItem(null);
          onItemSelect(null);
        } catch (error) {
          console.error('Failed to load subcategories:', error);
        } finally {
          setLoading(prev => ({ ...prev, subCategories: false }));
        }
      };

      loadSubCategories();
    } else {
      setSubCategories([]);
      setItems([]);
      setSelectedSubCategoryId(null);
      setSelectedItem(null);
      onItemSelect(null);
    }
  }, [selectedCategoryId]); // Remove onItemSelect from dependencies

  // Load items when subcategory is selected
  useEffect(() => {
    if (selectedSubCategoryId) {
      const loadItems = async () => {
        try {
          setLoading(prev => ({ ...prev, items: true }));
          const itemsData = await categoriesService.getItemsBySubCategory(selectedSubCategoryId);
          setItems(itemsData);
          setSelectedItem(null);
          onItemSelect(null);
        } catch (error) {
          console.error('Failed to load items:', error);
        } finally {
          setLoading(prev => ({ ...prev, items: false }));
        }
      };

      loadItems();
    } else {
      setItems([]);
      setSelectedItem(null);
      onItemSelect(null);
    }
  }, [selectedSubCategoryId]); // Remove onItemSelect from dependencies

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value ? parseInt(e.target.value) : null;
    setSelectedCategoryId(categoryId);
  };

  const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subCategoryId = e.target.value ? parseInt(e.target.value) : null;
    setSelectedSubCategoryId(subCategoryId);
  };

  const handleItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const itemId = e.target.value ? parseInt(e.target.value) : null;
    const item = items.find(i => i.id === itemId) || null;
    setSelectedItem(item);
    onItemSelect(item);
  };

  return (
    <div className="space-y-4">
      {/* Category Selection */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Category *
        </label>
        <div className="relative">
          <select
            id="category"
            value={selectedCategoryId || ''}
            onChange={handleCategoryChange}
            disabled={disabled || loading.categories}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {loading.categories ? 'Loading categories...' : 'Select a category'}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Subcategory Selection */}
      <div>
        <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-2">
          Subcategory *
        </label>
        <div className="relative">
          <select
            id="subcategory"
            value={selectedSubCategoryId || ''}
            onChange={handleSubCategoryChange}
            disabled={disabled || !selectedCategoryId || loading.subCategories}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {loading.subCategories ? 'Loading subcategories...' : 
               !selectedCategoryId ? 'Select a category first' : 
               'Select a subcategory'}
            </option>
            {subCategories.map((subCategory) => (
              <option key={subCategory.id} value={subCategory.id}>
                {subCategory.name}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Item Selection */}
      <div>
        <label htmlFor="item" className="block text-sm font-medium text-gray-700 mb-2">
          Item *
        </label>
        <div className="relative">
          <select
            id="item"
            value={selectedItem?.id || ''}
            onChange={handleItemChange}
            disabled={disabled || !selectedSubCategoryId || loading.items}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {loading.items ? 'Loading items...' : 
               !selectedSubCategoryId ? 'Select a subcategory first' : 
               items.length === 0 ? 'No items available' :
               `Select an item (${items.length} available)`}
            </option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Selected Path Display */}
      {selectedItem && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="space-y-3">
            <p className="text-sm font-medium text-blue-800">Selected Category Path</p>
            
            <div className="flex items-center space-x-2 text-sm">
              <span className="px-3 py-1 bg-blue-100 rounded-lg font-medium text-blue-800">
                {categories.find(c => c.id === selectedCategoryId)?.name}
              </span>
              <span className="text-blue-600">→</span>
              <span className="px-3 py-1 bg-blue-100 rounded-lg text-blue-700">
                {subCategories.find(sc => sc.id === selectedSubCategoryId)?.name}
              </span>
              <span className="text-blue-600">→</span>
              <span className="px-3 py-1 bg-blue-200 rounded-lg font-medium text-blue-800">
                {selectedItem.name}
              </span>
            </div>
            
            <div className="pt-2 border-t border-blue-200">
              {(() => {
                const selectedCategory = categories.find(c => c.id === selectedCategoryId);
                const departmentName = selectedCategory?.department_name || 'Unknown Supporting Group';
                const departmentType = selectedCategory?.department_type || 'internal';
                
                return (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-blue-700">
                      <span className="font-medium">Supporting Group:</span> {departmentName}
                    </p>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      departmentType === 'business' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      → Routes to {departmentName}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;