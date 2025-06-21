// src/components/BulkCategorizationModal.tsx
import React, { useState } from 'react';
import { categorizationService } from '../services/categorization';
import { RootCauseType, IssueCategoryType, BulkCategorizationRequest } from '../types';

interface BulkCategorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTicketIds: number[];
  onSuccess: () => void;
}

const BulkCategorizationModal: React.FC<BulkCategorizationModalProps> = ({
  isOpen,
  onClose,
  selectedTicketIds,
  onSuccess
}) => {
  const [rootCause, setRootCause] = useState<RootCauseType>('human_error');
  const [issueCategory, setIssueCategory] = useState<IssueCategoryType>('request');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError('Reason is required for bulk categorization');
      return;
    }

    if (selectedTicketIds.length === 0) {
      setError('No tickets selected for categorization');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: BulkCategorizationRequest = {
        ticketIds: selectedTicketIds,
        rootCause,
        issueCategory,
        reason: reason.trim()
      };

      const result = await categorizationService.bulkCategorization(request);
      
      // Show success message
      alert(`Successfully categorized ${result.processedTickets} tickets${
        result.skippedTickets > 0 ? `. ${result.skippedTickets} tickets were skipped.` : ''
      }`);
      
      onSuccess();
      onClose();
      
      // Reset form
      setReason('');
      setError(null);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to perform bulk categorization');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setReason('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Bulk Ticket Categorization
            </h3>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>{selectedTicketIds.length}</strong> ticket{selectedTicketIds.length !== 1 ? 's' : ''} selected for categorization
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Root Cause */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Root Cause <span className="text-red-500">*</span>
              </label>
              <select
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value as RootCauseType)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="human_error">User/Process Error</option>
                <option value="system_error">Technical/System Error</option>
                <option value="external_factor">External Issue</option>
                <option value="undetermined">Needs Investigation</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Classification of what caused the issue
              </p>
            </div>

            {/* Issue Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Category <span className="text-red-500">*</span>
              </label>
              <select
                value={issueCategory}
                onChange={(e) => setIssueCategory(e.target.value as IssueCategoryType)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="request">Service Request</option>
                <option value="complaint">Service Complaint</option>
                <option value="problem">Technical Problem</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Type of issue being reported
              </p>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categorization Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the reason for this bulk categorization..."
                rows={3}
                required
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-xs text-gray-500 mt-1 flex justify-between">
                <span>Required for audit trail and transparency</span>
                <span>{reason.length}/500</span>
              </div>
            </div>

            {/* Warning */}
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Important:</p>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>This will categorize all selected tickets with the same values</li>
                    <li>Existing user categorizations may be overridden</li>
                    <li>This action is logged for audit purposes</li>
                    <li>Locked tickets will be skipped</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !reason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Categorizing...
                  </div>
                ) : (
                  `Categorize ${selectedTicketIds.length} Ticket${selectedTicketIds.length !== 1 ? 's' : ''}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BulkCategorizationModal;