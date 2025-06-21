// src/components/TicketCategorization.tsx
import React, { useState, useEffect } from 'react';
import {
  Ticket,
  RootCauseType,
  IssueCategoryType,
  CategorizationOption,
  CategorizationSuggestion
} from '../types';
import { categorizationService } from '../services/categorization';

interface TicketCategorizationProps {
  ticket: Ticket;
  onUpdate?: (updatedTicket: Ticket) => void;
  currentUserRole?: string;
  isCurrentUserCreator?: boolean;
  canEdit?: boolean;
}

const TicketCategorization: React.FC<TicketCategorizationProps> = ({
  ticket,
  onUpdate,
  currentUserRole,
  isCurrentUserCreator,
  canEdit = true
}) => {
  const [rootCause, setRootCause] = useState<RootCauseType | ''>('');
  const [issueCategory, setIssueCategory] = useState<IssueCategoryType | ''>('');
  const [overrideReason, setOverrideReason] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CategorizationSuggestion | null>(null);
  const [options, setOptions] = useState<{
    issueCategories: CategorizationOption[];
    rootCauses: CategorizationOption[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load suggestions when component mounts
  useEffect(() => {
    if (ticket.itemId && showSuggestions) {
      loadSuggestions();
    }
  }, [ticket.itemId, showSuggestions]);

  // Initialize form with existing values
  useEffect(() => {
    if (isCurrentUserCreator || currentUserRole === 'user') {
      setRootCause(ticket.userRootCause || '');
      setIssueCategory(ticket.userIssueCategory || '');
    } else if (currentUserRole === 'technician' || currentUserRole === 'manager' || currentUserRole === 'admin') {
      setRootCause(ticket.techRootCause || ticket.userRootCause || '');
      setIssueCategory(ticket.techIssueCategory || ticket.userIssueCategory || '');
    }
  }, [ticket, currentUserRole, isCurrentUserCreator]);

  const loadSuggestions = async () => {
    if (!ticket.itemId) return;
    
    try {
      const data = await categorizationService.getSuggestions(ticket.itemId);
      setSuggestions(data.suggestions);
      setOptions(data.options);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootCause && !issueCategory) return;

    setLoading(true);
    setError(null);

    try {
      const isTechnician = ['technician', 'manager', 'admin'].includes(currentUserRole || '');
      const isOverride = (
        (ticket.userRootCause && rootCause && ticket.userRootCause !== rootCause) ||
        (ticket.userIssueCategory && issueCategory && ticket.userIssueCategory !== issueCategory)
      );

      const requestData: any = {};
      if (rootCause) requestData.rootCause = rootCause;
      if (issueCategory) requestData.issueCategory = issueCategory;
      if (reason) requestData.reason = reason;
      if (isTechnician && isOverride && overrideReason) {
        requestData.overrideReason = overrideReason;
      }

      const result = await categorizationService.updateCategorization(ticket.id, requestData);
      
      if (onUpdate) {
        onUpdate(result.ticket);
      }

      // Reset override reason after successful submission
      setOverrideReason('');
      setReason('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update categorization');
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = () => {
    if (suggestions) {
      setRootCause(suggestions.rootCause);
      setIssueCategory(suggestions.issueCategory);
    }
  };

  const canModify = canEdit && !ticket.isClassificationLocked;
  const isTechnician = ['technician', 'manager', 'admin'].includes(currentUserRole || '');
  const shouldShowOverrideField = isTechnician && (
    (ticket.userRootCause && rootCause && ticket.userRootCause !== rootCause) ||
    (ticket.userIssueCategory && issueCategory && ticket.userIssueCategory !== issueCategory)
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Ticket Classification</h3>
        {ticket.itemId && (
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showSuggestions ? 'Hide' : 'Show'} Suggestions
          </button>
        )}
      </div>

      {/* Current Classification Status */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Root Cause: </span>
            <span className={`${ticket.confirmedRootCause ? 'text-green-600' : 'text-gray-500'}`}>
              {ticket.confirmedRootCause || 'Not classified'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Issue Category: </span>
            <span className={`${ticket.confirmedIssueCategory ? 'text-green-600' : 'text-gray-500'}`}>
              {ticket.confirmedIssueCategory || 'Not classified'}
            </span>
          </div>
        </div>
        
        {ticket.isClassificationLocked && (
          <div className="mt-2 text-sm text-orange-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Classification is locked and cannot be modified
          </div>
        )}
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions && options && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">AI Suggestions</h4>
          <div className="text-sm text-blue-800 mb-3">
            <div>Suggested Root Cause: <strong>{suggestions.rootCause.replace('_', ' ')}</strong></div>
            <div>Suggested Category: <strong>{suggestions.issueCategory}</strong></div>
            <div>Confidence: <strong>{suggestions.confidence}</strong></div>
          </div>
          <button
            type="button"
            onClick={applySuggestion}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Apply Suggestions
          </button>
        </div>
      )}

      {/* Classification Form */}
      {canModify && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Root Cause */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Root Cause
              </label>
              <select
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value as RootCauseType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select root cause...</option>
                <option value="human_error">User/Process Error</option>
                <option value="system_error">Technical/System Error</option>
                <option value="external_factor">External Issue</option>
                <option value="undetermined">Needs Investigation</option>
              </select>
            </div>

            {/* Issue Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Category
              </label>
              <select
                value={issueCategory}
                onChange={(e) => setIssueCategory(e.target.value as IssueCategoryType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category...</option>
                <option value="request">Service Request</option>
                <option value="complaint">Service Complaint</option>
                <option value="problem">Technical Problem</option>
              </select>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain your classification choice..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Override Reason (for technicians) */}
          {shouldShowOverrideField && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Override Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Explain why you're changing the user's classification..."
                rows={2}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Required when changing user classifications
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || (!rootCause && !issueCategory)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Classification'}
            </button>
          </div>
        </form>
      )}

      {/* Classification History */}
      {(ticket.userCategorizedAt || ticket.techCategorizedAt) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Classification History</h4>
          <div className="space-y-2 text-sm">
            {ticket.userCategorizedAt && (
              <div className="text-gray-600">
                User classified: {ticket.userRootCause} / {ticket.userIssueCategory} 
                <span className="text-gray-400 ml-2">
                  {new Date(ticket.userCategorizedAt).toLocaleString()}
                </span>
              </div>
            )}
            {ticket.techCategorizedAt && (
              <div className="text-gray-600">
                Technician classified: {ticket.techRootCause} / {ticket.techIssueCategory}
                <span className="text-gray-400 ml-2">
                  {new Date(ticket.techCategorizedAt).toLocaleString()}
                </span>
                {ticket.techOverrideReason && (
                  <div className="text-xs text-gray-500 mt-1 pl-4">
                    Override reason: {ticket.techOverrideReason}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketCategorization;