import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  EyeIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  TagIcon,
  ClockIcon,
  UserIcon,
  FolderIcon,
  ShareIcon,
  BookmarkIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import {
  HandThumbUpIcon as HandThumbUpSolidIcon,
  BookmarkIcon as BookmarkSolidIcon
} from '@heroicons/react/24/solid';
import { knowledgeBaseService, KnowledgeArticle } from '../services/knowledgeBase';
import { LoadingSpinner } from '../components/ui';
import toast from 'react-hot-toast';

const ArticleViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [article, setArticle] = useState<KnowledgeArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (id) {
      loadArticle(parseInt(id));
    }
  }, [id]); // loadArticle is defined within this component and doesn't need to be in dependencies

  const loadArticle = async (articleId: number) => {
    try {
      setLoading(true);
      const articleData = await knowledgeBaseService.getArticleById(articleId);
      setArticle(articleData);
    } catch (error) {
      console.error('Error loading article:', error);
      toast.error('Failed to load article');
      navigate('/knowledge-base');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (isHelpful: boolean) => {
    if (!article || feedbackSubmitted) return;

    try {
      setSubmittingFeedback(true);
      await knowledgeBaseService.submitFeedback(article.id, {
        isHelpful,
        comment: feedbackComment || undefined
      });
      
      setFeedbackSubmitted(true);
      setShowFeedbackForm(false);
      setFeedbackComment('');
      
      // Update local counts
      setArticle(prev => prev ? {
        ...prev,
        helpfulCount: isHelpful ? prev.helpfulCount + 1 : prev.helpfulCount,
        notHelpfulCount: !isHelpful ? prev.notHelpfulCount + 1 : prev.notHelpfulCount
      } : null);
      
      toast.success('Thank you for your feedback!');
    } catch (error: any) {
      if (error.response?.data?.message === 'Feedback already submitted for this article') {
        setFeedbackSubmitted(true);
        toast('You have already provided feedback for this article');
      } else {
        console.error('Error submitting feedback:', error);
        toast.error('Failed to submit feedback');
      }
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || 'Check out this knowledge base article',
          url: window.location.href
        });
      } catch (error) {
        // Fallback to copying URL
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
    toast.success(bookmarked ? 'Bookmark removed' : 'Article bookmarked');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getHelpfulnessRatio = (helpful: number, notHelpful: number) => {
    const total = helpful + notHelpful;
    if (total === 0) return 0;
    return Math.round((helpful / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Article not found</h2>
          <Link
            to="/knowledge-base"
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Knowledge Base
          </Link>
        </div>
      </div>
    );
  }

  const helpfulnessRatio = getHelpfulnessRatio(article.helpfulCount, article.notHelpfulCount);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              to="/knowledge-base"
              className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Knowledge Base
            </Link>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Share article"
              >
                <ShareIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={toggleBookmark}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title={bookmarked ? "Remove bookmark" : "Bookmark article"}
              >
                {bookmarked ? (
                  <BookmarkSolidIcon className="h-5 w-5 text-yellow-500" />
                ) : (
                  <BookmarkIcon className="h-5 w-5" />
                )}
              </button>
              
              <button
                onClick={handlePrint}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Print article"
              >
                <PrinterIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Article Header */}
          <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-1" />
                By {article.author.name}
              </div>
              
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                {formatDate(article.updatedAt)}
              </div>
              
              <div className="flex items-center">
                <EyeIcon className="h-4 w-4 mr-1" />
                {article.viewCount} views
              </div>
              
              {article.category && (
                <div className="flex items-center">
                  <FolderIcon className="h-4 w-4 mr-1" />
                  <Link
                    to={`/knowledge-base?category=${article.category.id}`}
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {article.category.name}
                  </Link>
                </div>
              )}
              
              {(article.helpfulCount > 0 || article.notHelpfulCount > 0) && (
                <div className="flex items-center">
                  <HandThumbUpSolidIcon className="h-4 w-4 mr-1 text-green-500" />
                  {helpfulnessRatio}% helpful ({article.helpfulCount + article.notHelpfulCount} votes)
                </div>
              )}
            </div>
            
            {article.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <Link
                    key={index}
                    to={`/knowledge-base?q=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
                  >
                    <TagIcon className="h-3 w-3 mr-1" />
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          {/* Article Body */}
          <div className="px-6 py-8">
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
          
          {/* Feedback Section */}
          <div className="px-6 py-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Was this article helpful?
              </h3>
              
              {!feedbackSubmitted ? (
                <div className="space-y-4">
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => handleFeedback(true)}
                      disabled={submittingFeedback}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <HandThumbUpIcon className="h-5 w-5 mr-2" />
                      {submittingFeedback ? 'Submitting...' : 'Yes, helpful'}
                    </button>
                    
                    <button
                      onClick={() => setShowFeedbackForm(true)}
                      disabled={submittingFeedback}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <HandThumbDownIcon className="h-5 w-5 mr-2" />
                      Not helpful
                    </button>
                  </div>
                  
                  {showFeedbackForm && (
                    <div className="mt-4 max-w-md mx-auto">
                      <textarea
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        placeholder="Tell us how we can improve this article (optional)"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      />
                      <div className="mt-2 flex justify-end space-x-2">
                        <button
                          onClick={() => setShowFeedbackForm(false)}
                          className="px-3 py-1 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleFeedback(false)}
                          disabled={submittingFeedback}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                          {submittingFeedback ? 'Submitting...' : 'Submit'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-green-600 dark:text-green-400">
                  <HandThumbUpSolidIcon className="h-6 w-6 mx-auto mb-2" />
                  <p>Thank you for your feedback!</p>
                </div>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ArticleViewPage;