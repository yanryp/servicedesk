// frontend/src/pages/technician/TechnicianKnowledgeBase.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  LightBulbIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  TagIcon,
  ClockIcon,
  StarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface KnowledgeArticle {
  id: number;
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  views: number;
  rating: number;
  lastUpdated: string;
  author: string;
}

const TechnicianKnowledgeBase: React.FC = () => {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Mock data for knowledge base articles
  const mockArticles: KnowledgeArticle[] = [
    {
      id: 1,
      title: 'Troubleshooting BSGDirect Login Issues',
      summary: 'Step-by-step guide to resolve common BSGDirect authentication problems',
      content: 'Complete troubleshooting guide...',
      category: 'Banking Systems',
      tags: ['bsgdirect', 'authentication', 'login', 'troubleshooting'],
      difficulty: 'beginner',
      estimatedTime: '5 min',
      views: 234,
      rating: 4.8,
      lastUpdated: '2024-01-15',
      author: 'IT Support Team'
    },
    {
      id: 2,
      title: 'Network Connectivity Diagnostics',
      summary: 'Advanced network troubleshooting for branch office connectivity issues',
      content: 'Network diagnostics procedures...',
      category: 'Infrastructure',
      tags: ['network', 'connectivity', 'diagnostics', 'branch'],
      difficulty: 'advanced',
      estimatedTime: '15 min',
      views: 189,
      rating: 4.9,
      lastUpdated: '2024-01-12',
      author: 'Network Team'
    },
    {
      id: 3,
      title: 'OLIBS System Performance Optimization',
      summary: 'Optimize OLIBS performance for better user experience',
      content: 'Performance optimization guide...',
      category: 'Banking Systems',
      tags: ['olibs', 'performance', 'optimization'],
      difficulty: 'intermediate',
      estimatedTime: '10 min',
      views: 156,
      rating: 4.6,
      lastUpdated: '2024-01-10',
      author: 'Banking Systems Team'
    },
    {
      id: 4,
      title: 'Hardware Replacement Procedures',
      summary: 'Standard procedures for replacing common hardware components',
      content: 'Hardware replacement steps...',
      category: 'Hardware',
      tags: ['hardware', 'replacement', 'procedures', 'atm'],
      difficulty: 'intermediate',
      estimatedTime: '20 min',
      views: 298,
      rating: 4.7,
      lastUpdated: '2024-01-08',
      author: 'Field Support Team'
    },
    {
      id: 5,
      title: 'Security Incident Response Protocol',
      summary: 'Emergency procedures for handling security incidents',
      content: 'Security response protocol...',
      category: 'Security',
      tags: ['security', 'incident', 'response', 'emergency'],
      difficulty: 'advanced',
      estimatedTime: '25 min',
      views: 167,
      rating: 4.9,
      lastUpdated: '2024-01-05',
      author: 'Security Team'
    },
    {
      id: 6,
      title: 'Common Software Installation Issues',
      summary: 'Resolve typical software installation and update problems',
      content: 'Software troubleshooting guide...',
      category: 'Software',
      tags: ['software', 'installation', 'updates', 'troubleshooting'],
      difficulty: 'beginner',
      estimatedTime: '8 min',
      views: 445,
      rating: 4.5,
      lastUpdated: '2024-01-03',
      author: 'IT Support Team'
    }
  ];

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      setArticles(mockArticles);
      setLoading(false);
    }, 1000);
  }, []);

  const categories = [
    'all',
    ...Array.from(new Set(articles.map(article => article.category)))
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || article.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Banking Systems':
        return BookOpenIcon;
      case 'Infrastructure':
        return WrenchScrewdriverIcon;
      case 'Hardware':
        return WrenchScrewdriverIcon;
      case 'Security':
        return ExclamationTriangleIcon;
      case 'Software':
        return DocumentTextIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'advanced':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-slate-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
        <p className="ml-4 text-slate-600">Loading knowledge base...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <DocumentTextIcon className="w-8 h-8 mr-3 text-blue-500" />
          Technical Knowledge Base
        </h1>
        <p className="text-slate-600 mt-1">
          Access troubleshooting guides, procedures, and technical documentation
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Articles</p>
              <p className="text-2xl font-bold text-slate-900">{articles.length}</p>
            </div>
            <BookOpenIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Categories</p>
              <p className="text-2xl font-bold text-slate-900">{categories.length - 1}</p>
            </div>
            <TagIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Most Popular</p>
              <p className="text-sm font-bold text-slate-900">
                {articles.length > 0 ? articles.reduce((prev, current) => 
                  prev.views > current.views ? prev : current
                ).title.substring(0, 20) + '...' : 'N/A'}
              </p>
            </div>
            <EyeIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Avg Rating</p>
              <p className="text-2xl font-bold text-slate-900">
                {articles.length > 0 ? 
                  (articles.reduce((sum, article) => sum + article.rating, 0) / articles.length).toFixed(1) 
                  : '0.0'}
              </p>
            </div>
            <StarIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search articles, tags, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredArticles.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <LightBulbIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No articles found</p>
            <p className="text-slate-400">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          filteredArticles.map((article) => {
            const CategoryIcon = getCategoryIcon(article.category);
            
            return (
              <div key={article.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CategoryIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-blue-600">{article.category}</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(article.difficulty)}`}>
                          {article.difficulty}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {article.estimatedTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 mb-2">{article.title}</h3>
                <p className="text-slate-600 mb-4 line-clamp-2">{article.summary}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                      #{tag}
                    </span>
                  ))}
                  {article.tags.length > 3 && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                      +{article.tags.length - 3} more
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <div className="flex items-center space-x-1">
                      {renderStars(article.rating)}
                      <span className="ml-1">{article.rating}</span>
                    </div>
                    <span>{article.views} views</span>
                  </div>
                  
                  <Link
                    to={`/knowledge-base/articles/${article.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Read Article
                  </Link>
                </div>

                <div className="text-xs text-slate-400 mt-2">
                  Updated {new Date(article.lastUpdated).toLocaleDateString()} by {article.author}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Links */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Need More Help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/technician/workspace"
            className="flex items-center space-x-2 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <WrenchScrewdriverIcon className="w-5 h-5" />
            <span>Go to Workspace</span>
          </Link>
          
          <Link
            to="/escalation"
            className="flex items-center space-x-2 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span>Escalate to L2</span>
          </Link>
          
          <Link
            to="/knowledge-base/request"
            className="flex items-center space-x-2 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <LightBulbIcon className="w-5 h-5" />
            <span>Request New Article</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TechnicianKnowledgeBase;