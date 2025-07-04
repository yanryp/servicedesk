// frontend/src/pages/customer/CustomerSatisfactionSurvey.tsx
import React, { useState, useEffect } from 'react';
import {
  StarIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  FaceSmileIcon,
  FaceFrownIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface SurveyTicket {
  id: number;
  ticketNumber: string;
  subject: string;
  resolvedAt: string;
  assignedTo: string;
  category: string;
  resolutionTime: string;
  alreadyRated: boolean;
}

interface SurveyResponse {
  ticketId: number;
  overallSatisfaction: number;
  resolutionSpeed: number;
  communicationQuality: number;
  technicalExpertise: number;
  wouldRecommend: boolean;
  comments: string;
  followUpNeeded: boolean;
}

const CustomerSatisfactionSurvey: React.FC = () => {
  const [eligibleTickets, setEligibleTickets] = useState<SurveyTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SurveyTicket | null>(null);
  const [surveyResponse, setSurveyResponse] = useState<SurveyResponse>({
    ticketId: 0,
    overallSatisfaction: 0,
    resolutionSpeed: 0,
    communicationQuality: 0,
    technicalExpertise: 0,
    wouldRecommend: false,
    comments: '',
    followUpNeeded: false
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadEligibleTickets();
  }, []);

  const loadEligibleTickets = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockTickets: SurveyTicket[] = [
        {
          id: 1,
          ticketNumber: 'BSG-2024-0001',
          subject: 'Password Reset Request',
          resolvedAt: '2024-07-03T16:30:00Z',
          assignedTo: 'Jakarta IT Team',
          category: 'Account Management',
          resolutionTime: '4 hours',
          alreadyRated: false
        },
        {
          id: 2,
          ticketNumber: 'BSG-2024-0002',
          subject: 'Email Configuration Issue',
          resolvedAt: '2024-07-02T14:45:00Z',
          assignedTo: 'Support Team Alpha',
          category: 'Email Support',
          resolutionTime: '2 hours',
          alreadyRated: false
        },
        {
          id: 3,
          ticketNumber: 'BSG-2024-0003',
          subject: 'Mobile Banking App Setup',
          resolvedAt: '2024-06-29T11:20:00Z',
          assignedTo: 'Customer Support',
          category: 'Mobile Banking',
          resolutionTime: '1.5 hours',
          alreadyRated: true
        }
      ];
      setEligibleTickets(mockTickets);
      setLoading(false);
    }, 1000);
  };

  const handleTicketSelection = (ticket: SurveyTicket) => {
    setSelectedTicket(ticket);
    setSurveyResponse(prev => ({ ...prev, ticketId: ticket.id }));
    setCurrentStep(2);
  };

  const handleRatingChange = (field: keyof SurveyResponse, value: number) => {
    setSurveyResponse(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate API submission
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 2000);
  };

  const renderStarRating = (
    value: number,
    onChange: (rating: number) => void,
    label: string
  ) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="focus:outline-none"
            >
              {star <= value ? (
                <StarIconSolid className="w-6 h-6 text-yellow-400" />
              ) : (
                <StarIcon className="w-6 h-6 text-gray-300 hover:text-yellow-400 transition-colors" />
              )}
            </button>
          ))}
          <span className="ml-2 text-sm text-slate-600">
            {value > 0 && (
              <>
                {value}/5 - {
                  value === 5 ? 'Excellent' :
                  value === 4 ? 'Good' :
                  value === 3 ? 'Average' :
                  value === 2 ? 'Below Average' :
                  'Poor'
                }
              </>
            )}
          </span>
        </div>
      </div>
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !submitted) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Thank You for Your Feedback!</h1>
          <p className="text-slate-600 mb-6">
            Your feedback helps us improve our services and provide better support to all BSG customers.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Survey ID:</strong> {selectedTicket?.ticketNumber}-SURVEY-{Date.now()}
            </p>
            <p className="text-sm text-blue-800">
              Your response has been recorded and will be reviewed by our quality assurance team.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => {
                setSubmitted(false);
                setSelectedTicket(null);
                setCurrentStep(1);
                setSurveyResponse({
                  ticketId: 0,
                  overallSatisfaction: 0,
                  resolutionSpeed: 0,
                  communicationQuality: 0,
                  technicalExpertise: 0,
                  wouldRecommend: false,
                  comments: '',
                  followUpNeeded: false
                });
                loadEligibleTickets();
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
            >
              Rate Another Ticket
            </button>
            <button
              onClick={() => window.location.href = '/customer'}
              className="w-full border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition-all duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Service Feedback</h1>
        <p className="text-slate-600 text-lg">Help us improve by rating your recent support experience</p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>
            1
          </div>
          <span className="text-sm font-medium">Select Ticket</span>
        </div>
        <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
        <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>
            2
          </div>
          <span className="text-sm font-medium">Rate Service</span>
        </div>
      </div>

      {/* Step 1: Select Ticket */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recently Resolved Tickets</h2>
            <p className="text-slate-600 mb-6">
              Select a ticket to provide feedback on the service you received.
            </p>

            {eligibleTickets.filter(t => !t.alreadyRated).length === 0 ? (
              <div className="text-center py-12">
                <FaceSmileIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No tickets available for rating</h3>
                <p className="text-slate-600">
                  You've already provided feedback for all your recent tickets, or you don't have any resolved tickets yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {eligibleTickets.filter(t => !t.alreadyRated).map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => handleTicketSelection(ticket)}
                    className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-slate-900">{ticket.subject}</h3>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                            Resolved
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-slate-600">
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">Ticket:</span>
                            <span>{ticket.ticketNumber}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="w-3 h-3" />
                            <span>Resolved in {ticket.resolutionTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <UserIcon className="w-3 h-3" />
                            <span>{ticket.assignedTo}</span>
                          </div>
                          <div>
                            <span>{formatDate(ticket.resolvedAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                          Rate This Service
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Already rated tickets */}
            {eligibleTickets.filter(t => t.alreadyRated).length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Already Rated</h3>
                <div className="space-y-3">
                  {eligibleTickets.filter(t => t.alreadyRated).map((ticket) => (
                    <div
                      key={ticket.id}
                      className="border border-slate-200 rounded-lg p-4 bg-slate-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-slate-900 mb-1">{ticket.subject}</h4>
                          <p className="text-sm text-slate-600">{ticket.ticketNumber} • {formatDate(ticket.resolvedAt)}</p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-green-600">
                          <CheckCircleIcon className="w-4 h-4" />
                          <span>Feedback submitted</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Rating Form */}
      {currentStep === 2 && selectedTicket && (
        <div className="space-y-6">
          {/* Ticket summary */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Rate Your Service Experience</h2>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">{selectedTicket.subject}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                <div>
                  <strong>Ticket:</strong> {selectedTicket.ticketNumber}
                </div>
                <div>
                  <strong>Resolved by:</strong> {selectedTicket.assignedTo}
                </div>
                <div>
                  <strong>Resolution time:</strong> {selectedTicket.resolutionTime}
                </div>
              </div>
            </div>

            {/* Rating questions */}
            <div className="space-y-6">
              {renderStarRating(
                surveyResponse.overallSatisfaction,
                (rating) => handleRatingChange('overallSatisfaction', rating),
                'Overall satisfaction with the service'
              )}

              {renderStarRating(
                surveyResponse.resolutionSpeed,
                (rating) => handleRatingChange('resolutionSpeed', rating),
                'How satisfied are you with the resolution speed?'
              )}

              {renderStarRating(
                surveyResponse.communicationQuality,
                (rating) => handleRatingChange('communicationQuality', rating),
                'How would you rate the communication quality?'
              )}

              {renderStarRating(
                surveyResponse.technicalExpertise,
                (rating) => handleRatingChange('technicalExpertise', rating),
                'How would you rate the technical expertise shown?'
              )}

              {/* Recommendation question */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Would you recommend BSG support services to others?
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setSurveyResponse(prev => ({ ...prev, wouldRecommend: true }))}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      surveyResponse.wouldRecommend
                        ? 'bg-green-100 text-green-800 border-2 border-green-300'
                        : 'bg-slate-100 text-slate-700 hover:bg-green-50'
                    }`}
                  >
                    <HandThumbUpIcon className="w-4 h-4" />
                    <span>Yes, I would recommend</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSurveyResponse(prev => ({ ...prev, wouldRecommend: false }))}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      !surveyResponse.wouldRecommend && surveyResponse.overallSatisfaction > 0
                        ? 'bg-red-100 text-red-800 border-2 border-red-300'
                        : 'bg-slate-100 text-slate-700 hover:bg-red-50'
                    }`}
                  >
                    <HandThumbDownIcon className="w-4 h-4" />
                    <span>No, I would not recommend</span>
                  </button>
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Additional comments (optional)
                </label>
                <textarea
                  value={surveyResponse.comments}
                  onChange={(e) => setSurveyResponse(prev => ({ ...prev, comments: e.target.value }))}
                  rows={4}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Please share any specific feedback about your experience, suggestions for improvement, or additional comments..."
                />
              </div>

              {/* Follow-up */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Follow-up needed?
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="followUp"
                    checked={surveyResponse.followUpNeeded}
                    onChange={(e) => setSurveyResponse(prev => ({ ...prev, followUpNeeded: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="followUp" className="text-sm text-slate-700">
                    I would like someone from BSG to follow up on my feedback
                  </label>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
              <button
                onClick={() => {
                  setCurrentStep(1);
                  setSelectedTicket(null);
                }}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all duration-200"
              >
                Back
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={surveyResponse.overallSatisfaction === 0 || loading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSatisfactionSurvey;