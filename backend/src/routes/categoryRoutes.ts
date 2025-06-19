// backend/src/routes/categoryRoutes.ts
import express, { Request, Response, NextFunction, Router } from 'express';
import { query } from '../db';
import { protect, authorize } from '../middleware/authMiddleware'; // Assuming you might want to protect some routes

const router: Router = express.Router();

// Utility to handle async route errors
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// @route   GET /api/categories
// @desc    Get all top-level categories
// @access  Public (or protect as needed, e.g., protect, authorize(['admin', 'manager', 'technician', 'requester']))
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM categories ORDER BY name ASC');
  res.json(result.rows);
}));

// @route   GET /api/categories/:categoryId/subcategories
// @desc    Get all sub-categories for a given category ID
// @access  Public (or protect as needed)
router.get('/:categoryId/subcategories', asyncHandler(async (req: Request, res: Response) => {
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
