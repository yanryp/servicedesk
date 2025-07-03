import React, { useState, useEffect, useCallback } from 'react';
import { 
  MagnifyingGlassIcon, 
  BookOpenIcon,
  TagIcon,
  EyeIcon,
  ClockIcon,
  FolderIcon,
  DocumentTextIcon,
  StarIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { 
  HandThumbUpIcon as HandThumbUpSolidIcon
} from '@heroicons/react/24/solid';
import { Link, useSearchParams } from 'react-router-dom';
import { knowledgeBaseService, KnowledgeCategory, KnowledgeArticle } from '../services/knowledgeBase';
import { LoadingSpinner } from '../components/ui';
import toast from 'react-hot-toast';

const KnowledgeBasePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    searchParams.get('category') ? parseInt(searchParams.get('category')!) : null
  );
  const [currentView, setCurrentView] = useState<'browse' | 'search' | 'popular' | 'recent'>('browse');
  
  // Data state
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [popularArticles, setPopularArticles] = useState<KnowledgeArticle[]>([]);
  const [recentArticles, setRecentArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle URL parameters
  useEffect(() => {
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    
    if (query) {
      setSearchTerm(query);
      handleSearch(query, category ? parseInt(category) : null);
    } else if (category) {
      setSelectedCategoryId(parseInt(category));
      loadCategoryArticles(parseInt(category));
    }
  }, [searchParams]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [categoriesData, popularData, recentData, allArticlesData] = await Promise.all([
        knowledgeBaseService.getCategories(),
        knowledgeBaseService.getPopularArticles(10),
        knowledgeBaseService.getRecentArticles(10),
        knowledgeBaseService.searchArticles({
          status: 'published',
          limit: 20,
          offset: 0,
          sortBy: 'updated',
          sortOrder: 'desc'
        })
      ]);
      
      setCategories(categoriesData || []);
      setPopularArticles(popularData || []);
      setRecentArticles(recentData || []);
      setArticles(allArticlesData.articles || []);
      setHasMore(allArticlesData.hasMore || false);
      setOffset(20);
    } catch (error: any) {
      console.error('Error loading knowledge base data:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      setError(`Failed to load knowledge base data: ${error.message}`);
      setCategories([]);
      setPopularArticles([]);
      setRecentArticles([]);
      setArticles([]);
      toast.error('Failed to load knowledge base data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async (query: string, categoryId: number | null = null, reset: boolean = true) => {
    if (!query.trim()) return;
    
    try {
      setSearching(true);
      if (reset) {
        setOffset(0);
        setArticles([]);
      }
      
      const searchResult = await knowledgeBaseService.searchArticles({
        query: query.trim(),
        categoryId: categoryId || undefined,
        status: 'published',
        limit,
        offset: reset ? 0 : offset,
        sortBy: 'views',
        sortOrder: 'desc'
      });
      
      if (reset) {
        setArticles(searchResult.articles);
      } else {
        setArticles(prev => [...prev, ...searchResult.articles]);
      }
      
      setHasMore(searchResult.hasMore);
      setOffset(reset ? limit : offset + limit);
      setCurrentView('search');
      
      // Update URL
      const newParams = new URLSearchParams();
      newParams.set('q', query);
      if (categoryId) newParams.set('category', categoryId.toString());
      setSearchParams(newParams);
      
    } catch (error) {
      console.error('Error searching articles:', error);
      toast.error('Failed to search articles');
    } finally {
      setSearching(false);
    }
  }, [limit, offset]);

  const loadCategoryArticles = useCallback(async (categoryId: number, reset: boolean = true) => {
    try {
      setLoading(true);
      if (reset) {
        setOffset(0);
        setArticles([]);
      }
      
      const searchResult = await knowledgeBaseService.searchArticles({
        categoryId,
        status: 'published',
        limit,
        offset: reset ? 0 : offset,
        sortBy: 'updated',
        sortOrder: 'desc'
      });
      
      if (reset) {
        setArticles(searchResult.articles);
      } else {
        setArticles(prev => [...prev, ...searchResult.articles]);
      }
      
      setHasMore(searchResult.hasMore);
      setOffset(reset ? limit : offset + limit);
      setCurrentView('browse');
      
      // Update URL
      const newParams = new URLSearchParams();
      newParams.set('category', categoryId.toString());
      setSearchParams(newParams);
      
    } catch (error) {
      console.error('Error loading category articles:', error);
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      handleSearch(searchTerm, selectedCategoryId);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedCategoryId(null);
    setArticles([]);
    setCurrentView('browse');
    setSearchParams({});
  };

  const loadMore = () => {
    if (currentView === 'search' && searchTerm) {
      handleSearch(searchTerm, selectedCategoryId, false);
    } else if (currentView === 'browse' && selectedCategoryId) {
      loadCategoryArticles(selectedCategoryId, false);
    }
  };

  // Get top-level categories for navigation
  const topLevelCategories = categories?.filter(cat => !cat.parentId) || [];

  if (loading && (!articles || articles.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Unable to load Knowledge Base</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpenIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Knowledge Base</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('popular')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'popular'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                <StarIcon className="h-4 w-4 mr-1" />
                Popular
              </button>
              <button
                onClick={() => setCurrentView('recent')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'recent'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                <ClockIcon className="h-4 w-4 mr-1" />
                Recent
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search knowledge base..."
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <span className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    ✕
                  </span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={clearSearch}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    !selectedCategoryId && currentView === 'browse'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  All Articles
                </button>
                {topLevelCategories?.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategoryId(category.id);
                      loadCategoryArticles(category.id);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center justify-between ${
                      selectedCategoryId === category.id
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="flex items-center">
                      <FolderIcon className="h-4 w-4 mr-2" />
                      {category.name}
                    </span>
                    {category._count && (
                      <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                        {category._count.articles}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* View-specific content */}
            {currentView === 'popular' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <FireIcon className="h-5 w-5 mr-2 text-orange-500" />
                    Most Popular Articles
                  </h2>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {popularArticles?.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            )}

            {currentView === 'recent' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2 text-green-500" />
                    Recently Added Articles
                  </h2>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentArticles?.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            )}

            {(currentView === 'browse' || currentView === 'search') && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {currentView === 'search' ? `Search Results for "${searchTerm}"` : 
                     selectedCategoryId ? `Articles in ${categories?.find(c => c.id === selectedCategoryId)?.name}` :
                     'All Articles'}
                  </h2>
                  {searching && (
                    <div className="mt-2">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </div>
                
                {articles && articles.length > 0 ? (
                  <>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {articles?.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                      ))}
                    </div>
                    
                    {hasMore && (
                      <div className="p-6 text-center border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={loadMore}
                          disabled={searching}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {searching ? 'Loading...' : 'Load More'}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-12 text-center">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No articles found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {currentView === 'search' 
                        ? 'Try adjusting your search terms or browse by category.'
                        : 'No articles are available in this category yet.'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Article Card Component
const ArticleCard: React.FC<{ article: KnowledgeArticle }> = ({ article }) => {
  const helpfulnessRatio = React.useMemo(() => {
    const total = article.helpfulCount + article.notHelpfulCount;
    return total > 0 ? Math.round((article.helpfulCount / total) * 100) : 0;
  }, [article.helpfulCount, article.notHelpfulCount]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <Link 
            to={`/knowledge-base/articles/${article.id}`}
            className="block"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate">
              {article.title}
            </h3>
          </Link>
          
          {article.excerpt && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {article.excerpt}
            </p>
          )}
          
          <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            {article.category && (
              <span className="flex items-center">
                <FolderIcon className="h-4 w-4 mr-1" />
                {article.category.name}
              </span>
            )}
            
            <span className="flex items-center">
              <EyeIcon className="h-4 w-4 mr-1" />
              {article.viewCount} views
            </span>
            
            {(article.helpfulCount > 0 || article.notHelpfulCount > 0) && (
              <span className="flex items-center">
                <HandThumbUpSolidIcon className="h-4 w-4 mr-1 text-green-500" />
                {helpfulnessRatio}% helpful
              </span>
            )}
            
            <span className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              {formatDate(article.updatedAt)}
            </span>
          </div>
          
          {article.tags && article.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {article.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  <TagIcon className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
              {article.tags && article.tags.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{article.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBasePage;