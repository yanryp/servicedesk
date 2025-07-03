import api from './api';

export interface KnowledgeCategory {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  icon?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
  parent?: {
    id: number;
    name: string;
  };
  children?: {
    id: number;
    name: string;
    icon?: string;
    color?: string;
  }[];
  _count?: {
    articles: number;
  };
}

export interface KnowledgeArticle {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  categoryId?: number;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  searchKeywords?: string;
  attachments?: any;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
  };
  author: {
    id: number;
    name: string;
    email?: string;
  };
  editor?: {
    id: number;
    name: string;
    email?: string;
  };
}

export interface ArticleSearchParams {
  query?: string;
  categoryId?: number;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  limit?: number;
  offset?: number;
  sortBy?: 'created' | 'updated' | 'views' | 'helpful';
  sortOrder?: 'asc' | 'desc';
}

export interface ArticleSearchResult {
  articles: KnowledgeArticle[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface CreateArticleData {
  title: string;
  content: string;
  excerpt?: string;
  categoryId?: number;
  tags: string[];
  searchKeywords?: string;
  attachments?: File[];
  metadata?: any;
}

export interface UpdateArticleData {
  title?: string;
  content?: string;
  excerpt?: string;
  categoryId?: number;
  tags?: string[];
  searchKeywords?: string;
  attachments?: File[];
  metadata?: any;
}

export interface ArticleFeedback {
  isHelpful: boolean;
  comment?: string;
}

export interface TicketArticleLink {
  id: number;
  articleId: number;
  ticketId: number;
  linkType: 'referenced' | 'resolved_with' | 'related_to';
  createdAt: string;
  article: {
    id: number;
    title: string;
    excerpt?: string;
    viewCount: number;
    helpfulCount: number;
    category?: {
      name: string;
    };
  };
  user: {
    name: string;
  };
}

export interface KnowledgeAnalytics {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  recentViews: number;
  topArticles: Array<{
    id: number;
    title: string;
    viewCount: number;
    helpfulCount: number;
    notHelpfulCount: number;
    category?: {
      name: string;
    };
  }>;
  categoryStats: Array<{
    id: number;
    name: string;
    _count: {
      articles: number;
    };
  }>;
}

class KnowledgeBaseService {
  // Articles

  async searchArticles(params: ArticleSearchParams): Promise<ArticleSearchResult> {
    const queryParams = new URLSearchParams();
    
    if (params.query) queryParams.set('query', params.query);
    if (params.categoryId) queryParams.set('categoryId', params.categoryId.toString());
    if (params.tags) queryParams.set('tags', params.tags.join(','));
    if (params.status) queryParams.set('status', params.status);
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.offset) queryParams.set('offset', params.offset.toString());
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);

    const response = await api.get(`/knowledge-base/articles?${queryParams.toString()}`);
    return response.data;
  }

  async getArticleById(id: number): Promise<KnowledgeArticle> {
    const response = await api.get(`/knowledge-base/articles/${id}`);
    return response.data;
  }

  async getPopularArticles(limit: number = 10): Promise<KnowledgeArticle[]> {
    const response = await api.get(`/knowledge-base/articles/popular?limit=${limit}`);
    return response.data;
  }

  async getRecentArticles(limit: number = 10): Promise<KnowledgeArticle[]> {
    const response = await api.get(`/knowledge-base/articles/recent?limit=${limit}`);
    return response.data;
  }

  async createArticle(data: CreateArticleData): Promise<KnowledgeArticle> {
    const formData = new FormData();
    
    formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.excerpt) formData.append('excerpt', data.excerpt);
    if (data.categoryId) formData.append('categoryId', data.categoryId.toString());
    formData.append('tags', JSON.stringify(data.tags));
    if (data.searchKeywords) formData.append('searchKeywords', data.searchKeywords);
    if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata));
    
    if (data.attachments) {
      data.attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }

    const response = await api.post('/knowledge-base/articles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateArticle(id: number, data: UpdateArticleData): Promise<KnowledgeArticle> {
    const formData = new FormData();
    
    if (data.title) formData.append('title', data.title);
    if (data.content) formData.append('content', data.content);
    if (data.excerpt) formData.append('excerpt', data.excerpt);
    if (data.categoryId) formData.append('categoryId', data.categoryId.toString());
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));
    if (data.searchKeywords) formData.append('searchKeywords', data.searchKeywords);
    if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata));
    
    if (data.attachments) {
      data.attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }

    const response = await api.put(`/knowledge-base/articles/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async publishArticle(id: number): Promise<KnowledgeArticle> {
    const response = await api.put(`/knowledge-base/articles/${id}/publish`);
    return response.data;
  }

  async archiveArticle(id: number): Promise<KnowledgeArticle> {
    const response = await api.put(`/knowledge-base/articles/${id}/archive`);
    return response.data;
  }

  async submitFeedback(id: number, feedback: ArticleFeedback): Promise<any> {
    const response = await api.post(`/knowledge-base/articles/${id}/feedback`, feedback);
    return response.data;
  }

  // Categories

  async getCategories(): Promise<KnowledgeCategory[]> {
    const response = await api.get('/knowledge-base/categories');
    return response.data;
  }

  async getCategoryWithArticles(id: number, limit: number = 20, offset: number = 0): Promise<KnowledgeCategory & { articles: KnowledgeArticle[]; articleCount: number }> {
    const response = await api.get(`/knowledge-base/categories/${id}?limit=${limit}&offset=${offset}`);
    return response.data;
  }

  async createCategory(data: Omit<KnowledgeCategory, 'id' | 'isActive' | 'parent' | 'children' | '_count'>): Promise<KnowledgeCategory> {
    const response = await api.post('/knowledge-base/categories', data);
    return response.data;
  }

  // Ticket Integration

  async linkArticleToTicket(articleId: number, ticketId: number, linkType: 'referenced' | 'resolved_with' | 'related_to'): Promise<TicketArticleLink> {
    const response = await api.post('/knowledge-base/link-to-ticket', {
      articleId,
      ticketId,
      linkType
    });
    return response.data.data;
  }

  async getArticlesForTicket(ticketId: number): Promise<TicketArticleLink[]> {
    const response = await api.get(`/knowledge-base/tickets/${ticketId}/articles`);
    return response.data.data;
  }

  async suggestArticlesForTicket(title: string, description: string, limit: number = 5): Promise<KnowledgeArticle[]> {
    const response = await api.post('/knowledge-base/suggest-for-ticket', {
      title,
      description,
      limit
    });
    return response.data.data;
  }

  // Analytics

  async getAnalytics(days: number = 30): Promise<KnowledgeAnalytics> {
    const response = await api.get(`/knowledge-base/analytics?days=${days}`);
    return response.data.data;
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();