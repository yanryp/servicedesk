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

interface KnowledgeCategory {
  id: number;
  name: string;
  description: string;
  articleCount: number;
  icon: string;
  color: string;
}

interface KnowledgeArticle {
  id: number;
  title: string;
  summary: string;
  content: string;
  categoryId: number;
  categoryName: string;
  tags: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  rating: number;
  author: string;
  publishedAt: string;
  updatedAt: string;
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
    // Simulate API calls
    setTimeout(() => {
      setCategories([
        {
          id: 1,
          name: 'Getting Started',
          description: 'Basic guides for new users',
          articleCount: 12,
          icon: '🚀',
          color: 'blue'
        },
        {
          id: 2,
          name: 'Account Management',
          description: 'Password, profile, and security settings',
          articleCount: 8,
          icon: '👤',
          color: 'green'
        },
        {
          id: 3,
          name: 'BSGDirect Banking',
          description: 'Online banking features and troubleshooting',
          articleCount: 15,
          icon: '🏦',
          color: 'purple'
        },
        {
          id: 4,
          name: 'Mobile Banking',
          description: 'Mobile app installation and usage',
          articleCount: 10,
          icon: '📱',
          color: 'indigo'
        },
        {
          id: 5,
          name: 'Email & Communication',
          description: 'Email setup and troubleshooting',
          articleCount: 6,
          icon: '📧',
          color: 'cyan'
        },
        {
          id: 6,
          name: 'Security & Safety',
          description: 'Best practices for online security',
          articleCount: 9,
          icon: '🔒',
          color: 'red'
        }
      ]);

      setArticles([
        {
          id: 1,
          title: 'How to Reset Your Password',
          summary: 'Step-by-step guide to reset your BSG account password safely and securely.',
          content: `# How to Reset Your Password

If you've forgotten your password or need to reset it for security reasons, follow these steps:

## Method 1: Online Reset

1. **Go to the login page** - Navigate to the BSG login portal
2. **Click "Forgot Password"** - Look for the link below the login form
3. **Enter your email address** - Use the email associated with your account
4. **Check your email** - Look for a reset link (check spam folder if needed)
5. **Click the reset link** - This will take you to a secure password reset page
6. **Create a new password** - Follow the password requirements below

## Password Requirements

Your new password must include:
- At least 8 characters long
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)

## Method 2: Contact Support

If you're unable to reset your password online:

1. **Call our support line** - +62-431-123-4567
2. **Visit your branch** - Bring valid ID for verification
3. **Submit a support ticket** - Use our customer portal

## Security Tips

- Never share your password with anyone
- Use a unique password for your BSG account
- Enable two-factor authentication when available
- Change your password regularly

## Troubleshooting

**Not receiving the reset email?**
- Check your spam/junk folder
- Verify you're using the correct email address
- Wait 5 minutes before requesting another reset

**Reset link not working?**
- Ensure you're clicking the latest reset link
- Links expire after 24 hours
- Try copying and pasting the link directly

If you continue to have issues, please contact our support team.`,
          categoryId: 2,
          categoryName: 'Account Management',
          tags: ['password', 'security', 'account', 'login'],
          views: 1250,
          helpful: 89,
          notHelpful: 12,
          rating: 4.7,
          author: 'BSG Support Team',
          publishedAt: '2024-06-15T10:00:00Z',
          updatedAt: '2024-07-01T14:30:00Z',
          estimatedReadTime: 3,
          difficulty: 'Beginner',
          featured: true
        },
        {
          id: 2,
          title: 'Setting Up BSGDirect Mobile App',
          summary: 'Complete guide to downloading, installing, and configuring the BSG mobile banking app.',
          content: `# Setting Up BSGDirect Mobile App

Get started with mobile banking in just a few minutes.

## Download the App

### For Android Devices:
1. Open Google Play Store
2. Search for "BSGDirect Mobile"
3. Tap "Install" on the official BSG app
4. Wait for download to complete

### For iOS Devices:
1. Open App Store
2. Search for "BSGDirect Mobile"  
3. Tap "Get" on the official BSG app
4. Use Face ID, Touch ID, or your Apple ID password

## First-Time Setup

1. **Open the app** and tap "Get Started"
2. **Accept terms and conditions** 
3. **Enter your account details**:
   - Account number
   - Date of birth
   - Phone number registered with the bank
4. **Create a mobile PIN** (6 digits)
5. **Set up biometric login** (optional but recommended)

## Security Setup

### Enable Biometric Authentication:
- **Fingerprint** (Android/iOS)
- **Face Recognition** (iOS Face ID)
- **Voice Recognition** (select devices)

### Set Up Transaction Limits:
- Daily transfer limit
- Monthly bill payment limit
- ATM withdrawal limit

## Features Overview

- **Account Balance** - View real-time balances
- **Transaction History** - Last 6 months of activity
- **Fund Transfers** - Between BSG accounts and other banks
- **Bill Payments** - Utilities, loans, credit cards
- **Mobile Top-Up** - Prepaid phone credit
- **ATM Locator** - Find nearest BSG ATMs
- **Contact Support** - Direct access to help

## Troubleshooting

**App won't download?**
- Check your internet connection
- Ensure sufficient storage space
- Update your device's operating system

**Login issues?**
- Verify account details are correct
- Ensure phone number is registered with BSG
- Try resetting your mobile PIN

**App crashes or freezes?**
- Force close and restart the app
- Update to the latest version
- Restart your device
- Clear app cache (Android)

## Security Tips

- Never share your mobile PIN
- Log out when using shared devices
- Enable app lock with biometric authentication
- Report suspicious activity immediately

For additional help, contact BSG Customer Service at +62-431-123-4567.`,
          categoryId: 4,
          categoryName: 'Mobile Banking',
          tags: ['mobile', 'app', 'installation', 'setup', 'banking'],
          views: 980,
          helpful: 76,
          notHelpful: 8,
          rating: 4.5,
          author: 'BSG Mobile Team',
          publishedAt: '2024-06-20T09:15:00Z',
          updatedAt: '2024-06-25T16:45:00Z',
          estimatedReadTime: 5,
          difficulty: 'Beginner',
          featured: true
        },
        {
          id: 3,
          title: 'Internet Banking Security Best Practices',
          summary: 'Essential security tips to protect your online banking account from fraud and unauthorized access.',
          content: `# Internet Banking Security Best Practices

Protect your account with these essential security measures.

## Strong Authentication

### Password Security:
- Use a unique, complex password
- Include uppercase, lowercase, numbers, and symbols
- Change passwords every 90 days
- Never share or write down passwords

### Two-Factor Authentication:
- Enable SMS verification
- Use mobile app authentication when available
- Consider hardware security keys for high-value accounts

## Safe Browsing Practices

### Always:
- Type the bank URL directly into your browser
- Look for the padlock icon (🔒) in the address bar
- Ensure the URL starts with "https://"
- Log out completely when finished

### Never:
- Click links in emails claiming to be from BSG
- Use public WiFi for banking
- Save banking passwords in browsers
- Bank on shared or public computers

## Recognizing Phishing Attempts

### Red Flags:
- Urgent requests for account information
- Emails with spelling or grammar errors
- Requests to click suspicious links
- Pressure to act immediately

### BSG Will Never:
- Ask for passwords via email
- Request personal information by phone
- Send urgent account suspension warnings
- Ask you to "verify" account details

## Regular Account Monitoring

### Daily Checks:
- Review account balances
- Check recent transactions
- Verify all activity is authorized

### Weekly Reviews:
- Download and review statements
- Check for unknown beneficiaries
- Verify contact information is current

### Monthly Actions:
- Update passwords
- Review account settings
- Check credit reports
- Update contact information

## Incident Response

### If You Suspect Fraud:
1. **Immediately** change your online banking password
2. **Contact BSG** customer service: +62-431-123-4567
3. **Document** suspicious transactions
4. **File** a police report if necessary
5. **Monitor** your credit report

### If Your Device is Lost/Stolen:
1. **Call BSG** to suspend online access
2. **Change** all banking passwords
3. **Enable** remote device wipe if available
4. **Monitor** accounts for unauthorized activity

## Device Security

### Computer Security:
- Keep operating system updated
- Use current antivirus software
- Enable automatic security updates
- Use a firewall

### Mobile Security:
- Set device lock with PIN/password
- Enable automatic app updates
- Use official app stores only
- Avoid banking on jailbroken/rooted devices

## Safe Transaction Practices

### Before Making Transfers:
- Verify recipient details twice
- Use only trusted beneficiaries
- Set reasonable transaction limits
- Enable transaction confirmations

### During Transactions:
- Double-check amounts and recipients
- Save confirmation numbers
- Never share transaction details
- Log out immediately after completion

## Additional Resources

- **BSG Security Center**: Visit our online security portal
- **Fraud Hotline**: Report suspicious activity 24/7
- **Security Alerts**: Subscribe to email notifications
- **Mobile Alerts**: Enable SMS transaction notifications

Remember: When in doubt, contact BSG customer service for assistance.`,
          categoryId: 6,
          categoryName: 'Security & Safety',
          tags: ['security', 'phishing', 'fraud', 'best-practices', 'safety'],
          views: 756,
          helpful: 92,
          notHelpful: 5,
          rating: 4.8,
          author: 'BSG Security Team',
          publishedAt: '2024-06-10T11:20:00Z',
          updatedAt: '2024-06-30T13:15:00Z',
          estimatedReadTime: 7,
          difficulty: 'Intermediate',
          featured: true
        }
      ]);

      setPopularSearches([
        { term: 'password reset', count: 145 },
        { term: 'mobile banking', count: 98 },
        { term: 'account locked', count: 76 },
        { term: 'transfer money', count: 65 },
        { term: 'ATM card', count: 54 }
      ]);

      setLoading(false);
    }, 1000);
  };

  const loadArticle = async (articleId: number) => {
    const article = articles.find(a => a.id === articleId);
    if (article) {
      setSelectedArticle(article);
    }
  };

  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setView('browse');
      return;
    }

    const results = articles.filter(article =>
      article.title.toLowerCase().includes(term.toLowerCase()) ||
      article.summary.toLowerCase().includes(term.toLowerCase()) ||
      article.content.toLowerCase().includes(term.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(term.toLowerCase()))
    );

    setSearchResults(results);
    setView('search');
  };

  const handleFeedback = (articleId: number, type: 'helpful' | 'not-helpful') => {
    setFeedback(prev => ({
      ...prev,
      [articleId]: type
    }));
    // Here you would typically send the feedback to your API
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