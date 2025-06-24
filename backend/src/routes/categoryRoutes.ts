// backend/src/routes/categoryRoutes.ts
// DEPRECATED: This file contains legacy category routes that have been replaced by service catalogs
// Stage 5 Migration: Use /api/service-catalog endpoints instead
// TODO: Remove in Stage 5 cleanup after confirming no external dependencies
import express, { Request, Response, NextFunction, Router } from 'express';
import { query } from '../db';

const router: Router = express.Router();

// Deprecation warning middleware
const deprecationWarning = (endpoint: string, replacement: string) => {
  return (req: any, res: any, next: any) => {
    console.warn(`⚠️  DEPRECATED: ${req.method} ${endpoint} is deprecated. Use ${replacement} instead.`);
    console.warn(`⚠️  Called by: ${req.get('User-Agent') || 'Unknown'} from ${req.ip}`);
    res.setHeader('X-Deprecated-Endpoint', endpoint);
    res.setHeader('X-Replacement-Endpoint', replacement);
    next();
  };
};

// Utility to handle async route errors
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// @route   GET /api/categories
// @desc    Get all top-level categories
// @access  Public (or protect as needed, e.g., protect, authorize(['admin', 'manager', 'technician', 'requester']))
// DEPRECATED: Use /api/service-catalog/services instead
router.get('/', deprecationWarning('/api/categories', '/api/service-catalog/services'), asyncHandler(async (req: Request, res: Response) => {
  const result = await query(`
    SELECT 
      c.id,
      c.name,
      c.department_id,
      d.name as department_name,
      d.description as department_description,
      d.department_type
    FROM categories c
    LEFT JOIN departments d ON c.department_id = d.id
    ORDER BY c.name ASC
  `);
  res.json(result.rows);
}));

// @route   GET /api/categories/:categoryId/subcategories
// @desc    Get all sub-categories for a given category ID
// @access  Public (or protect as needed)
// DEPRECATED: Use /api/service-catalog/services instead
router.get('/:categoryId/subcategories', deprecationWarning('/api/categories/:categoryId/subcategories', '/api/service-catalog/services'), asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const result = await query('SELECT * FROM sub_categories WHERE category_id = $1 ORDER BY name ASC', [categoryId]);
  if (result.rows.length === 0) {
    // Optionally, return 404 if no subcategories found or just an empty array
    // return res.status(404).json({ message: 'No sub-categories found for this category or category does not exist.' });
  }
  res.json(result.rows);
}));

// @route   GET /api/categories/items-by-subcategory/:subcategoryId
// @desc    Get all items for a given sub-category ID
// @access  Public (or protect as needed)
router.get('/items-by-subcategory/:subcategoryId', asyncHandler(async (req: Request, res: Response) => {
  const { subcategoryId } = req.params;
  const result = await query('SELECT * FROM items WHERE sub_category_id = $1 ORDER BY name ASC', [subcategoryId]);
  // Consider adding similar 404 handling as in subcategories if no items are found
  res.json(result.rows);
}));

// @route   GET /api/categories/templates-by-item/:itemId
// @desc    Get all ticket templates for a given item ID
// @access  Public (or protect as needed)
router.get('/templates-by-item/:itemId', asyncHandler(async (req: Request, res: Response) => {
  const { itemId } = req.params;
  const result = await query('SELECT * FROM ticket_templates WHERE item_id = $1 ORDER BY name ASC', [itemId]);
  res.json(result.rows);
}));

// @route   GET /api/categories/custom-fields-by-template/:templateId
// @desc    Get all custom field definitions for a given ticket template ID
// @access  Public (or protect as needed)
router.get('/custom-fields-by-template/:templateId', asyncHandler(async (req: Request, res: Response) => {
  const { templateId } = req.params;
  const result = await query('SELECT * FROM custom_field_definitions WHERE template_id = $1 ORDER BY id ASC', [templateId]); // Order by id or a specific order column if you add one
  res.json(result.rows);
}));


// Error handling middleware for this router (optional, can be handled globally)
router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error in categoryRoutes:", err.stack);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
});

export default router;
