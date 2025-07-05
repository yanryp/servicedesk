// frontend/src/pages/customer/CustomerKnowledgeBase.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  StarIcon,
  EyeIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ClockIcon,
  TagIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
  ChevronRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { knowledgeBaseService, type KnowledgeArticle as APIKnowledgeArticle, type KnowledgeCategory as APIKnowledgeCategory } from '../../services/knowledgeBase';

// Local interfaces for customer portal (extending API types with UI-specific fields)
interface KnowledgeCategory extends Omit<APIKnowledgeCategory, '_count'> {
  articleCount: number;
  icon: string;
  color: string;
}

interface KnowledgeArticle extends Omit<APIKnowledgeArticle, 'author' | 'editor' | 'category'> {
  summary: string;
  categoryName: string;
  views: number;
  helpful: number;
  notHelpful: number;
  rating: number;
  author: string;
  estimatedReadTime: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  featured: boolean;
}

interface PopularSearch {
  term: string;
  count: number;
}

const CustomerKnowledgeBase: React.FC = () => {
  const { id } = useParams();
  const [view, setView] = useState<'browse' | 'search' | 'article'>('browse');
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<KnowledgeCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<KnowledgeArticle[]>([]);
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{[key: number]: 'helpful' | 'not-helpful' | null}>({});

  useEffect(() => {
    loadKnowledgeBaseData();
  }, []);

  useEffect(() => {
    if (id) {
      setView('article');
      loadArticle(parseInt(id));
    }
  }, [id]);

  const loadKnowledgeBaseData = async () => {
    setLoading(true);
    try {
      // Load categories from API
      const apiCategories = await knowledgeBaseService.getCategories();
      
      // Transform categories to match UI format
      const transformedCategories: KnowledgeCategory[] = apiCategories.map(cat => ({
        ...cat,
        articleCount: cat._count?.articles || 0,
        icon: getIconForCategory(cat.name),
        color: getColorForCategory(cat.name),
        description: cat.description || `${cat.name} help articles`
      }));
      
      setCategories(transformedCategories);
      
      // Load featured/popular articles
      const popularArticles = await knowledgeBaseService.getPopularArticles(10);
      
      // Transform articles to match UI format
      const transformedArticles: KnowledgeArticle[] = popularArticles.map(article => ({
        ...article,
        summary: article.excerpt || `${article.title} - Help article`,
        categoryName: article.category?.name || 'General',
        views: article.viewCount,
        helpful: article.helpfulCount,
        notHelpful: article.notHelpfulCount,
        rating: calculateRating(article.helpfulCount, article.notHelpfulCount),
        author: article.author.name,
        estimatedReadTime: calculateReadTime(article.content),
        difficulty: 'Beginner' as const, // Default for now
        featured: article.viewCount > 100 || article.helpfulCount > 10
      }));
      
      setArticles(transformedArticles);
      
      // Set mock popular searches for now
      setPopularSearches([
        { term: 'password reset', count: 145 },
        { term: 'mobile banking', count: 98 },
        { term: 'account locked', count: 76 },
        { term: 'transfer money', count: 65 },
        { term: 'ATM card', count: 54 }
      ]);
      
    } catch (error) {
      console.error('Error loading knowledge base data:', error);
      // Set empty state on error
      setCategories([]);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper functions
  const getIconForCategory = (categoryName: string): string => {
    const name = categoryName.toLowerCase();
    if (name.includes('getting') || name.includes('start')) return '🚀';
    if (name.includes('account') || name.includes('user')) return '👤';
    if (name.includes('banking') || name.includes('bsg')) return '🏦';
    if (name.includes('mobile') || name.includes('app')) return '📱';
    if (name.includes('email') || name.includes('communication')) return '📧';
    if (name.includes('security') || name.includes('safety')) return '🔒';
    return '📖'; // Default icon
  };
  
  const getColorForCategory = (categoryName: string): string => {
    const name = categoryName.toLowerCase();
    if (name.includes('getting') || name.includes('start')) return 'blue';
    if (name.includes('account') || name.includes('user')) return 'green';
    if (name.includes('banking') || name.includes('bsg')) return 'purple';
    if (name.includes('mobile') || name.includes('app')) return 'indigo';
    if (name.includes('email') || name.includes('communication')) return 'cyan';
    if (name.includes('security') || name.includes('safety')) return 'red';
    return 'gray'; // Default color
  };
  
  const calculateRating = (helpful: number, notHelpful: number): number => {
    const total = helpful + notHelpful;
    if (total === 0) return 0;
    return Math.round((helpful / total) * 5 * 10) / 10; // Round to 1 decimal
  };
  
  const calculateReadTime = (content: string): number => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute) || 1;
  };

  const loadArticle = async (articleId: number) => {
    try {
      // Try to find in already loaded articles first
      let article = articles.find(a => a.id === articleId);
      
      if (!article) {
        // Load from API if not found
        const apiArticle = await knowledgeBaseService.getArticleById(articleId);
        
        // Transform to UI format
        article = {
          ...apiArticle,
          summary: apiArticle.excerpt || `${apiArticle.title} - Help article`,
          categoryName: apiArticle.category?.name || 'General',
          views: apiArticle.viewCount,
          helpful: apiArticle.helpfulCount,
          notHelpful: apiArticle.notHelpfulCount,
          rating: calculateRating(apiArticle.helpfulCount, apiArticle.notHelpfulCount),
          author: apiArticle.author.name,
          estimatedReadTime: calculateReadTime(apiArticle.content),
          difficulty: 'Beginner' as const,
          featured: apiArticle.viewCount > 100 || apiArticle.helpfulCount > 10
        };
      }
      
      setSelectedArticle(article);
    } catch (error) {
      console.error('Error loading article:', error);
    }
  };

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setView('browse');
      return;
    }

    try {
      setLoading(true);
      
      // Search using the API
      const searchResult = await knowledgeBaseService.searchArticles({
        query: term,
        status: 'published',
        limit: 20,
        sortBy: 'views',
        sortOrder: 'desc'
      });
      
      // Transform results to UI format
      const transformedResults: KnowledgeArticle[] = searchResult.articles.map(article => ({
        ...article,
        summary: article.excerpt || `${article.title} - Help article`,
        categoryName: article.category?.name || 'General',
        views: article.viewCount,
        helpful: article.helpfulCount,
        notHelpful: article.notHelpfulCount,
        rating: calculateRating(article.helpfulCount, article.notHelpfulCount),
        author: article.author.name,
        estimatedReadTime: calculateReadTime(article.content),
        difficulty: 'Beginner' as const,
        featured: article.viewCount > 100 || article.helpfulCount > 10
      }));
      
      setSearchResults(transformedResults);
      setView('search');
    } catch (error) {
      console.error('Error searching articles:', error);
      // Fallback to local search if API fails
      const results = articles.filter(article =>
        article.title.toLowerCase().includes(term.toLowerCase()) ||
        article.summary.toLowerCase().includes(term.toLowerCase()) ||
        article.content.toLowerCase().includes(term.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(term.toLowerCase()))
      );
      setSearchResults(results);
      setView('search');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (articleId: number, type: 'helpful' | 'not-helpful') => {
    try {
      // Submit feedback to API
      await knowledgeBaseService.submitFeedback(articleId, {
        isHelpful: type === 'helpful',
        comment: undefined
      });
      
      // Update local state
      setFeedback(prev => ({
        ...prev,
        [articleId]: type
      }));
      
      // Update article counts if it's the currently selected article
      if (selectedArticle && selectedArticle.id === articleId) {
        setSelectedArticle(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            helpful: type === 'helpful' ? prev.helpful + 1 : prev.helpful,
            notHelpful: type === 'not-helpful' ? prev.notHelpful + 1 : prev.notHelpful
          };
        });
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Still update local state even if API fails
      setFeedback(prev => ({
        ...prev,
        [articleId]: type
      }));
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Article view
  if (view === 'article' && selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => {
            setView('browse');
            setSelectedArticle(null);
          }}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to Knowledge Base</span>
        </button>

        {/* Article header */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                  {selectedArticle.categoryName}
                </span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${getDifficultyColor(selectedArticle.difficulty)}`}>
                  {selectedArticle.difficulty}
                </span>
                {selectedArticle.featured && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-medium flex items-center space-x-1">
                    <StarIcon className="w-3 h-3" />
                    <span>Featured</span>
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">{selectedArticle.title}</h1>
              <p className="text-lg text-slate-600 mb-4">{selectedArticle.summary}</p>
              <div className="flex items-center space-x-6 text-sm text-slate-500">
                <span className="flex items-center space-x-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>{selectedArticle.estimatedReadTime} min read</span>
                </span>
                <span className="flex items-center space-x-1">
                  <EyeIcon className="w-4 h-4" />
                  <span>{selectedArticle.views} views</span>
                </span>
                <span>Updated {formatDate(selectedArticle.updatedAt)}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 mb-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(selectedArticle.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-sm text-slate-600 ml-2">
                  {selectedArticle.rating}/5
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {selectedArticle.helpful} helpful • {selectedArticle.notHelpful} not helpful
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {selectedArticle.tags.map((tag) => (
              <span
                key={tag}
                className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs flex items-center space-x-1"
              >
                <TagIcon className="w-3 h-3" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Article content */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 mb-6">
          <div 
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: selectedArticle.content.replace(/\n/g, '<br>').replace(/^# (.*$)/gm, '<h1>$1</h1>').replace(/^## (.*$)/gm, '<h2>$1</h2>').replace(/^### (.*$)/gm, '<h3>$1</h3>')
            }}
          />
        </div>

        {/* Feedback section */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Was this article helpful?</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleFeedback(selectedArticle.id, 'helpful')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                feedback[selectedArticle.id] === 'helpful'
                  ? 'bg-green-100 text-green-800 border-2 border-green-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-green-50'
              }`}
            >
              <HandThumbUpIcon className="w-4 h-4" />
              <span>Yes, helpful</span>
            </button>
            <button
              onClick={() => handleFeedback(selectedArticle.id, 'not-helpful')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                feedback[selectedArticle.id] === 'not-helpful'
                  ? 'bg-red-100 text-red-800 border-2 border-red-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-red-50'
              }`}
            >
              <HandThumbDownIcon className="w-4 h-4" />
              <span>No, not helpful</span>
            </button>
          </div>
          {feedback[selectedArticle.id] && (
            <p className="text-sm text-slate-600 mt-3">
              Thank you for your feedback! This helps us improve our help articles.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Help Center</h1>
        <p className="text-slate-600 text-lg">Find answers to common questions and learn how to use BSG services</p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search for help articles, guides, or FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
            className="w-full pl-12 pr-4 py-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
          <button
            onClick={() => handleSearch(searchTerm)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200"
          >
            Search
          </button>
        </div>

        {/* Popular searches */}
        <div className="mt-4">
          <p className="text-sm text-slate-600 mb-2">Popular searches:</p>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((search) => (
              <button
                key={search.term}
                onClick={() => {
                  setSearchTerm(search.term);
                  handleSearch(search.term);
                }}
                className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm hover:bg-blue-100 hover:text-blue-800 transition-all duration-200"
              >
                {search.term}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Results */}
      {view === 'search' && (
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Search Results for "{searchTerm}"
            </h2>
            <p className="text-slate-600">Found {searchResults.length} articles</p>
          </div>

          <div className="space-y-4">
            {searchResults.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        {article.categoryName}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(article.difficulty)}`}>
                        {article.difficulty}
                      </span>
                      {article.featured && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
                          <StarIcon className="w-3 h-3" />
                          <span>Featured</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">{article.title}</h3>
                    <p className="text-slate-600 mb-3">{article.summary}</p>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <span className="flex items-center space-x-1">
                        <ClockIcon className="w-3 h-3" />
                        <span>{article.estimatedReadTime} min</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <EyeIcon className="w-3 h-3" />
                        <span>{article.views} views</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <StarIcon className="w-3 h-3" />
                        <span>{article.rating}/5</span>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedArticle(article);
                      setView('article');
                    }}
                    className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-1"
                  >
                    <span>Read</span>
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {searchResults.length === 0 && (
              <div className="text-center py-12">
                <DocumentTextIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No articles found</h3>
                <p className="text-slate-600 mb-6">
                  Try adjusting your search terms or browse by category below.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setView('browse');
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200"
                >
                  Browse Categories
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Browse Categories */}
      {view === 'browse' && (
        <>
          {/* Featured Articles */}
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Featured Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {articles.filter(article => article.featured).map((article) => (
                <div
                  key={article.id}
                  className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200"
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
                      <StarIcon className="w-3 h-3" />
                      <span>Featured</span>
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      {article.categoryName}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">{article.title}</h3>
                  <p className="text-slate-600 text-sm mb-4">{article.summary}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs text-slate-500">
                      <span className="flex items-center space-x-1">
                        <ClockIcon className="w-3 h-3" />
                        <span>{article.estimatedReadTime} min</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <EyeIcon className="w-3 h-3" />
                        <span>{article.views}</span>
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedArticle(article);
                        setView('article');
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Read more →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Categories */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Browse by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-12 h-12 bg-${category.color}-100 rounded-lg flex items-center justify-center text-2xl`}>
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-slate-900">{category.name}</h3>
                      <p className="text-sm text-slate-600">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      {category.articleCount} articles
                    </span>
                    <ChevronRightIcon className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Help */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white max-w-4xl mx-auto">
            <div className="text-center">
              <QuestionMarkCircleIcon className="w-12 h-12 mx-auto mb-4 text-blue-200" />
              <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
              <p className="text-blue-100 mb-6">
                Our support team is here to help. Submit a ticket or contact us directly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/customer/create-ticket"
                  className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition-all duration-200"
                >
                  Submit Support Ticket
                </Link>
                <a
                  href="tel:+62-431-123-4567"
                  className="border border-white/30 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-all duration-200"
                >
                  Call Support: +62-431-123-4567
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerKnowledgeBase;