import { PrismaClient, knowledge_status, kb_link_type } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateArticleRequest {
  title: string;
  content: string;
  excerpt?: string;
  categoryId?: number;
  tags: string[];
  searchKeywords?: string;
  attachments?: any;
  metadata?: any;
  authorId: number;
}

export interface UpdateArticleRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  categoryId?: number;
  tags?: string[];
  searchKeywords?: string;
  attachments?: any;
  metadata?: any;
  editorId: number;
}

export interface SearchArticlesRequest {
  query?: string;
  categoryId?: number;
  tags?: string[];
  status?: knowledge_status;
  limit?: number;
  offset?: number;
  sortBy?: 'created' | 'updated' | 'views' | 'helpful';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentId?: number;
  icon?: string;
  color?: string;
  sortOrder?: number;
}

export interface LinkArticleToTicketRequest {
  articleId: number;
  ticketId: number;
  linkType: kb_link_type;
  linkedBy: number;
}

/**
 * Knowledge Base Service
 * Handles all operations related to knowledge articles, categories, and analytics
 */
export class KnowledgeBaseService {

  /**
   * Create a new knowledge article
   */
  async createArticle(data: CreateArticleRequest) {
    const article = await prisma.knowledgeArticle.create({
      data: {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        categoryId: data.categoryId,
        tags: data.tags,
        searchKeywords: data.searchKeywords,
        attachments: data.attachments,
        metadata: data.metadata,
        authorId: data.authorId,
        status: 'draft'
      },
      include: {
        category: { select: { id: true, name: true } },
        author: { select: { id: true, name: true, email: true } }
      }
    });

    return article;
  }

  /**
   * Update an existing article
   */
  async updateArticle(articleId: number, data: UpdateArticleRequest) {
    const article = await prisma.knowledgeArticle.update({
      where: { id: articleId },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        category: { select: { id: true, name: true } },
        author: { select: { id: true, name: true, email: true } },
        editor: { select: { id: true, name: true, email: true } }
      }
    });

    return article;
  }

  /**
   * Publish an article (change status from draft to published)
   */
  async publishArticle(articleId: number, publisherId: number) {
    const article = await prisma.knowledgeArticle.update({
      where: { id: articleId },
      data: {
        status: 'published',
        publishedAt: new Date(),
        editorId: publisherId
      },
      include: {
        category: { select: { id: true, name: true } },
        author: { select: { id: true, name: true } }
      }
    });

    return article;
  }

  /**
   * Archive an article
   */
  async archiveArticle(articleId: number, archiverId: number) {
    const article = await prisma.knowledgeArticle.update({
      where: { id: articleId },
      data: {
        status: 'archived',
        editorId: archiverId
      }
    });

    return article;
  }

  /**
   * Get article by ID with view tracking
   */
  async getArticleById(articleId: number, userId?: number, ipAddress?: string, userAgent?: string) {
    // Get the article
    const article = await prisma.knowledgeArticle.findUnique({
      where: { id: articleId },
      include: {
        category: { select: { id: true, name: true } },
        author: { select: { id: true, name: true, email: true } },
        editor: { select: { id: true, name: true, email: true } },
        ticketLinks: {
          include: {
            ticket: { select: { id: true, title: true, status: true } },
            user: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (!article) {
      return null;
    }

    // Track the view (only for published articles)
    if (article.status === 'published') {
      await this.trackArticleView(articleId, userId, ipAddress, userAgent);
      
      // Increment view count
      await prisma.knowledgeArticle.update({
        where: { id: articleId },
        data: { viewCount: { increment: 1 } }
      });
    }

    return {
      ...article,
      viewCount: article.viewCount + 1
    };
  }

  /**
   * Search articles with full-text search and filtering
   */
  async searchArticles(params: SearchArticlesRequest) {
    const {
      query,
      categoryId,
      tags,
      status = 'published',
      limit = 20,
      offset = 0,
      sortBy = 'updated',
      sortOrder = 'desc'
    } = params;

    const whereClause: any = {
      status: status
    };

    // Add category filter
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    // Add tag filter
    if (tags && tags.length > 0) {
      whereClause.tags = {
        hasEvery: tags
      };
    }

    // Add search query (using title, content, and searchKeywords)
    if (query) {
      whereClause.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { searchKeywords: { contains: query, mode: 'insensitive' } },
        { excerpt: { contains: query, mode: 'insensitive' } }
      ];
    }

    // Build order by clause
    let orderBy: any = {};
    switch (sortBy) {
      case 'created':
        orderBy = { createdAt: sortOrder };
        break;
      case 'updated':
        orderBy = { updatedAt: sortOrder };
        break;
      case 'views':
        orderBy = { viewCount: sortOrder };
        break;
      case 'helpful':
        orderBy = { helpfulCount: sortOrder };
        break;
      default:
        orderBy = { updatedAt: sortOrder };
    }

    const [articles, total] = await Promise.all([
      prisma.knowledgeArticle.findMany({
        where: whereClause,
        include: {
          category: { select: { id: true, name: true } },
          author: { select: { id: true, name: true } }
        },
        orderBy,
        skip: offset,
        take: limit
      }),
      prisma.knowledgeArticle.count({ where: whereClause })
    ]);

    return {
      articles,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    };
  }

  /**
   * Get articles by category with pagination
   */
  async getArticlesByCategory(categoryId: number, limit = 20, offset = 0) {
    const [articles, total] = await Promise.all([
      prisma.knowledgeArticle.findMany({
        where: {
          categoryId: categoryId,
          status: 'published'
        },
        include: {
          category: { select: { id: true, name: true } },
          author: { select: { id: true, name: true } }
        },
        orderBy: { updatedAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.knowledgeArticle.count({
        where: {
          categoryId: categoryId,
          status: 'published'
        }
      })
    ]);

    return {
      articles,
      total,
      hasMore: offset + limit < total
    };
  }

  /**
   * Get popular articles (most viewed)
   */
  async getPopularArticles(limit = 10) {
    const articles = await prisma.knowledgeArticle.findMany({
      where: { status: 'published' },
      include: {
        category: { select: { id: true, name: true } },
        author: { select: { id: true, name: true } }
      },
      orderBy: { viewCount: 'desc' },
      take: limit
    });

    return articles;
  }

  /**
   * Get recent articles
   */
  async getRecentArticles(limit = 10) {
    const articles = await prisma.knowledgeArticle.findMany({
      where: { status: 'published' },
      include: {
        category: { select: { id: true, name: true } },
        author: { select: { id: true, name: true } }
      },
      orderBy: { publishedAt: 'desc' },
      take: limit
    });

    return articles;
  }

  /**
   * Track article view
   */
  private async trackArticleView(articleId: number, userId?: number, ipAddress?: string, userAgent?: string) {
    await prisma.knowledgeArticleView.create({
      data: {
        articleId,
        userId,
        ipAddress,
        userAgent
      }
    });
  }

  /**
   * Submit article feedback
   */
  async submitFeedback(articleId: number, userId: number | null, isHelpful: boolean, comment?: string, ipAddress?: string) {
    // Check if feedback already exists for this user/IP
    const existingFeedback = await prisma.knowledgeArticleFeedback.findFirst({
      where: {
        articleId,
        OR: [
          { userId: userId || undefined },
          { ipAddress: ipAddress || undefined }
        ]
      }
    });

    if (existingFeedback) {
      throw new Error('Feedback already submitted for this article');
    }

    // Create feedback
    const feedback = await prisma.knowledgeArticleFeedback.create({
      data: {
        articleId,
        userId,
        isHelpful,
        comment,
        ipAddress
      }
    });

    // Update article counters
    if (isHelpful) {
      await prisma.knowledgeArticle.update({
        where: { id: articleId },
        data: { helpfulCount: { increment: 1 } }
      });
    } else {
      await prisma.knowledgeArticle.update({
        where: { id: articleId },
        data: { notHelpfulCount: { increment: 1 } }
      });
    }

    return feedback;
  }

  /**
   * Link article to ticket
   */
  async linkArticleToTicket(data: LinkArticleToTicketRequest) {
    const link = await prisma.knowledgeTicketLink.create({
      data: {
        articleId: data.articleId,
        ticketId: data.ticketId,
        linkType: data.linkType,
        linkedBy: data.linkedBy
      },
      include: {
        article: { select: { id: true, title: true } },
        ticket: { select: { id: true, title: true } },
        user: { select: { id: true, name: true } }
      }
    });

    return link;
  }

  /**
   * Get articles linked to a ticket
   */
  async getArticlesForTicket(ticketId: number) {
    const links = await prisma.knowledgeTicketLink.findMany({
      where: { ticketId },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            excerpt: true,
            viewCount: true,
            helpfulCount: true,
            category: { select: { name: true } }
          }
        },
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return links;
  }

  /**
   * Category Management
   */

  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryRequest) {
    const category = await prisma.knowledgeCategory.create({
      data: {
        name: data.name,
        description: data.description,
        parentId: data.parentId,
        icon: data.icon,
        color: data.color,
        sortOrder: data.sortOrder || 0
      },
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { articles: true } }
      }
    });

    return category;
  }

  /**
   * Get all categories in hierarchical structure
   */
  async getCategories() {
    const categories = await prisma.knowledgeCategory.findMany({
      where: { isActive: true },
      include: {
        parent: { select: { id: true, name: true } },
        children: {
          where: { isActive: true },
          select: { id: true, name: true, icon: true, color: true }
        },
        _count: { select: { articles: true } }
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
    });

    return categories;
  }

  /**
   * Get category with articles
   */
  async getCategoryWithArticles(categoryId: number, limit = 20, offset = 0) {
    const category = await prisma.knowledgeCategory.findUnique({
      where: { id: categoryId },
      include: {
        parent: { select: { id: true, name: true } },
        children: {
          where: { isActive: true },
          select: { id: true, name: true, icon: true, color: true }
        }
      }
    });

    if (!category) {
      return null;
    }

    const { articles, total } = await this.getArticlesByCategory(categoryId, limit, offset);

    return {
      ...category,
      articles,
      articleCount: total
    };
  }

  /**
   * Analytics and Statistics
   */

  /**
   * Get knowledge base analytics
   */
  async getAnalytics(days = 30) {
    const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));

    const [
      totalArticles,
      publishedArticles,
      totalViews,
      recentViews,
      topArticles,
      categoryStats
    ] = await Promise.all([
      // Total articles
      prisma.knowledgeArticle.count(),
      
      // Published articles
      prisma.knowledgeArticle.count({ where: { status: 'published' } }),
      
      // Total views
      prisma.knowledgeArticleView.count(),
      
      // Recent views
      prisma.knowledgeArticleView.count({
        where: { viewedAt: { gte: startDate } }
      }),
      
      // Top articles by views
      prisma.knowledgeArticle.findMany({
        where: { status: 'published' },
        select: {
          id: true,
          title: true,
          viewCount: true,
          helpfulCount: true,
          notHelpfulCount: true,
          category: { select: { name: true } }
        },
        orderBy: { viewCount: 'desc' },
        take: 10
      }),
      
      // Category statistics
      prisma.knowledgeCategory.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          _count: { select: { articles: true } }
        },
        orderBy: { articles: { _count: 'desc' } }
      })
    ]);

    return {
      totalArticles,
      publishedArticles,
      draftArticles: totalArticles - publishedArticles,
      totalViews,
      recentViews,
      topArticles,
      categoryStats
    };
  }

  /**
   * Suggest articles based on ticket content
   */
  async suggestArticlesForTicket(ticketTitle: string, ticketDescription: string, limit = 5) {
    const searchText = `${ticketTitle} ${ticketDescription}`.toLowerCase();
    
    // Extract keywords (simple approach - can be enhanced with NLP)
    const keywords = searchText
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 10); // Take first 10 meaningful words

    if (keywords.length === 0) {
      return [];
    }

    const articles = await prisma.knowledgeArticle.findMany({
      where: {
        status: 'published',
        OR: keywords.map(keyword => ({
          OR: [
            { title: { contains: keyword, mode: 'insensitive' } },
            { content: { contains: keyword, mode: 'insensitive' } },
            { searchKeywords: { contains: keyword, mode: 'insensitive' } },
            { tags: { has: keyword } }
          ]
        }))
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        viewCount: true,
        helpfulCount: true,
        category: { select: { name: true } }
      },
      orderBy: [
        { helpfulCount: 'desc' },
        { viewCount: 'desc' }
      ],
      take: limit
    });

    return articles;
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();