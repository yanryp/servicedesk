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
// backend/src/routes/templateRoutes.ts
// DEPRECATED: This file contains legacy template routes that have been replaced by service templates and BSG templates
// Stage 5 Migration: Use /api/service-templates or /api/bsg-templates endpoints instead
// TODO: Remove in Stage 5 cleanup after confirming no external dependencies
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const db_1 = require("../db");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Deprecation warning middleware
const deprecationWarning = (endpoint, replacement) => {
    return (req, res, next) => {
        console.warn(`⚠️  DEPRECATED: ${req.method} ${endpoint} is deprecated. Use ${replacement} instead.`);
        console.warn(`⚠️  Called by: ${req.get('User-Agent') || 'Unknown'} from ${req.ip}`);
        res.setHeader('X-Deprecated-Endpoint', endpoint);
        res.setHeader('X-Replacement-Endpoint', replacement);
        next();
    };
};
// Utility to handle async route errors (consider moving to a shared utils file)
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
// @route   POST /api/templates
// @desc    Create a new ticket template
// @access  Private (Admin, Manager)
// DEPRECATED: Use /api/service-templates or /api/bsg-templates instead
router.post('/', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin', 'manager'), deprecationWarning('/api/templates', '/api/service-templates'), [
    (0, express_validator_1.body)('name', 'Template name is required').not().isEmpty().trim().escape(),
    (0, express_validator_1.body)('description').optional().trim().escape(),
    (0, express_validator_1.body)('item_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Item ID must be an integer if provided'),
], asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, description, item_id } = req.body;
    try {
        const result = yield (0, db_1.query)('INSERT INTO ticket_templates (name, description, item_id) VALUES ($1, $2, $3) RETURNING *', [name, description, item_id === undefined ? null : item_id] // Ensure item_id is null if not provided
        );
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        // Handle potential unique constraint violation for name or other DB errors
        if (err.code === '23505') { // Unique violation
            return res.status(400).json({ message: 'A template with this name already exists.' });
        }
        console.error(err.message);
        res.status(500).send('Server error');
    }
})));
// @route   GET /api/templates
// @desc    Get all ticket templates
// @access  Private (Admin, Manager, Technician)
router.get('/', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin', 'manager', 'technician'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, db_1.query)('SELECT * FROM ticket_templates ORDER BY name ASC');
        res.json(result.rows);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
})));
// @route   GET /api/templates/:templateId
// @desc    Get a specific ticket template by ID, including its custom fields
// @access  Private (Admin, Manager, Technician)
router.get('/:templateId', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin', 'manager', 'technician'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { templateId } = req.params;
    // Basic validation for templateId
    if (isNaN(parseInt(templateId, 10))) {
        return res.status(400).json({ message: 'Template ID must be an integer.' });
    }
    try {
        const templateResult = yield (0, db_1.query)('SELECT * FROM ticket_templates WHERE id = $1', [templateId]);
        if (templateResult.rows.length === 0) {
            return res.status(404).json({ message: 'Template not found.' });
        }
        const template = templateResult.rows[0];
        const fieldsResult = yield (0, db_1.query)('SELECT * FROM custom_field_definitions WHERE template_id = $1 ORDER BY id ASC', [templateId]);
        template.custom_fields = fieldsResult.rows;
        res.json(template);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
})));
// @route   PUT /api/templates/:templateId
// @desc    Update an existing ticket template
// @access  Private (Admin, Manager)
router.put('/:templateId', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin', 'manager'), [
    (0, express_validator_1.body)('name').optional().not().isEmpty().withMessage('Template name cannot be empty').trim().escape(),
    (0, express_validator_1.body)('description').optional().trim().escape(),
    (0, express_validator_1.body)('item_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Item ID must be an integer if provided'),
], asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { templateId } = req.params;
    const errors = (0, express_validator_1.validationResult)(req);
    if (isNaN(parseInt(templateId, 10))) {
        return res.status(400).json({ message: 'Template ID must be an integer.' });
    }
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, description, item_id } = req.body;
    try {
        // Check if template exists
        const existingTemplate = yield (0, db_1.query)('SELECT * FROM ticket_templates WHERE id = $1', [templateId]);
        if (existingTemplate.rows.length === 0) {
            return res.status(404).json({ message: 'Template not found.' });
        }
        // Build the update query dynamically
        const updateFields = [];
        let queryIndex = 1;
        if (name !== undefined) {
            updateFields.push({ name: 'name', value: name, column: 'name' });
        }
        if (description !== undefined) {
            updateFields.push({ name: 'description', value: description, column: 'description' });
        }
        // item_id can be set to null or a value
        if (req.body.hasOwnProperty('item_id')) { // Check if item_id was explicitly passed
            updateFields.push({ name: 'item_id', value: item_id, column: 'item_id' });
        }
        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No update fields provided.' });
        }
        const setClauses = updateFields.map(field => `${field.column} = $${queryIndex++}`).join(', ');
        const values = updateFields.map(field => field.value);
        values.push(templateId); // For the WHERE id = $N clause
        const updateQuery = `UPDATE ticket_templates SET ${setClauses}, updated_at = CURRENT_TIMESTAMP WHERE id = $${queryIndex} RETURNING *`;
        const result = yield (0, db_1.query)(updateQuery, values);
        res.json(result.rows[0]);
    }
    catch (err) {
        if (err.code === '23505') { // Unique constraint violation for name
            return res.status(400).json({ message: 'A template with this name already exists.' });
        }
        console.error(err.message);
        res.status(500).send('Server error');
    }
})));
// @route   DELETE /api/templates/:templateId
// @desc    Delete a ticket template
// @access  Private (Admin, Manager)
router.delete('/:templateId', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin', 'manager'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { templateId } = req.params;
    if (isNaN(parseInt(templateId, 10))) {
        return res.status(400).json({ message: 'Template ID must be an integer.' });
    }
    try {
        const existingTemplate = yield (0, db_1.query)('SELECT * FROM ticket_templates WHERE id = $1', [templateId]);
        if (existingTemplate.rows.length === 0) {
            return res.status(404).json({ message: 'Template not found.' });
        }
        // Assuming ON DELETE CASCADE is set for custom_field_definitions referencing template_id
        yield (0, db_1.query)('DELETE FROM ticket_templates WHERE id = $1', [templateId]);
        res.status(200).json({ message: 'Template deleted successfully.' });
    }
    catch (err) {
        // Check for foreign key constraint violation if tickets are using this template
        if (err.code === '23503') { // foreign_key_violation
            return res.status(400).json({ message: 'Cannot delete template. It is currently in use by one or more tickets.' });
        }
        console.error(err.message);
        res.status(500).send('Server error');
    }
})));
// Custom Field Definition Routes
const validFieldTypes = ['text', 'textarea', 'dropdown', 'checkbox', 'radio', 'date', 'number'];
// @route   POST /api/templates/:templateId/fields
// @desc    Create a new custom field definition for a template
// @access  Private (Admin, Manager)
router.post('/:templateId/fields', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin', 'manager'), [
    (0, express_validator_1.body)('field_name', 'Field name is required').not().isEmpty().trim().escape(),
    (0, express_validator_1.body)('field_type', 'Field type is required').isIn(validFieldTypes)
        .withMessage(`Field type must be one of: ${validFieldTypes.join(', ')}`),
    (0, express_validator_1.body)('options').optional().isArray().withMessage('Options must be an array of strings.')
        .custom((options, { req }) => {
        const fieldType = req.body.field_type;
        if (['dropdown', 'checkbox', 'radio'].includes(fieldType)) {
            if (!options || options.length === 0) {
                throw new Error('Options are required for dropdown, checkbox, or radio field types.');
            }
            if (!options.every((opt) => typeof opt === 'string')) {
                throw new Error('All options must be strings.');
            }
        }
        return true;
    }),
    (0, express_validator_1.body)('is_required').optional().isBoolean().toBoolean(),
    (0, express_validator_1.body)('sort_order').optional().isInt({ min: 0 }).toInt(),
], asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { templateId } = req.params;
    const errors = (0, express_validator_1.validationResult)(req);
    if (isNaN(parseInt(templateId, 10))) {
        return res.status(400).json({ message: 'Template ID must be an integer.' });
    }
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { field_name, field_type, options, is_required, sort_order: initial_sort_order } = req.body;
    try {
        // Check if template exists
        const templateExists = yield (0, db_1.query)('SELECT id FROM ticket_templates WHERE id = $1', [templateId]);
        if (templateExists.rows.length === 0) {
            return res.status(404).json({ message: 'Template not found.' });
        }
        let final_sort_order = initial_sort_order;
        if (initial_sort_order === undefined) {
            const sortOrderResult = yield (0, db_1.query)('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_sort_order FROM custom_field_definitions WHERE template_id = $1', [templateId]);
            final_sort_order = sortOrderResult.rows[0].next_sort_order;
        }
        const newField = yield (0, db_1.query)(`INSERT INTO custom_field_definitions 
         (template_id, field_name, field_type, options, is_required, sort_order) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [templateId, field_name, field_type, options || null, is_required === undefined ? false : is_required, final_sort_order]);
        res.status(201).json(newField.rows[0]);
    }
    catch (err) {
        if (err.code === '23505') { // Unique constraint violation (e.g., template_id, field_name)
            return res.status(400).json({ message: `A field named "${field_name}" already exists for this template.` });
        }
        console.error(err.message);
        res.status(500).send('Server error');
    }
})));
// @route   PUT /api/templates/:templateId/fields/:fieldId
// @desc    Update an existing custom field definition
// @access  Private (Admin, Manager)
router.put('/:templateId/fields/:fieldId', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin', 'manager'), [
    (0, express_validator_1.body)('field_name').optional().not().isEmpty().trim().escape(),
    (0, express_validator_1.body)('field_type').optional().isIn(validFieldTypes)
        .withMessage(`Field type must be one of: ${validFieldTypes.join(', ')}`),
    (0, express_validator_1.body)('options').optional().isArray().withMessage('Options must be an array of strings.')
        .custom((options, { req }) => {
        const fieldType = req.body.field_type; // If field_type is not being updated, this will be undefined.
        // We need to fetch existing field_type if not provided.
        if (fieldType && ['dropdown', 'checkbox', 'radio'].includes(fieldType)) {
            if (!options || options.length === 0) {
                throw new Error('Options are required for dropdown, checkbox, or radio field types if field_type is set to one of these.');
            }
            if (!options.every((opt) => typeof opt === 'string')) {
                throw new Error('All options must be strings.');
            }
        }
        return true;
    }),
    (0, express_validator_1.body)('is_required').optional().isBoolean().toBoolean(),
    (0, express_validator_1.body)('sort_order').optional().isInt({ min: 0 }).toInt(),
], asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { templateId, fieldId } = req.params;
    const errors = (0, express_validator_1.validationResult)(req);
    if (isNaN(parseInt(templateId, 10)) || isNaN(parseInt(fieldId, 10))) {
        return res.status(400).json({ message: 'Template ID and Field ID must be integers.' });
    }
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { field_name, field_type, options, is_required, sort_order } = req.body;
    let existingField; // Declare here for wider scope
    try {
        // Check if field exists and belongs to the template
        const existingFieldResult = yield (0, db_1.query)('SELECT * FROM custom_field_definitions WHERE id = $1 AND template_id = $2', [fieldId, templateId]);
        if (existingFieldResult.rows.length === 0) {
            return res.status(404).json({ message: 'Custom field not found for this template.' });
        }
        existingField = existingFieldResult.rows[0]; // Assign here
        // Dynamic query construction
        const updateFields = [];
        const values = [];
        let queryIndex = 1;
        if (field_name !== undefined) {
            updateFields.push(`field_name = $${queryIndex++}`);
            values.push(field_name);
        }
        let currentFieldType = existingField.field_type;
        if (field_type !== undefined) {
            updateFields.push(`field_type = $${queryIndex++}`);
            values.push(field_type);
            currentFieldType = field_type; // Use the new field_type for options validation
        }
        // Handle options: if field_type is choice-based, options are relevant. Otherwise, set to null.
        if (['dropdown', 'checkbox', 'radio'].includes(currentFieldType)) {
            if (options !== undefined) { // only update options if explicitly provided
                if (!Array.isArray(options) || !options.every(opt => typeof opt === 'string') || options.length === 0) {
                    return res.status(400).json({ message: 'Options must be a non-empty array of strings for this field type.' });
                }
                updateFields.push(`options = $${queryIndex++}`);
                values.push(options);
            }
            else if (field_type !== undefined && !existingField.options) { // if changing to a type that needs options, and none were provided
                return res.status(400).json({ message: `Options are required when changing to field type ${currentFieldType}.` });
            }
        }
        else { // For non-choice types, ensure options are nullified if field_type is changing
            if (field_type !== undefined && existingField.options !== null) {
                updateFields.push(`options = $${queryIndex++}`);
                values.push(null);
            }
        }
        if (is_required !== undefined) {
            updateFields.push(`is_required = $${queryIndex++}`);
            values.push(is_required);
        }
        if (sort_order !== undefined) {
            updateFields.push(`sort_order = $${queryIndex++}`);
            values.push(sort_order);
        }
        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No update fields provided.' });
        }
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(fieldId);
        values.push(templateId);
        const updateQuery = `UPDATE custom_field_definitions SET ${updateFields.join(', ')} WHERE id = $${queryIndex++} AND template_id = $${queryIndex++} RETURNING *`;
        const result = yield (0, db_1.query)(updateQuery, values);
        res.json(result.rows[0]);
    }
    catch (err) {
        if (err.code === '23505') { // Unique constraint violation
            // Use existingField which is now in scope
            const originalFieldName = existingField ? existingField.field_name : 'the original name';
            return res.status(400).json({ message: `A field named "${field_name || originalFieldName}" already exists for this template.` });
        }
        console.error(err.message);
        res.status(500).send('Server error');
    }
})));
// @route   DELETE /api/templates/:templateId/fields/:fieldId
// @desc    Delete a custom field definition
// @access  Private (Admin, Manager)
router.delete('/:templateId/fields/:fieldId', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin', 'manager'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { templateId, fieldId } = req.params;
    if (isNaN(parseInt(templateId, 10)) || isNaN(parseInt(fieldId, 10))) {
        return res.status(400).json({ message: 'Template ID and Field ID must be integers.' });
    }
    try {
        // Check if field exists and belongs to the template
        const fieldCheck = yield (0, db_1.query)('SELECT id FROM custom_field_definitions WHERE id = $1 AND template_id = $2', [fieldId, templateId]);
        if (fieldCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Custom field not found for this template.' });
        }
        // Delete the field. 
        // Consider implications for ticket_custom_field_values referencing this field_id.
        // If ticket_custom_field_values.field_id has ON DELETE CASCADE, values will be deleted.
        // If ON DELETE RESTRICT/NO ACTION, this will fail if values exist.
        // If ON DELETE SET NULL, field_id in ticket_custom_field_values will be set to NULL.
        const deleteResult = yield (0, db_1.query)('DELETE FROM custom_field_definitions WHERE id = $1 RETURNING id', [fieldId]);
        if (deleteResult.rowCount === 0) {
            // Should not happen if fieldCheck passed, but as a safeguard
            return res.status(404).json({ message: 'Custom field not found, delete failed.' });
        }
        res.status(200).json({ message: 'Custom field definition deleted successfully.' });
    }
    catch (err) {
        // Handle potential foreign key constraint violations if ticket_custom_field_values exist and the FK is RESTRICT
        if (err.code === '23503') { // foreign_key_violation
            return res.status(400).json({ message: 'Cannot delete custom field. It is currently in use by existing tickets.' });
        }
        console.error(err.message);
        res.status(500).send('Server error');
    }
})));
// Error handling middleware for this router
router.use((err, req, res, next) => {
    console.error("Error in templateRoutes:", err.stack);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ message });
});
exports.default = router;
