import express, { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { protect, AuthenticatedRequest } from '../middleware/authMiddleware';
import asyncHandler from '../utils/asyncHandler';
import { knowledgeBaseService } from '../services/knowledgeBaseService';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// File upload configuration for article attachments
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'kb-attachments');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `kb-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|csv|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only common file types are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Validation helper
const handleValidationErrors = (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  return null;
};

// Article Routes

// @route   GET /api/knowledge-base/articles
// @desc    Search and list articles with filtering
// @access  Public (for published articles)
router.get('/articles', 
  [
    query('query').optional().trim(),
    query('categoryId').optional().isInt({ min: 1 }),
    query('tags').optional(),
    query('status').optional().isIn(['draft', 'published', 'archived']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
    query('sortBy').optional().isIn(['created', 'updated', 'views', 'helpful']),
    query('sortOrder').optional().isIn(['asc', 'desc'])
  ],
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const {
      query: searchQuery,
      categoryId,
      tags,
      status = 'published',
      limit = 20,
      offset = 0,
      sortBy = 'updated',
      sortOrder = 'desc'
    } = req.query as any;

    // Parse tags if provided as comma-separated string
    let parsedTags;
    if (tags && typeof tags === 'string') {
      parsedTags = tags.split(',').map(tag => tag.trim());
    }

    const result = await knowledgeBaseService.searchArticles({
      query: searchQuery,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      tags: parsedTags,
      status: status,
      limit: parseInt(limit),
      offset: parseInt(offset),
      sortBy,
      sortOrder
    });

    res.json({
      success: true,
      data: result
    });
  })
);

// @route   GET /api/knowledge-base/articles/popular
// @desc    Get popular articles
// @access  Public
router.get('/articles/popular',
  [query('limit').optional().isInt({ min: 1, max: 50 })],
  asyncHandler(async (req: Request, res: Response) => {
    const { limit = 10 } = req.query as any;
    
    const articles = await knowledgeBaseService.getPopularArticles(parseInt(limit));
    
    res.json({
      success: true,
      data: articles
    });
  })
);

// @route   GET /api/knowledge-base/articles/recent
// @desc    Get recent articles
// @access  Public
router.get('/articles/recent',
  [query('limit').optional().isInt({ min: 1, max: 50 })],
  asyncHandler(async (req: Request, res: Response) => {
    const { limit = 10 } = req.query as any;
    
    const articles = await knowledgeBaseService.getRecentArticles(parseInt(limit));
    
    res.json({
      success: true,
      data: articles
    });
  })
);

// @route   GET /api/knowledge-base/articles/:id
// @desc    Get specific article with view tracking
// @access  Public
router.get('/articles/:id',
  [param('id').isInt({ min: 1 })],
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const articleId = parseInt(req.params.id);
    const userId = req.user?.id;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    const article = await knowledgeBaseService.getArticleById(
      articleId, 
      userId, 
      ipAddress, 
      userAgent
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.json({
      success: true,
      data: article
    });
  })
);

// @route   POST /api/knowledge-base/articles
// @desc    Create new article
// @access  Private (authenticated users)
router.post('/articles',
  protect,
  upload.array('attachments', 3),
  [
    body('title').notEmpty().trim().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('excerpt').optional().trim(),
    body('categoryId').optional().isInt({ min: 1 }),
    body('tags').optional(),
    body('searchKeywords').optional().trim(),
    body('metadata').optional().isJSON()
  ],
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { title, content, excerpt, categoryId, searchKeywords, metadata } = req.body;
    const authorId = req.user!.id;

    // Parse tags from JSON string if it exists
    let parsedTags: string[] = [];
    if (req.body.tags) {
      try {
        parsedTags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
      } catch (error) {
        parsedTags = [];
      }
    }

    // Handle file attachments
    let attachments = null;
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype
      }));
    }

    const article = await knowledgeBaseService.createArticle({
      title,
      content,
      excerpt,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      tags: parsedTags,
      searchKeywords,
      attachments,
      metadata: metadata ? JSON.parse(metadata) : undefined,
      authorId
    });

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: article
    });
  })
);

// @route   PUT /api/knowledge-base/articles/:id
// @desc    Update article
// @access  Private (author or admin)
router.put('/articles/:id',
  protect,
  upload.array('attachments', 3),
  [
    param('id').isInt({ min: 1 }),
    body('title').optional().trim(),
    body('content').optional(),
    body('excerpt').optional().trim(),
    body('categoryId').optional().isInt({ min: 1 }),
    body('tags').optional(),
    body('searchKeywords').optional().trim(),
    body('metadata').optional().isJSON()
  ],
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const articleId = parseInt(req.params.id);
    const editorId = req.user!.id;
    const updateData = { ...req.body, editorId };

    // Parse tags from JSON string if it exists
    if (updateData.tags) {
      try {
        updateData.tags = typeof updateData.tags === 'string' ? JSON.parse(updateData.tags) : updateData.tags;
      } catch (error) {
        updateData.tags = [];
      }
    }

    // Handle file attachments if provided
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      updateData.attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype
      }));
    }

    if (updateData.metadata) {
      updateData.metadata = JSON.parse(updateData.metadata);
    }

    const article = await knowledgeBaseService.updateArticle(articleId, updateData);

    res.json({
      success: true,
      message: 'Article updated successfully',
      data: article
    });
  })
);

// @route   PUT /api/knowledge-base/articles/:id/publish
// @desc    Publish article
// @access  Private (admin or editor)
router.put('/articles/:id/publish',
  protect,
  [param('id').isInt({ min: 1 })],
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const articleId = parseInt(req.params.id);
    const publisherId = req.user!.id;

    const article = await knowledgeBaseService.publishArticle(articleId, publisherId);

    res.json({
      success: true,
      message: 'Article published successfully',
      data: article
    });
  })
);

// @route   PUT /api/knowledge-base/articles/:id/archive
// @desc    Archive article
// @access  Private (admin or editor)
router.put('/articles/:id/archive',
  protect,
  [param('id').isInt({ min: 1 })],
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const articleId = parseInt(req.params.id);
    const archiverId = req.user!.id;

    const article = await knowledgeBaseService.archiveArticle(articleId, archiverId);

    res.json({
      success: true,
      message: 'Article archived successfully',
      data: article
    });
  })
);

// @route   POST /api/knowledge-base/articles/:id/feedback
// @desc    Submit article feedback
// @access  Public
router.post('/articles/:id/feedback',
  [
    param('id').isInt({ min: 1 }),
    body('isHelpful').isBoolean(),
    body('comment').optional().trim()
  ],
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const articleId = parseInt(req.params.id);
    const { isHelpful, comment } = req.body;
    const userId = req.user?.id || null;
    const ipAddress = req.ip;

    try {
      const feedback = await knowledgeBaseService.submitFeedback(
        articleId,
        userId,
        isHelpful,
        comment,
        ipAddress
      );

      res.json({
        success: true,
        message: 'Feedback submitted successfully',
        data: feedback
      });
    } catch (error: any) {
      if (error.message === 'Feedback already submitted for this article') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      throw error;
    }
  })
);

// Category Routes

// @route   GET /api/knowledge-base/categories
// @desc    Get all categories
// @access  Public
router.get('/categories',
  asyncHandler(async (req: Request, res: Response) => {
    const categories = await knowledgeBaseService.getCategories();
    
    res.json({
      success: true,
      data: categories
    });
  })
);

// @route   GET /api/knowledge-base/categories/:id
// @desc    Get category with articles
// @access  Public
router.get('/categories/:id',
  [
    param('id').isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const categoryId = parseInt(req.params.id);
    const { limit = 20, offset = 0 } = req.query as any;

    const category = await knowledgeBaseService.getCategoryWithArticles(
      categoryId,
      parseInt(limit),
      parseInt(offset)
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  })
);

// @route   POST /api/knowledge-base/categories
// @desc    Create new category
// @access  Private (admin)
router.post('/categories',
  protect,
  [
    body('name').notEmpty().trim().withMessage('Category name is required'),
    body('description').optional().trim(),
    body('parentId').optional().isInt({ min: 1 }),
    body('icon').optional().trim(),
    body('color').optional().trim(),
    body('sortOrder').optional().isInt({ min: 0 })
  ],
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const category = await knowledgeBaseService.createCategory(req.body);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  })
);

// Ticket Integration Routes

// @route   POST /api/knowledge-base/link-to-ticket
// @desc    Link article to ticket
// @access  Private
router.post('/link-to-ticket',
  protect,
  [
    body('articleId').isInt({ min: 1 }),
    body('ticketId').isInt({ min: 1 }),
    body('linkType').isIn(['referenced', 'resolved_with', 'related_to'])
  ],
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { articleId, ticketId, linkType } = req.body;
    const linkedBy = req.user!.id;

    const link = await knowledgeBaseService.linkArticleToTicket({
      articleId,
      ticketId,
      linkType,
      linkedBy
    });

    res.json({
      success: true,
      message: 'Article linked to ticket successfully',
      data: link
    });
  })
);

// @route   GET /api/knowledge-base/tickets/:ticketId/articles
// @desc    Get articles linked to a ticket
// @access  Private
router.get('/tickets/:ticketId/articles',
  protect,
  [param('ticketId').isInt({ min: 1 })],
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const ticketId = parseInt(req.params.ticketId);
    const articles = await knowledgeBaseService.getArticlesForTicket(ticketId);

    res.json({
      success: true,
      data: articles
    });
  })
);

// @route   POST /api/knowledge-base/suggest-for-ticket
// @desc    Get article suggestions for ticket content
// @access  Private
router.post('/suggest-for-ticket',
  protect,
  [
    body('title').notEmpty().trim(),
    body('description').notEmpty().trim(),
    body('limit').optional().isInt({ min: 1, max: 20 })
  ],
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { title, description, limit = 5 } = req.body;

    const suggestions = await knowledgeBaseService.suggestArticlesForTicket(
      title,
      description,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: suggestions
    });
  })
);

// Analytics Routes

// @route   GET /api/knowledge-base/analytics
// @desc    Get knowledge base analytics
// @access  Private (admin)
router.get('/analytics',
  protect,
  [query('days').optional().isInt({ min: 1, max: 365 })],
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { days = 30 } = req.query as any;
    
    const analytics = await knowledgeBaseService.getAnalytics(parseInt(days));
    
    res.json({
      success: true,
      data: analytics
    });
  })
);

export default router;