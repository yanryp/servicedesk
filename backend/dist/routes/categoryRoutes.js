"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/categoryRoutes.ts
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const router = express_1.default.Router();
// Utility to handle async route errors
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
// @route   GET /api/categories
// @desc    Get all top-level categories
// @access  Public (or protect as needed, e.g., protect, authorize(['admin', 'manager', 'technician', 'requester']))
router.get('/', asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, db_1.query)('SELECT * FROM categories ORDER BY name ASC');
    res.json(result.rows);
})));
// @route   GET /api/categories/:categoryId/subcategories
// @desc    Get all sub-categories for a given category ID
// @access  Public (or protect as needed)
router.get('/:categoryId/subcategories', asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId } = req.params;
    const result = yield (0, db_1.query)('SELECT * FROM sub_categories WHERE category_id = $1 ORDER BY name ASC', [categoryId]);
    if (result.rows.length === 0) {
        // Optionally, return 404 if no subcategories found or just an empty array
        // return res.status(404).json({ message: 'No sub-categories found for this category or category does not exist.' });
    }
    res.json(result.rows);
})));
// @route   GET /api/categories/items-by-subcategory/:subcategoryId
// @desc    Get all items for a given sub-category ID
// @access  Public (or protect as needed)
router.get('/items-by-subcategory/:subcategoryId', asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { subcategoryId } = req.params;
    const result = yield (0, db_1.query)('SELECT * FROM items WHERE sub_category_id = $1 ORDER BY name ASC', [subcategoryId]);
    // Consider adding similar 404 handling as in subcategories if no items are found
    res.json(result.rows);
})));
// @route   GET /api/categories/templates-by-item/:itemId
// @desc    Get all ticket templates for a given item ID
// @access  Public (or protect as needed)
router.get('/templates-by-item/:itemId', asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemId } = req.params;
    const result = yield (0, db_1.query)('SELECT * FROM ticket_templates WHERE item_id = $1 ORDER BY name ASC', [itemId]);
    res.json(result.rows);
})));
// @route   GET /api/categories/custom-fields-by-template/:templateId
// @desc    Get all custom field definitions for a given ticket template ID
// @access  Public (or protect as needed)
router.get('/custom-fields-by-template/:templateId', asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { templateId } = req.params;
    const result = yield (0, db_1.query)('SELECT * FROM custom_field_definitions WHERE template_id = $1 ORDER BY id ASC', [templateId]); // Order by id or a specific order column if you add one
    res.json(result.rows);
})));
// Error handling middleware for this router (optional, can be handled globally)
router.use((err, req, res, next) => {
    console.error("Error in categoryRoutes:", err.stack);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ message });
});
exports.default = router;
