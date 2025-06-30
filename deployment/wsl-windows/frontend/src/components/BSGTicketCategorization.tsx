// src/components/BSGTicketCategorization.tsx
import React, { useState, useEffect } from 'react';
import { 
  RootCauseType, 
  IssueCategoryType, 
  CategorizationSuggestion,
  CategorizationRequest 
} from '../types';
import { useI18n, I18nService } from '../services';

interface BSGTicketCategorizationProps {
  ticketId?: number;
  title?: string;
  description?: string;
  initialUserRootCause?: RootCauseType;
  initialUserIssueCategory?: IssueCategoryType;
  onSubmit: (categorization: CategorizationRequest) => void;
  isLocked?: boolean;
  showTechnicianOverride?: boolean;
  className?: string;
}

const BSGTicketCategorization: React.FC<BSGTicketCategorizationProps> = ({
  ticketId,
  title = '',
  description = '',
  initialUserRootCause,
  initialUserIssueCategory,
  onSubmit,
  isLocked = false,
  showTechnicianOverride = false,
  className = ''
}) => {
  const { t } = useI18n();
  const [rootCause, setRootCause] = useState<RootCauseType | ''>(initialUserRootCause || '');
  const [issueCategory, setIssueCategory] = useState<IssueCategoryType | ''>(initialUserIssueCategory || '');
  const [reason, setReason] = useState<string>('');
  const [suggestion, setSuggestion] = useState<CategorizationSuggestion | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // BSG-specific categorization options with Indonesian translations
  const rootCauseOptions = [
    {
      value: 'human_error' as RootCauseType,
      labelEn: 'Human Error',
      labelId: 'Kesalahan Manusia',
      descriptionEn: 'Error caused by user action or operator mistake',
      descriptionId: 'Kesalahan yang disebabkan oleh tindakan pengguna atau operator'
    },
    {
      value: 'system_error' as RootCauseType,
      labelEn: 'System Error',
      labelId: 'Kesalahan Sistem',
      descriptionEn: 'Technical malfunction in banking systems (OLIBs, ATM, etc.)',
      descriptionId: 'Kerusakan teknis pada sistem perbankan (OLIBs, ATM, dll.)'
    },
    {
      value: 'external_factor' as RootCauseType,
      labelEn: 'External Factor',
      labelId: 'Faktor Eksternal',
      descriptionEn: 'Issues caused by external systems, network, or third parties',
      descriptionId: 'Masalah yang disebabkan oleh sistem eksternal, jaringan, atau pihak ketiga'
    },
    {
      value: 'undetermined' as RootCauseType,
      labelEn: 'Undetermined',
      labelId: 'Belum Ditentukan',
      descriptionEn: 'Root cause requires further investigation',
      descriptionId: 'Penyebab utama memerlukan investigasi lebih lanjut'
    }
  ];

  const issueCategoryOptions = [
    {
      value: 'request' as IssueCategoryType,
      labelEn: 'Service Request',
      labelId: 'Permintaan Layanan',
      descriptionEn: 'Request for new service, information, or assistance',
      descriptionId: 'Permintaan layanan baru, informasi, atau bantuan'
    },
    {
      value: 'complaint' as IssueCategoryType,
      labelEn: 'Complaint',
      labelId: 'Keluhan',
      descriptionEn: 'Customer dissatisfaction or service quality issue',
      descriptionId: 'Ketidakpuasan nasabah atau masalah kualitas layanan'
    },
    {
      value: 'problem' as IssueCategoryType,
      labelEn: 'Problem/Incident',
      labelId: 'Masalah/Insiden',
      descriptionEn: 'Technical problem or system incident affecting operations',
      descriptionId: 'Masalah teknis atau insiden sistem yang mempengaruhi operasi'
    }
  ];

  // Analyze ticket content for categorization suggestion
  useEffect(() => {
    if (title || description) {
      analyzeTicketContent();
    }
  }, [title, description]);

  const analyzeTicketContent = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simple keyword-based analysis for BSG banking context
      const content = `${title} ${description}`.toLowerCase();
      
      let suggestedRootCause: RootCauseType = 'undetermined';
      let suggestedIssueCategory: IssueCategoryType = 'request';
      let confidence: 'low' | 'medium' | 'high' = 'low';

      // Banking system keywords for root cause analysis
      if (content.includes('olibs') || content.includes('core banking') || 
          content.includes('system down') || content.includes('error') ||
          content.includes('tidak bisa login') || content.includes('hang')) {
        suggestedRootCause = 'system_error';
        confidence = 'high';
      } else if (content.includes('salah') || content.includes('keliru') ||
                 content.includes('wrong') || content.includes('mistake') ||
                 content.includes('lupa password') || content.includes('forgot')) {
        suggestedRootCause = 'human_error';
        confidence = 'medium';
      } else if (content.includes('network') || content.includes('internet') ||
                 content.includes('koneksi') || content.includes('jaringan') ||
                 content.includes('timeout') || content.includes('slow')) {
        suggestedRootCause = 'external_factor';
        confidence = 'medium';
      }

      // Issue category analysis
      if (content.includes('request') || content.includes('minta') ||
          content.includes('butuh') || content.includes('need') ||
          content.includes('tolong') || content.includes('help')) {
        suggestedIssueCategory = 'request';
        confidence = confidence === 'high' ? 'high' : 'medium';
      } else if (content.includes('complaint') || content.includes('keluhan') ||
                 content.includes('kecewa') || content.includes('disappointed') ||
                 content.includes('lambat') || content.includes('slow')) {
        suggestedIssueCategory = 'complaint';
        confidence = confidence === 'high' ? 'high' : 'medium';
      } else if (content.includes('problem') || content.includes('masalah') ||
                 content.includes('issue') || content.includes('trouble') ||
                 content.includes('error') || content.includes('down')) {
        suggestedIssueCategory = 'problem';
        confidence = 'high';
      }

      setSuggestion({
        rootCause: suggestedRootCause,
        issueCategory: suggestedIssueCategory,
        confidence
      });
    } catch (error) {
      console.error('Failed to analyze ticket content:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rootCause || !issueCategory) {
      return;
    }

    onSubmit({
      rootCause: rootCause as RootCauseType,
      issueCategory: issueCategory as IssueCategoryType,
      reason: reason.trim() || undefined,
      overrideReason: showTechnicianOverride ? reason : undefined
    });
  };

  const applySuggestion = () => {
    if (suggestion) {
      setRootCause(suggestion.rootCause);
      setIssueCategory(suggestion.issueCategory);
    }
  };

  const getOptionLabel = (option: any) => {
    return I18nService.getCurrentLanguage() === 'id' ? option.labelId : option.labelEn;
  };

  const getOptionDescription = (option: any) => {
    return I18nService.getCurrentLanguage() === 'id' ? option.descriptionId : option.descriptionEn;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {t('ticket.categorization.title')}
        </h3>
        {isLocked && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            {t('ticket.categorization.locked')}
          </span>
        )}
      </div>

      {/* AI Suggestion */}
      {suggestion && !isLocked && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                🤖 {t('categorization.ai.suggestion')}
              </h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>
                  <strong>{t('categorization.root.cause')}:</strong>{' '}
                  {getOptionLabel(rootCauseOptions.find(opt => opt.value === suggestion.rootCause))}
                </p>
                <p>
                  <strong>{t('categorization.issue.category')}:</strong>{' '}
                  {getOptionLabel(issueCategoryOptions.find(opt => opt.value === suggestion.issueCategory))}
                </p>
                <p className="text-xs">
                  {t('categorization.confidence')}: {suggestion.confidence === 'high' ? '🟢' : suggestion.confidence === 'medium' ? '🟡' : '🔴'} 
                  {t(`categorization.confidence.${suggestion.confidence}`)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={applySuggestion}
              className="ml-4 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
            >
              {t('categorization.apply.suggestion')}
            </button>
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className="mb-4 text-center text-sm text-gray-500">
          <div className="inline-flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('categorization.analyzing')}...
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Root Cause Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('categorization.root.cause')}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rootCauseOptions.map((option) => (
              <label
                key={option.value}
                className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  rootCause === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="rootCause"
                    value={option.value}
                    checked={rootCause === option.value}
                    onChange={(e) => setRootCause(e.target.value as RootCauseType)}
                    disabled={isLocked}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {getOptionLabel(option)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500 ml-7">
                  {getOptionDescription(option)}
                </p>
              </label>
            ))}
          </div>
        </div>

        {/* Issue Category Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('categorization.issue.category')}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {issueCategoryOptions.map((option) => (
              <label
                key={option.value}
                className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  issueCategory === option.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="issueCategory"
                    value={option.value}
                    checked={issueCategory === option.value}
                    onChange={(e) => setIssueCategory(e.target.value as IssueCategoryType)}
                    disabled={isLocked}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {getOptionLabel(option)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500 ml-7">
                  {getOptionDescription(option)}
                </p>
              </label>
            ))}
          </div>
        </div>

        {/* Reason/Override Reason */}
        {(showTechnicianOverride || rootCause || issueCategory) && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {showTechnicianOverride 
                ? t('categorization.override.reason')
                : t('categorization.reason')
              }
              {showTechnicianOverride && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                showTechnicianOverride
                  ? t('categorization.override.reason.placeholder')
                  : t('categorization.reason.placeholder')
              }
              disabled={isLocked}
              rows={3}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isLocked ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
          </div>
        )}

        {/* Submit Button */}
        {!isLocked && (
          <div className="flex justify-end space-x-3">
            <button
              type="submit"
              disabled={!rootCause || !issueCategory || (showTechnicianOverride && !reason.trim())}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                !rootCause || !issueCategory || (showTechnicianOverride && !reason.trim())
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }`}
            >
              {showTechnicianOverride 
                ? t('categorization.override.submit')
                : t('categorization.submit')
              }
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default BSGTicketCategorization;