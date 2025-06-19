// src/components/TemplateSelector.tsx
import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { TicketTemplate, CustomFieldDefinition, Item } from '../types';
import { categoriesService, templatesService } from '../services';

interface TemplateSelectorProps {
  selectedItem: Item | null;
  onTemplateSelect: (template: TicketTemplate | null) => void;
  selectedTemplateId?: number;
  disabled?: boolean;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ 
  selectedItem, 
  onTemplateSelect, 
  selectedTemplateId,
  disabled = false 
}) => {
  const [templates, setTemplates] = useState<TicketTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TicketTemplate | null>(null);
  const [templateDetails, setTemplateDetails] = useState<TicketTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Load templates when item changes
  useEffect(() => {
    if (selectedItem) {
      const loadTemplates = async () => {
        try {
          setLoading(true);
          const templatesData = await categoriesService.getTemplatesByItem(selectedItem.id);
          setTemplates(templatesData);
          setSelectedTemplate(null);
          setTemplateDetails(null);
          onTemplateSelect(null);
        } catch (error) {
          console.error('Failed to load templates:', error);
        } finally {
          setLoading(false);
        }
      };

      loadTemplates();
    } else {
      setTemplates([]);
      setSelectedTemplate(null);
      setTemplateDetails(null);
      onTemplateSelect(null);
    }
  }, [selectedItem, onTemplateSelect]);

  // Load template details when template is selected
  useEffect(() => {
    if (selectedTemplate) {
      const loadTemplateDetails = async () => {
        try {
          setLoadingDetails(true);
          const templateData = await templatesService.getTemplate(selectedTemplate.id);
          setTemplateDetails(templateData);
          onTemplateSelect(templateData);
        } catch (error) {
          console.error('Failed to load template details:', error);
        } finally {
          setLoadingDetails(false);
        }
      };

      loadTemplateDetails();
    } else {
      setTemplateDetails(null);
      onTemplateSelect(null);
    }
  }, [selectedTemplate, onTemplateSelect]);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value ? parseInt(e.target.value) : null;
    const template = templates.find(t => t.id === templateId) || null;
    setSelectedTemplate(template);
  };

  const getFieldTypeDisplay = (fieldType: string) => {
    const typeMap: Record<string, string> = {
      text: 'Text Input',
      number: 'Number',
      date: 'Date',
      dropdown: 'Dropdown',
      radio: 'Radio Button',
      checkbox: 'Checkbox',
    };
    return typeMap[fieldType] || fieldType;
  };

  return (
    <div className="space-y-4">
      {/* Template Selection */}
      <div>
        <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
          Template
        </label>
        <div className="relative">
          <select
            id="template"
            value={selectedTemplate?.id || ''}
            onChange={handleTemplateChange}
            disabled={disabled || !selectedItem || loading}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {loading ? 'Loading templates...' : 
               !selectedItem ? 'Select an item first' : 
               'Select a template (optional)'}
            </option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
        {!selectedItem && (
          <p className="mt-1 text-sm text-gray-500">
            Templates will be available after selecting an item
          </p>
        )}
      </div>

      {/* Template Details */}
      {loadingDetails && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      )}

      {templateDetails && !loadingDetails && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start space-x-2">
            <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900">{templateDetails.name}</h4>
              {templateDetails.description && (
                <p className="text-sm text-blue-700 mt-1">{templateDetails.description}</p>
              )}
              
              {templateDetails.customFields && templateDetails.customFields.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-blue-900 mb-2">
                    Required Fields ({templateDetails.customFields.length}):
                  </h5>
                  <div className="space-y-2">
                    {templateDetails.customFields.map((field: CustomFieldDefinition) => (
                      <div key={field.id} className="flex items-center justify-between text-sm">
                        <span className="text-blue-800">
                          {field.fieldLabel || field.fieldName}
                          {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                        </span>
                        <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded text-xs">
                          {getFieldTypeDisplay(field.fieldType)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {(!templateDetails.customFields || templateDetails.customFields.length === 0) && (
                <p className="text-sm text-blue-700 mt-2">
                  This template has no custom fields.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No Templates Available */}
      {selectedItem && templates.length === 0 && !loading && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center space-x-2">
            <InformationCircleIcon className="h-5 w-5 text-yellow-500" />
            <p className="text-sm text-yellow-700">
              No templates are available for the selected item. You can still create a ticket without a template.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;