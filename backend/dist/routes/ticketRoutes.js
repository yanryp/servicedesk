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
// src/routes/ticketRoutes.ts
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const db_1 = __importDefault(require("../db"));
const prisma_1 = __importDefault(require("../db/prisma"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const emailService_1 = require("../services/emailService");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Helper function to calculate SLA
const getSlaDueDate = (priority) => {
    const now = new Date();
    switch (priority) {
        case 'urgent':
            return new Date(now.setHours(now.getHours() + 4));
        case 'high':
            return new Date(now.setDate(now.getDate() + 1));
        case 'low':
            return new Date(now.setDate(now.getDate() + 7));
        case 'medium':
        default:
            return new Date(now.setDate(now.getDate() + 3));
    }
};
const router = (0, express_1.Router)();
// --- Multer Setup for File Uploads ---
// Ensure the uploads directory exists
const uploadDir = path_1.default.join(__dirname, '..', '..', 'uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Set up storage engine
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Create a unique filename to avoid overwrites
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage: storage });
// @route   POST /api/tickets
// @desc    Create a new ticket (with optional file uploads)
// @access  Private
router.post('/', authMiddleware_1.protect, upload.array('attachments', 5), // 'attachments' is the field name, max 5 files
[
    (0, express_validator_1.body)('title', 'Title is required').not().isEmpty().trim().escape(),
    (0, express_validator_1.body)('description', 'Description is required').not().isEmpty().trim().escape(),
    (0, express_validator_1.body)('itemId', 'Item ID is required and must be an integer').isInt({ min: 1 }),
    (0, express_validator_1.body)('templateId').optional().isInt({ min: 1 }).withMessage('Template ID must be an integer'),
    (0, express_validator_1.body)('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority value'),
    (0, express_validator_1.body)('customFieldValues').optional().custom((value) => {
        // Allow both array (JSON request) and string (FormData request)
        if (Array.isArray(value)) {
            return true;
        }
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed);
            }
            catch (_a) {
                return false;
            }
        }
        return false;
    }).withMessage('Custom field values must be an array or valid JSON array string.'),
], (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        if (req.files) {
            const files = req.files;
            files.forEach(file => fs_1.default.unlinkSync(file.path));
        }
        return res.status(400).json({ errors: errors.array() });
    }
    const { title, description, itemId, templateId, priority = 'medium' } = req.body;
    // Parse customFieldValues - could be string (from FormData) or array (from JSON)
    let customFieldValues;
    if (req.body.customFieldValues) {
        if (typeof req.body.customFieldValues === 'string') {
            try {
                customFieldValues = JSON.parse(req.body.customFieldValues);
            }
            catch (parseError) {
                return res.status(400).json({ message: 'Invalid JSON format for customFieldValues' });
            }
        }
        else {
            customFieldValues = req.body.customFieldValues;
        }
    }
    const created_by_user_id = req.user.id;
    // Validate templateId is required when custom fields are provided
    if (customFieldValues && customFieldValues.length > 0 && !templateId) {
        return res.status(400).json({ message: 'Template ID is required when custom field values are provided' });
    }
    // --- NEW CUSTOM FIELD VALIDATION LOGIC START ---
    let customFieldValidationPassed = true;
    let customFieldValidationMessage = "";
    let customFieldValidationErrorStatus = 400;
    if (templateId) {
        try {
            const definitionsResult = yield db_1.default.query('SELECT id, field_name, field_type, options, is_required FROM custom_field_definitions WHERE template_id = $1', [templateId]);
            const definitions = definitionsResult.rows;
            if (definitions.length > 0) {
                const definitionsMap = new Map(definitions.map(def => [def.id, def]));
                const requiredFieldsFromTemplate = new Set(definitions.filter(def => def.is_required).map(def => def.id));
                // Validate submitted customFieldValues
                if (customFieldValues && customFieldValues.length > 0) {
                    for (const cfv of customFieldValues) {
                        const definition = definitionsMap.get(cfv.fieldDefinitionId);
                        if (!definition) {
                            customFieldValidationPassed = false;
                            customFieldValidationMessage = `Custom field with ID ${cfv.fieldDefinitionId} does not belong to template ${templateId}.`;
                            break;
                        }
                        const value = cfv.value;
                        switch (definition.field_type) {
                            case 'number':
                                if (isNaN(parseFloat(value))) {
                                    customFieldValidationPassed = false;
                                    customFieldValidationMessage = `Value for field "${definition.field_name}" must be a number. Received: '${value}'`;
                                }
                                break;
                            case 'date':
                                if (isNaN(new Date(value).getTime())) {
                                    customFieldValidationPassed = false;
                                    customFieldValidationMessage = `Value for field "${definition.field_name}" must be a valid date. Received: '${value}'`;
                                }
                                break;
                            case 'dropdown':
                            case 'radio':
                                if (!definition.options || !definition.options.includes(value)) {
                                    customFieldValidationPassed = false;
                                    customFieldValidationMessage = `Value for field "${definition.field_name}" is not a valid option. Received: '${value}'`;
                                }
                                break;
                            case 'checkbox': // Assuming single value from options if options exist
                                if (definition.options && definition.options.length > 0 && !definition.options.includes(value)) {
                                    customFieldValidationPassed = false;
                                    customFieldValidationMessage = `Value for field "${definition.field_name}" is not a valid option for the checkbox. Received: '${value}'`;
                                }
                                // If no options, any string is fine (already validated by notEmpty)
                                break;
                        }
                        if (!customFieldValidationPassed)
                            break;
                        requiredFieldsFromTemplate.delete(cfv.fieldDefinitionId); // Mark as provided
                    }
                }
                // Check for missing required fields if all previous validations passed
                if (customFieldValidationPassed && requiredFieldsFromTemplate.size > 0) {
                    const missingFieldNames = Array.from(requiredFieldsFromTemplate)
                        .map(id => { var _a; return (_a = definitionsMap.get(id)) === null || _a === void 0 ? void 0 : _a.field_name; })
                        .filter(name => name)
                        .join(', ');
                    customFieldValidationPassed = false;
                    customFieldValidationMessage = `Missing required fields for template ${templateId}: ${missingFieldNames}.`;
                }
            }
            else if (customFieldValues && customFieldValues.length > 0) {
                // Template has no definitions, but values were submitted
                customFieldValidationPassed = false;
                customFieldValidationMessage = `Template ${templateId} has no custom fields defined, but values were submitted.`;
            }
        }
        catch (validationQueryError) {
            console.error("Error during custom field definition query:", validationQueryError);
            customFieldValidationPassed = false;
            customFieldValidationMessage = "Server error during custom field validation.";
            customFieldValidationErrorStatus = 500;
        }
    }
    else if (customFieldValues && customFieldValues.length > 0) {
        // No templateId provided, but customFieldValues were submitted.
        customFieldValidationPassed = false;
        customFieldValidationMessage = "Custom field values provided without a template ID.";
    }
    if (!customFieldValidationPassed) {
        if (req.files) {
            const files = req.files;
            files.forEach(file => {
                try {
                    fs_1.default.unlinkSync(file.path);
                }
                catch (e) {
                    console.error(`Error unlinking uploaded file ${file.path} during validation failure:`, e);
                }
            });
        }
        return res.status(customFieldValidationErrorStatus).json({ message: customFieldValidationMessage });
    }
    // --- NEW CUSTOM FIELD VALIDATION LOGIC END ---
    const client = yield db_1.default.connect();
    try {
        yield client.query('BEGIN');
        // Set status to pending-approval and sla_due_date to null
        const newTicketResult = yield client.query('INSERT INTO tickets (title, description, created_by_user_id, item_id, template_id, priority, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [title, description, created_by_user_id, itemId, templateId || null, priority, 'pending-approval']);
        const newTicket = newTicketResult.rows[0];
        // Insert custom field values if provided
        if (customFieldValues && customFieldValues.length > 0) {
            const customFieldPromises = customFieldValues.map(cf => {
                return client.query('INSERT INTO ticket_custom_field_values (ticket_id, field_definition_id, value) VALUES ($1, $2, $3)', [newTicket.id, cf.fieldDefinitionId, cf.value]);
            });
            yield Promise.all(customFieldPromises);
        }
        if (req.files) {
            const files = req.files;
            const attachmentPromises = files.map(file => {
                const { originalname, path: filepath, mimetype, size: filesize } = file;
                return client.query('INSERT INTO ticket_attachments (ticket_id, file_name, file_path, file_type, file_size) VALUES ($1, $2, $3, $4, $5)', [newTicket.id, originalname, filepath, mimetype, filesize]);
            });
            yield Promise.all(attachmentPromises);
        }
        yield client.query('COMMIT');
        // To provide a complete response, let's fetch the attachments we just created
        const attachmentsResult = yield client.query('SELECT * FROM ticket_attachments WHERE ticket_id = $1', [newTicket.id]);
        const finalTicketResponse = Object.assign(Object.assign({}, newTicket), { attachments: attachmentsResult.rows });
        // Send email notification
        try {
            // Notify creator that ticket is pending approval
            const creatorEmail = req.user.email;
            if (creatorEmail) {
                const subject = `Ticket Created & Pending Approval: #${newTicket.id}`;
                const text = `Your ticket "${newTicket.title}" has been created and is now pending manager approval. You will be notified once it is reviewed.`;
                const html = `<p>Your ticket "${newTicket.title}" has been created and is now pending manager approval. You will be notified once it is reviewed.</p>`;
                yield (0, emailService_1.sendEmail)({ to: creatorEmail, subject, text, html });
            }
            // Notify manager for approval
            const creatorResult = yield client.query('SELECT username, manager_id FROM users WHERE id = $1', [created_by_user_id]);
            const creator = creatorResult.rows[0];
            const managerId = creator === null || creator === void 0 ? void 0 : creator.manager_id;
            if (managerId) {
                const managerResult = yield client.query('SELECT email FROM users WHERE id = $1', [managerId]);
                const manager = managerResult.rows[0];
                if (manager && manager.email) {
                    const subject = `Ticket for Approval: #${newTicket.id} - ${newTicket.title}`;
                    const text = `A new ticket created by ${creator.username} requires your approval. Please log in to the system to review it.`;
                    const html = `<p>A new ticket created by <b>${creator.username}</b> requires your approval. Please log in to the system to review it.</p><p><b>Ticket:</b> ${newTicket.title}</p>`;
                    yield (0, emailService_1.sendEmail)({ to: manager.email, subject, text, html });
                }
            }
            else {
                console.log(`Ticket #${newTicket.id} created by user ${created_by_user_id} who has no manager. It will remain pending.`);
            }
        }
        catch (emailError) {
            console.error(`Failed to send ticket creation email for ticket ${newTicket.id}:`, emailError);
            // Do not fail the request if email fails
        }
        res.status(201).json(finalTicketResponse);
    }
    catch (e) {
        yield client.query('ROLLBACK');
        if (req.files) {
            const files = req.files;
            files.forEach(file => fs_1.default.unlinkSync(file.path));
        }
        throw e;
    }
    finally {
        client.release();
    }
})));
// @route   GET /api/tickets
// @desc    Get tickets for the user (or all if admin/tech)
// @access  Private
router.get('/', authMiddleware_1.protect, (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    // Filtering parameters
    const { status, priority, search, category } = req.query;
    const whereClauses = [];
    const queryParams = [];
    let paramIndex = 1;
    // Role-based filtering with department access control
    if (user.role === 'admin') {
        // Admins can see all tickets - no additional filter
    }
    else if (user.role === 'technician') {
        // Technicians can only see tickets from their department
        if (user.departmentId) {
            whereClauses.push(`cat.department_id = $${paramIndex++}`);
            queryParams.push(user.departmentId);
        }
        else {
            // If technician has no department, they see no tickets
            whereClauses.push(`1 = 0`);
        }
    }
    else if (user.role === 'manager') {
        // Managers see their own tickets AND tickets pending approval from their reports
        whereClauses.push(`(
        t.created_by_user_id = $${paramIndex++} 
        OR 
        (t.status = 'pending-approval' AND t.created_by_user_id IN (SELECT id FROM users WHERE manager_id = $${paramIndex++}))
      )`);
        queryParams.push(user.id, user.id);
    }
    else {
        // Requesters can only see their own tickets
        whereClauses.push(`t.created_by_user_id = $${paramIndex++}`);
        queryParams.push(user.id);
    }
    // Filter by status
    if (status && typeof status === 'string') {
        whereClauses.push(`t.status = $${paramIndex++}`);
        queryParams.push(status);
    }
    // Filter by category (now checks item, sub_category, or category name)
    if (category && typeof category === 'string') {
        whereClauses.push(`(i.name ILIKE $${paramIndex} OR scat.name ILIKE $${paramIndex} OR cat.name ILIKE $${paramIndex})`);
        queryParams.push(`%${category}%`);
        paramIndex++; // Increment after using it for all three OR conditions
    }
    // Filter by priority
    if (priority && typeof priority === 'string') {
        whereClauses.push(`t.priority = $${paramIndex++}`);
        queryParams.push(priority);
    }
    // Filter by search term (in title or description)
    if (search && typeof search === 'string') {
        whereClauses.push(`(t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`);
        queryParams.push(`%${search}%`);
        paramIndex++;
    }
    const whereClause = whereClauses.length > 0 ? ` WHERE ${whereClauses.join(' AND ')}` : '';
    // Count query with necessary joins for department filtering
    const countQueryText = `
      SELECT COUNT(DISTINCT t.id) 
      FROM tickets t
      LEFT JOIN items i ON t.item_id = i.id
      LEFT JOIN sub_categories scat ON i.sub_category_id = scat.id
      LEFT JOIN categories cat ON scat.category_id = cat.id
    ` + whereClause;
    const countResult = yield db_1.default.query(countQueryText, queryParams);
    const totalTickets = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalTickets / limit);
    // Tickets query with enhanced user and department information
    const ticketsQueryBase = `
        SELECT 
          t.*, 
          u.username AS created_by_username,
          u.email AS created_by_email,
          u.role AS created_by_role,
          creator_dept.name AS created_by_department,
          assigned_user.username AS assigned_to_username,
          assigned_user.email AS assigned_to_email,
          COALESCE(att_counts.attachment_count, 0) AS attachment_count,
          i.name AS item_name,
          scat.name AS sub_category_name,
          cat.name AS category_name
        FROM tickets t
        JOIN users u ON t.created_by_user_id = u.id
        LEFT JOIN departments creator_dept ON u.department_id = creator_dept.id
        LEFT JOIN users assigned_user ON t.assigned_to_user_id = assigned_user.id
        LEFT JOIN (
          SELECT ticket_id, COUNT(*) AS attachment_count 
          FROM ticket_attachments 
          GROUP BY ticket_id
        ) att_counts ON t.id = att_counts.ticket_id
        LEFT JOIN items i ON t.item_id = i.id
        LEFT JOIN sub_categories scat ON i.sub_category_id = scat.id
        LEFT JOIN categories cat ON scat.category_id = cat.id
    `;
    const groupByAndLimit = ` GROUP BY t.id, u.username, u.email, u.role, creator_dept.name, assigned_user.username, assigned_user.email, i.name, scat.name, cat.name, att_counts.attachment_count ORDER BY t.updated_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    const ticketsQueryText = ticketsQueryBase + whereClause + groupByAndLimit;
    const ticketsQueryParams = [...queryParams, limit, offset];
    const ticketsResult = yield db_1.default.query(ticketsQueryText, ticketsQueryParams);
    res.status(200).json({
        tickets: ticketsResult.rows,
        currentPage: page,
        totalPages: totalPages,
        totalTickets: totalTickets,
    });
})));
// @route   GET /api/tickets/pending-approvals
// @desc    Get tickets pending approval for manager 
// @access  Private (Manager only)
router.get('/pending-approvals', authMiddleware_1.protect, (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const managerId = req.user.id;
    // Check if user is a manager
    if (req.user.role !== 'manager') {
        return res.status(403).json({ message: 'Access denied. Manager role required.' });
    }
    const client = yield db_1.default.connect();
    try {
        // Get tickets where the creator's manager is the current user and status is pending approval
        const query = `
      SELECT 
        t.*,
        c.name as category_name,
        sc.name as subcategory_name,
        i.name as item_name,
        u.username as creator_username,
        u.email as creator_email,
        d.name as creator_department
      FROM tickets t
      LEFT JOIN items i ON t.item_id = i.id
      LEFT JOIN sub_categories sc ON i.sub_category_id = sc.id  
      LEFT JOIN categories c ON sc.category_id = c.id
      JOIN users u ON t.created_by_user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.manager_id = $1 
        AND t.status = 'pending-approval'
      ORDER BY t.created_at DESC
    `;
        const result = yield client.query(query, [managerId]);
        const rawTickets = result.rows;
        // Transform flat fields to nested objects to match frontend expectations
        const tickets = rawTickets.map(ticket => (Object.assign(Object.assign({}, ticket), { createdBy: {
                username: ticket.creator_username,
                email: ticket.creator_email
            }, item: {
                name: ticket.item_name
            }, 
            // Clean up flat fields to avoid confusion
            creator_username: undefined, creator_email: undefined, creator_department: undefined, item_name: undefined, category_name: undefined, subcategory_name: undefined })));
        res.status(200).json(tickets);
    }
    catch (error) {
        console.error('Error fetching pending approvals:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching pending approvals'
        });
    }
    finally {
        client.release();
    }
})));
// @route   GET /api/tickets/:ticketId
// @desc    Get a single ticket by ID
// @access  Private
router.get('/:ticketId', authMiddleware_1.protect, (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ticketId } = req.params;
    const user = req.user;
    // Use Prisma to fetch ticket with all related data
    const ticket = yield prisma_1.default.ticket.findUnique({
        where: { id: parseInt(ticketId) },
        include: {
            createdBy: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                    departmentId: true,
                    managerId: true
                },
                include: {
                    department: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    manager: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            departmentId: true
                        }
                    }
                }
            },
            assignedTo: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                    departmentId: true
                },
                include: {
                    department: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            },
            item: {
                include: {
                    subCategory: {
                        include: {
                            category: true
                        }
                    }
                }
            },
            template: true,
            attachments: true,
            customFieldValues: {
                include: {
                    fieldDefinition: true
                }
            },
            bsgFieldValues: {
                include: {
                    field: {
                        include: {
                            fieldType: true
                        }
                    }
                }
            }
        }
    });
    if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found.' });
    }
    // Authorization check with department-based access
    const isOwner = user.id === ticket.createdByUserId;
    const isAdmin = user.role === 'admin';
    // Check if user is the direct manager of the ticket creator
    const isDirectManager = user.role === 'manager' &&
        ticket.createdBy.managerId === user.id &&
        ticket.createdBy.departmentId === user.departmentId;
    // Check if technician can access based on department
    let canAccessAsTechnician = false;
    if (user.role === 'technician' && user.departmentId) {
        // Allow technicians to access tickets from their department
        canAccessAsTechnician = ticket.createdBy.departmentId === user.departmentId;
    }
    if (!isOwner && !isAdmin && !isDirectManager && !canAccessAsTechnician) {
        return res.status(403).json({ message: 'You are not authorized to view this ticket.' });
    }
    // Transform Prisma data to match frontend expectations
    const transformedTicket = Object.assign(Object.assign({}, ticket), { 
        // Transform BSG field values to match frontend expectations
        bsg_fields: ticket.bsgFieldValues.map(fieldValue => ({
            field_definition_id: fieldValue.field.id,
            field_name: fieldValue.field.fieldName,
            field_label: fieldValue.field.fieldLabel,
            field_type: fieldValue.field.fieldType.name,
            value: fieldValue.fieldValue,
            field_description: fieldValue.field.fieldDescription,
            placeholder_text: fieldValue.field.placeholderText,
            help_text: fieldValue.field.helpText
        })), 
        // Transform custom field values to match frontend expectations
        custom_fields: ticket.customFieldValues.map(fieldValue => ({
            field_definition_id: fieldValue.fieldDefinition.id,
            field_name: fieldValue.fieldDefinition.fieldName,
            field_label: fieldValue.fieldDefinition.fieldLabel,
            field_type: fieldValue.fieldDefinition.fieldType,
            value: fieldValue.value
        })), 
        // Add authorization context for frontend
        userPermissions: {
            canApprove: isDirectManager && ticket.status === 'pending_approval',
            canModify: isOwner || isAdmin || canAccessAsTechnician,
            isOwner: isOwner,
            isDirectManager: isDirectManager,
            userRole: user.role,
            userDepartment: user.departmentId
        } });
    res.status(200).json(transformedTicket);
})));
// @route   PUT /api/tickets/:ticketId
// @desc    Update a ticket
// @access  Private
router.put('/:ticketId', authMiddleware_1.protect, [
    (0, express_validator_1.body)('title').optional().not().isEmpty().withMessage('Title cannot be empty').trim().escape(),
    (0, express_validator_1.body)('description').optional().not().isEmpty().withMessage('Description cannot be empty').trim().escape(),
    (0, express_validator_1.body)('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status value'),
    (0, express_validator_1.body)('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority value'),
    (0, express_validator_1.body)('itemId').optional().isInt({ min: 1 }).withMessage('Item ID must be an integer'),
    (0, express_validator_1.body)('templateId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Template ID must be an integer or null'), // Allow null to clear template
    (0, express_validator_1.body)('assigned_to_user_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Invalid user ID for assignment or null to unassign'),
    (0, express_validator_1.body)('customFieldValues').optional().isArray().withMessage('Custom field values must be an array.'),
    (0, express_validator_1.body)('customFieldValues.*.fieldDefinitionId', 'Each custom field must have a valid fieldDefinitionId').if((0, express_validator_1.body)('customFieldValues').exists()).isInt({ min: 1 }),
    (0, express_validator_1.body)('customFieldValues.*.value', 'Each custom field must have a value').if((0, express_validator_1.body)('customFieldValues').exists()).notEmpty().trim().escape(),
], (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const getSingleTicketQueryText = `
      SELECT
          t.*, -- Select all columns from tickets table including categorization fields
          cat.name AS category_name,
          scat.name AS sub_category_name,
          i.name AS item_name,
          tmpl.name AS template_name,
          -- Transform categorization fields to camelCase for frontend compatibility
          t.user_root_cause as "userRootCause",
          t.user_issue_category as "userIssueCategory", 
          t.user_categorized_at as "userCategorizedAt",
          t.tech_root_cause as "techRootCause",
          t.tech_issue_category as "techIssueCategory",
          t.tech_categorized_at as "techCategorizedAt",
          t.confirmed_root_cause as "confirmedRootCause",
          t.confirmed_issue_category as "confirmedIssueCategory",
          t.is_classification_locked as "isClassificationLocked",
          t.tech_override_reason as "techOverrideReason",
          COALESCE(
              (
                  SELECT json_agg(json_build_object(
                      'id', ta.id,
                      'fileName', ta.file_name,
                      'filePath', ta.file_path,
                      'fileType', ta.file_type,
                      'fileSize', ta.file_size
                  ) ORDER BY ta.id)
                  FROM ticket_attachments ta
                  WHERE ta.ticket_id = t.id
              ),
              '[]'::json
          ) AS attachments,
          COALESCE(
              (
                  SELECT json_agg(json_build_object(
                      'field_definition_id', cfd.id,
                      'field_name', cfd.field_name,
                      'field_label', cfd.field_label,
                      'field_type', cfd.field_type,
                      'value', tcfv.value
                  ) ORDER BY cfd.id) -- Order custom fields consistently
                  FROM ticket_custom_field_values tcfv
                  JOIN custom_field_definitions cfd ON tcfv.field_definition_id = cfd.id
                  WHERE tcfv.ticket_id = t.id
              ),
              '[]'::json
          ) AS custom_fields,
          COALESCE(
              (
                  SELECT json_agg(json_build_object(
                      'field_definition_id', btf.id,
                      'field_name', btf."fieldName",
                      'field_label', btf."fieldLabel", 
                      'field_type', bft.name,
                      'value', btfv."fieldValue",
                      'field_description', btf."fieldDescription",
                      'placeholder_text', btf."placeholderText",
                      'help_text', btf."helpText"
                  ) ORDER BY btf."sortOrder", btf.id)
                  FROM "BSGTicketFieldValue" btfv
                  JOIN "BSGTemplateField" btf ON btfv."fieldId" = btf.id
                  JOIN "BSGFieldType" bft ON btf."fieldTypeId" = bft.id
                  WHERE btfv."ticketId" = t.id
              ),
              '[]'::json
          ) AS bsg_fields
      FROM
          tickets t
      LEFT JOIN
          items i ON t.item_id = i.id
      LEFT JOIN
          sub_categories scat ON i.sub_category_id = scat.id
      LEFT JOIN
          categories cat ON scat.category_id = cat.id
      LEFT JOIN
          ticket_templates tmpl ON t.template_id = tmpl.id
      WHERE
          t.id = $1;
    `;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { ticketId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const updates = req.body;
    const client = yield db_1.default.connect();
    try {
        // Fetch existing ticket within the transaction client for consistency
        const ticketResult = yield client.query('SELECT * FROM tickets WHERE id = $1 FOR UPDATE', [ticketId]);
        if (ticketResult.rows.length === 0) {
            yield client.query('ROLLBACK'); // No ticket found, rollback if transaction started implicitly by FOR UPDATE
            client.release();
            return res.status(404).json({ message: 'Ticket not found' });
        }
        const originalTicket = ticketResult.rows[0];
        // Authorization checks
        const isAdminOrTechnician = userRole === 'admin' || userRole === 'technician';
        const isOwner = originalTicket.created_by_user_id === userId;
        const allowedFieldsForRequester = ['title', 'description', 'priority', 'itemId', 'templateId'];
        const allowedFieldsForAdminTech = ['title', 'description', 'status', 'priority', 'itemId', 'templateId', 'assigned_to_user_id'];
        if (!isAdminOrTechnician) {
            if (!isOwner) {
                yield client.query('ROLLBACK');
                client.release();
                return res.status(403).json({ message: 'You are not authorized to update this ticket.' });
            }
            if (originalTicket.status !== 'open' && originalTicket.status !== 'awaiting-changes') {
                yield client.query('ROLLBACK');
                client.release();
                return res.status(403).json({ message: 'As a requester, you can only update tickets that are in \'open\' or \'awaiting-changes\' status.' });
            }
            // Check if requester is trying to update fields not in their allowed list, excluding customFieldValues which is handled separately
            const isUpdatingRestrictedFields = Object.keys(updates).some(key => !allowedFieldsForRequester.includes(key) && key !== 'customFieldValues');
            if (isUpdatingRestrictedFields) {
                yield client.query('ROLLBACK');
                client.release();
                return res.status(403).json({ message: 'You are attempting to update fields you are not authorized to change.' });
            }
        }
        // --- NEW CUSTOM FIELD VALIDATION LOGIC FOR PUT START ---
        const effectiveTemplateId = updates.templateId !== undefined ? updates.templateId : originalTicket.template_id;
        let customFieldValidationPassedPut = true;
        let customFieldValidationMessagePut = "";
        let customFieldValidationErrorStatusPut = 400;
        if (effectiveTemplateId !== null && effectiveTemplateId !== undefined) { // Template is active or being set
            if (updates.customFieldValues !== undefined) { // Only validate if customFieldValues are part of the update payload
                try {
                    const definitionsResult = yield db_1.default.query('SELECT id, field_name, field_type, options, is_required FROM custom_field_definitions WHERE template_id = $1', [effectiveTemplateId]);
                    const definitions = definitionsResult.rows;
                    if (definitions.length > 0) {
                        const definitionsMap = new Map(definitions.map(def => [def.id, def]));
                        const requiredFieldsFromTemplate = new Set(definitions.filter(def => def.is_required).map(def => def.id));
                        if (Array.isArray(updates.customFieldValues)) {
                            for (const cfv of updates.customFieldValues) {
                                const definition = definitionsMap.get(cfv.fieldDefinitionId);
                                if (!definition) {
                                    customFieldValidationPassedPut = false;
                                    customFieldValidationMessagePut = `Custom field with ID ${cfv.fieldDefinitionId} does not belong to template ${effectiveTemplateId}.`;
                                    break;
                                }
                                const value = cfv.value;
                                switch (definition.field_type) {
                                    case 'number':
                                        if (isNaN(parseFloat(value))) {
                                            customFieldValidationPassedPut = false;
                                            customFieldValidationMessagePut = `Value for field "${definition.field_name}" must be a number. Received: '${value}'`;
                                        }
                                        break;
                                    case 'date':
                                        if (isNaN(new Date(value).getTime())) {
                                            customFieldValidationPassedPut = false;
                                            customFieldValidationMessagePut = `Value for field "${definition.field_name}" must be a valid date. Received: '${value}'`;
                                        }
                                        break;
                                    case 'dropdown':
                                    case 'radio':
                                        if (!definition.options || !definition.options.includes(value)) {
                                            customFieldValidationPassedPut = false;
                                            customFieldValidationMessagePut = `Value for field "${definition.field_name}" is not a valid option. Received: '${value}'`;
                                        }
                                        break;
                                    case 'checkbox':
                                        if (definition.options && definition.options.length > 0 && !definition.options.includes(value)) {
                                            customFieldValidationPassedPut = false;
                                            customFieldValidationMessagePut = `Value for field "${definition.field_name}" is not a valid option for the checkbox. Received: '${value}'`;
                                        }
                                        break;
                                }
                                if (!customFieldValidationPassedPut)
                                    break;
                                requiredFieldsFromTemplate.delete(cfv.fieldDefinitionId);
                            }
                        }
                        if (customFieldValidationPassedPut && requiredFieldsFromTemplate.size > 0) {
                            const missingFieldNames = Array.from(requiredFieldsFromTemplate)
                                .map(id => { var _a; return (_a = definitionsMap.get(id)) === null || _a === void 0 ? void 0 : _a.field_name; })
                                .filter(name => name)
                                .join(', ');
                            customFieldValidationPassedPut = false;
                            customFieldValidationMessagePut = `Missing required fields for template ${effectiveTemplateId}: ${missingFieldNames}.`;
                        }
                    }
                    else if (Array.isArray(updates.customFieldValues) && updates.customFieldValues.length > 0) {
                        customFieldValidationPassedPut = false;
                        customFieldValidationMessagePut = `Template ${effectiveTemplateId} has no custom fields defined, but values were submitted.`;
                    }
                }
                catch (validationQueryError) {
                    console.error("Error during custom field definition query for PUT:", validationQueryError);
                    customFieldValidationPassedPut = false;
                    customFieldValidationMessagePut = "Server error during custom field validation.";
                    customFieldValidationErrorStatusPut = 500;
                }
            }
        }
        else { // No template active (effectiveTemplateId is null)
            if (updates.customFieldValues && Array.isArray(updates.customFieldValues) && updates.customFieldValues.length > 0) {
                customFieldValidationPassedPut = false;
                customFieldValidationMessagePut = "Cannot provide custom field values when no template is active or template is being cleared.";
            }
        }
        if (!customFieldValidationPassedPut) {
            client.release(); // Release client obtained for originalTicket fetch
            return res.status(customFieldValidationErrorStatusPut).json({ message: customFieldValidationMessagePut });
        }
        // --- NEW CUSTOM FIELD VALIDATION LOGIC FOR PUT END ---
        yield client.query('BEGIN');
        let newStatusForResubmission = undefined;
        let managerToNotifyEmail = null;
        let managerToNotifyName = null;
        let originalTicketTitleForNotification = originalTicket.title; // Store for use after potential update
        console.log('DEBUG - Checking status transition conditions:', {
            isOwner,
            ticketStatus: originalTicket.status,
            updatesStatus: updates.status,
            ticketId
        });
        if (isOwner && originalTicket.status === 'awaiting-changes' && updates.status === undefined) {
            // If user is owner, ticket is 'awaiting-changes', and they are not trying to set status themselves (which they can't)
            newStatusForResubmission = 'pending-approval';
            console.log('DEBUG - Setting newStatusForResubmission to pending-approval for ticket', ticketId);
            // Add status to updates directly to ensure it's included in the SET clauses
            updates.status = 'pending-approval';
            console.log('DEBUG - Added status to updates object:', updates);
            // Make sure status is included in allowedFieldsForRequester
            if (!allowedFieldsForRequester.includes('status')) {
                console.log('DEBUG - Adding status to allowedFieldsForRequester');
                allowedFieldsForRequester.push('status');
            }
            try {
                const creatorUserResult = yield client.query('SELECT u.manager_id, m.email as manager_email, m.username as manager_username FROM users u JOIN users m ON u.manager_id = m.id WHERE u.id = $1', [originalTicket.created_by_user_id]);
                if (creatorUserResult.rows.length > 0 && creatorUserResult.rows[0].manager_id) {
                    managerToNotifyEmail = creatorUserResult.rows[0].manager_email;
                    managerToNotifyName = creatorUserResult.rows[0].manager_username;
                }
            }
            catch (e) {
                console.error("Error fetching manager details for resubmission notification:", e);
                // Non-critical, proceed without manager notification if fetch fails
            }
        }
        let mainTicketFieldsWereModified = false;
        const fieldsToUpdate = isAdminOrTechnician ? allowedFieldsForAdminTech : allowedFieldsForRequester;
        console.log('DEBUG - Fields allowed to update:', fieldsToUpdate);
        console.log('DEBUG - Updates object:', updates);
        const setClauses = [];
        const queryValues = [];
        let valueCounter = 1;
        // Apply the new status for resubmission if applicable
        // This ensures it's part of the main ticket update transaction
        // It also makes it available for the generic status change notification later if not handled by manager specific one.
        let statusTransitionRequired = false;
        if (newStatusForResubmission && updates.status === undefined) {
            updates.status = newStatusForResubmission;
            statusTransitionRequired = true;
        }
        for (const field of fieldsToUpdate) {
            if (updates[field] !== undefined && updates[field] !== originalTicket[field]) {
                if ((field === 'assigned_to_user_id' || field === 'templateId') && (updates[field] === '' || updates[field] === null)) {
                    setClauses.push(`${field} = NULL`);
                }
                else {
                    setClauses.push(`${field} = $${valueCounter}`);
                    queryValues.push(updates[field]);
                    valueCounter++;
                }
            }
        }
        // Handle status transition for requester updating awaiting-changes tickets
        console.log('DEBUG - Status transition check:', {
            statusTransitionRequired,
            isAdminOrTechnician,
            isOwner,
            originalStatus: originalTicket.status,
            newStatus: updates.status,
            setClauses: setClauses.length
        });
        if (statusTransitionRequired && !isAdminOrTechnician) {
            console.log('DEBUG - Applying status transition to pending-approval');
            if (setClauses.length > 0) {
                // Include status in the update if there are other fields to update
                setClauses.push(`status = $${valueCounter}`);
                queryValues.push(updates.status);
                valueCounter++;
                console.log('DEBUG - Added status to existing setClauses:', setClauses);
            }
            else {
                // If no other fields to update, create a status-only update
                setClauses.push(`status = $1`);
                queryValues.push(updates.status);
                valueCounter = 2; // Next param will be $2
                console.log('DEBUG - Created status-only update');
            }
        }
        if (setClauses.length > 0) {
            mainTicketFieldsWereModified = true;
            const updateQueryText = `UPDATE tickets SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${valueCounter} RETURNING *`;
            queryValues.push(ticketId);
            console.log('DEBUG - Executing SQL update:', {
                updateQueryText,
                queryValues
            });
            try {
                yield client.query(updateQueryText, queryValues);
                console.log('DEBUG - SQL update successful');
            }
            catch (error) {
                console.error('DEBUG - SQL update error:', error);
                throw error;
            }
        }
        let customFieldsWereModified = false;
        // effectiveTemplateId was defined in the validation block before client.query('BEGIN')
        // const effectiveTemplateId = updates.templateId !== undefined ? updates.templateId : originalTicket.template_id;
        // Condition for deleting old custom field values:
        // 1. If new customFieldValues are provided in the update payload.
        // 2. If the templateId is explicitly being set to null (clearing the template).
        const shouldDeleteOldCustomValues = updates.customFieldValues !== undefined ||
            (updates.templateId !== undefined && updates.templateId === null);
        if (shouldDeleteOldCustomValues) {
            yield client.query('DELETE FROM ticket_custom_field_values WHERE ticket_id = $1', [ticketId]);
            customFieldsWereModified = true; // Deletion itself is a modification
        }
        // Condition for inserting new custom field values:
        // 1. An effective template ID must exist (not null).
        // 2. The customFieldValues must be provided in the update payload, be an array, and not empty.
        //    (Their validity against the template is already checked by the validation block)
        if (effectiveTemplateId !== null &&
            updates.customFieldValues !== undefined &&
            Array.isArray(updates.customFieldValues) &&
            updates.customFieldValues.length > 0) {
            const customFieldInsertQuery = 'INSERT INTO ticket_custom_field_values (ticket_id, field_definition_id, value) VALUES ($1, $2, $3)';
            for (const cf of updates.customFieldValues) {
                // The validation block already ensures cf.fieldDefinitionId and cf.value are valid for the template.
                // We still check for presence to be safe, though theoretically guaranteed by prior validation.
                if (cf.fieldDefinitionId && cf.value !== undefined) {
                    yield client.query(customFieldInsertQuery, [ticketId, cf.fieldDefinitionId, cf.value]);
                }
            }
            customFieldsWereModified = true; // Insertion is a modification
        }
        else if (updates.customFieldValues !== undefined && (!Array.isArray(updates.customFieldValues) || updates.customFieldValues.length === 0)) {
            // If customFieldValues is explicitly provided as empty array, it means clear them (deletion already handled if template is active)
            // If it was not an array, validation would have caught it. This mainly sets customFieldsWereModified.
            customFieldsWereModified = true;
        }
        if (!mainTicketFieldsWereModified && !customFieldsWereModified) {
            yield client.query('COMMIT'); // Or ROLLBACK, commit is fine as no actual DB change happened
            client.release();
            // Fetch with joins to ensure consistent response structure even if no updates
            const noChangeTicketResult = yield db_1.default.query(getSingleTicketQueryText, [ticketId]);
            return res.status(200).json({ message: 'No changes detected.', ticket: noChangeTicketResult.rows[0] || originalTicket });
        }
        // Handle email notification if status changed
        // Specific notification for manager if ticket was resubmitted
        if (newStatusForResubmission && managerToNotifyEmail) {
            try {
                yield (0, emailService_1.sendEmail)({
                    to: managerToNotifyEmail,
                    subject: `Ticket Resubmitted for Approval: #${ticketId}`,
                    text: `Hi ${managerToNotifyName || 'Manager'},

Ticket "${originalTicketTitleForNotification}" (#${ticketId}), which you previously requested changes for, has been updated by the requester and is now pending your approval again.

Please review the changes.

Thank you,
The Ticketing System Team`,
                    html: `<p>Hi ${managerToNotifyName || 'Manager'},</p><p>Ticket "<b>${originalTicketTitleForNotification}</b>" (#${ticketId}), which you previously requested changes for, has been updated by the requester and is now pending your approval again.</p><p>Please review the changes.</p><p>Thank you,<br>The Ticketing System Team</p>`,
                });
            }
            catch (emailError) {
                console.error(`Failed to send ticket resubmission notification to manager for ticket ${ticketId}:`, emailError);
            }
        }
        // General notification for status changes (could also cover the resubmission if not handled above, or other status changes by admin/tech)
        // Ensure not to double-notify if manager notification was sent for the same status change.
        else if (updates.status && updates.status !== originalTicket.status) { // Added 'else if' to prevent double notification if manager was already notified of this specific status change.
            try {
                const ticketCreatorResult = yield client.query('SELECT name, email FROM users WHERE id = $1', [originalTicket.created_by_user_id]);
                if (ticketCreatorResult.rows.length > 0) {
                    const { name, email } = ticketCreatorResult.rows[0];
                    yield (0, emailService_1.sendEmail)({
                        to: email,
                        subject: `[Ticket #${ticketId}] Status Updated: ${updates.status}`,
                        text: `Hi ${name || 'User'},

The status of your ticket "${originalTicket.title}" (#${ticketId}) has been updated to ${updates.status}.

Thank you,
The Ticketing System Team`,
                        html: `<p>Hi ${name || 'User'},</p><p>The status of your ticket "<b>${originalTicket.title}</b>" (#${ticketId}) has been updated to <b>${updates.status}</b>.</p><p>Thank you,<br>The Ticketing System Team</p>`,
                    });
                }
            }
            catch (emailError) {
                console.error(`Failed to send ticket status update email for ticket ${ticketId}:`, emailError);
                // Do not fail the whole transaction for an email error
            }
        }
        yield client.query('COMMIT');
        // Fetch the updated ticket with all joins for the response
        const finalTicketResult = yield db_1.default.query(getSingleTicketQueryText, [ticketId]); // Use pool for read after commit
        res.status(200).json(finalTicketResult.rows[0]);
    }
    catch (error) {
        try {
            // Only attempt rollback if we haven't already released the client
            yield client.query('ROLLBACK');
        }
        catch (rollbackError) {
            console.error('Error during rollback:', rollbackError);
        }
        console.error('Error updating ticket:', error);
        // Enhanced error logging for debugging
        console.log('DEBUG - Error details:', {
            errorMessage: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error',
            errorCode: error === null || error === void 0 ? void 0 : error.code,
            errorDetail: error === null || error === void 0 ? void 0 : error.detail,
            errorHint: error === null || error === void 0 ? void 0 : error.hint,
            ticketId
        });
        // Return more detailed error message for debugging
        res.status(500).json({
            message: 'Failed to update ticket.',
            error: process.env.NODE_ENV === 'development' ? ((error === null || error === void 0 ? void 0 : error.message) || 'Unknown error') : undefined
        });
    }
    finally {
        try {
            // Safely release the client if it exists
            if (client) {
                client.release(true); // true = don't throw error if already released
            }
        }
        catch (releaseError) {
            console.error('Error releasing client:', releaseError);
        }
    }
})));
// @route   DELETE /api/tickets/:ticketId
// @desc    Delete a ticket and its attachments
// @access  Private (Admin only)
router.delete('/:ticketId', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin'), (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ticketId } = req.params;
    const client = yield db_1.default.connect();
    try {
        yield client.query('BEGIN');
        // First, get attachment paths to delete files from disk
        const attachmentsResult = yield client.query('SELECT filepath FROM ticket_attachments WHERE ticket_id = $1', [ticketId]);
        const attachments = attachmentsResult.rows;
        // Delete attachments from database
        yield client.query('DELETE FROM ticket_attachments WHERE ticket_id = $1', [ticketId]);
        // Delete the ticket itself
        const deleteTicketResult = yield client.query('DELETE FROM tickets WHERE id = $1', [ticketId]);
        if (deleteTicketResult.rowCount === 0) {
            // This case handles if the ticket was deleted between the check and the transaction
            throw new Error('Ticket not found during transaction.');
        }
        // Delete files from filesystem after DB transaction is successful
        for (const attachment of attachments) {
            if (fs_1.default.existsSync(attachment.filepath)) {
                fs_1.default.unlinkSync(attachment.filepath);
            }
        }
        yield client.query('COMMIT');
        res.status(200).json({ message: 'Ticket and associated attachments deleted successfully' });
    }
    catch (e) {
        yield client.query('ROLLBACK');
        console.error(e);
        res.status(500).json({ message: 'Failed to delete ticket' });
    }
    finally {
        client.release();
    }
})));
// @route   GET /api/tickets/attachments/:attachmentId
// @desc    Download a ticket attachment
// @access  Private
router.get('/attachments/:attachmentId', authMiddleware_1.protect, (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { attachmentId } = req.params;
    const user = req.user;
    // 1. Get attachment details and the associated ticket owner
    const attachmentQuery = `
      SELECT
        ta.file_path,
        ta.file_name,
        t.created_by_user_id
      FROM ticket_attachments ta
      JOIN tickets t ON ta.ticket_id = t.id
      WHERE ta.id = $1
    `;
    const attachmentResult = yield db_1.default.query(attachmentQuery, [attachmentId]);
    if (attachmentResult.rows.length === 0) {
        return res.status(404).json({ message: 'Attachment not found' });
    }
    const { file_path: filepath, file_name: filename, created_by_user_id } = attachmentResult.rows[0];
    // 2. Authorization check
    const isOwner = user.id === created_by_user_id;
    const isAdminOrTech = user.role === 'admin' || user.role === 'technician';
    if (!isOwner && !isAdminOrTech) {
        return res.status(403).json({ message: 'You are not authorized to download this file.' });
    }
    // 3. Serve the file for download with proper headers
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.download(filepath, filename, (err) => {
        if (err) {
            console.error('Error downloading file:', err);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Could not download the file.' });
            }
        }
    });
})));
// @route   PUT /api/tickets/:ticketId/approval
// @desc    Approve or reject a ticket
// @access  Private (Manager only)
router.put('/:ticketId/approval', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('manager'), [
    (0, express_validator_1.param)('ticketId').isInt().withMessage('Ticket ID must be an integer.'),
    (0, express_validator_1.body)('action').isIn(['approve', 'reject', 'request_changes'])
        .withMessage('Action must be "approve", "reject", or "request_changes".'),
    (0, express_validator_1.body)('comments').optional().isString().trim().escape()
        .custom((value, { req }) => {
        if (req.body.action === 'request_changes' && (!value || value.trim() === '')) {
            throw new Error('Comments are required when requesting changes.');
        }
        if (req.body.action === 'reject' && (!value || value.trim() === '')) {
            // Optional: make comments required for rejection too, or allow empty.
            // For now, let's make them required for rejection as well for clarity.
            throw new Error('Comments are required when rejecting a ticket.');
        }
        return true;
    }),
], (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { ticketId } = req.params;
    const { action, comments } = req.body;
    const manager = req.user;
    try {
        // Use Prisma transaction for approval workflow
        const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Fetch ticket with creator information
            const ticket = yield tx.ticket.findUnique({
                where: { id: parseInt(ticketId) },
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            departmentId: true,
                            managerId: true
                        },
                        include: {
                            department: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                }
            });
            if (!ticket) {
                throw new Error('Ticket not found.');
            }
            if (ticket.status !== 'pending_approval') {
                throw new Error(`Ticket is not pending approval, its status is "${ticket.status}".`);
            }
            // Enhanced authorization: Check if manager is direct manager AND in same department
            const isDirectManager = ticket.createdBy.managerId === manager.id;
            const isSameDepartment = ticket.createdBy.departmentId === manager.departmentId;
            if (!isDirectManager) {
                throw new Error('You are not the direct manager of this ticket creator.');
            }
            if (!isSameDepartment) {
                throw new Error('You can only approve tickets from users in your department.');
            }
            let updatedTicket;
            let notificationSubject = '';
            let notificationText = '';
            let notificationHtml = '';
            if (action === 'approve') {
                const slaDueDate = getSlaDueDate(ticket.priority);
                updatedTicket = yield tx.ticket.update({
                    where: { id: parseInt(ticketId) },
                    data: {
                        status: 'approved',
                        managerComments: null,
                        slaDueDate: slaDueDate,
                        updatedAt: new Date()
                    }
                });
                notificationSubject = `Ticket Approved: #${ticket.id}`;
                notificationText = `Your ticket "${ticket.title}" (#${ticket.id}) has been approved by your manager. It will now proceed to the next stage.`;
                notificationHtml = `<p>Your ticket "<b>${ticket.title}</b>" (#${ticket.id}) has been approved by your manager. It will now proceed to the next stage.</p>`;
            }
            else if (action === 'request_changes') {
                updatedTicket = yield tx.ticket.update({
                    where: { id: parseInt(ticketId) },
                    data: {
                        status: 'awaiting_changes',
                        managerComments: comments,
                        updatedAt: new Date()
                    }
                });
                notificationSubject = `Action Required: Changes Requested for Ticket #${ticket.id}`;
                notificationText = `Changes have been requested for your ticket "${ticket.title}" (#${ticket.id}).\nManager comments: ${comments}\nPlease review and update your ticket.`;
                notificationHtml = `<p>Changes have been requested for your ticket "<b>${ticket.title}</b>" (#${ticket.id}).</p><p><b>Manager comments:</b> ${comments}</p><p>Please review and update your ticket accordingly.</p>`;
            }
            else { // action === 'reject'
                updatedTicket = yield tx.ticket.update({
                    where: { id: parseInt(ticketId) },
                    data: {
                        status: 'rejected',
                        managerComments: comments,
                        updatedAt: new Date()
                    }
                });
                notificationSubject = `Ticket Rejected: #${ticket.id}`;
                notificationText = `Your ticket "${ticket.title}" (#${ticket.id}) has been rejected by your manager.\nReason: ${comments}`;
                notificationHtml = `<p>Your ticket "<b>${ticket.title}</b>" (#${ticket.id}) has been rejected by your manager.</p><p><b>Reason:</b> ${comments}</p>`;
            }
            return {
                ticket: updatedTicket,
                creator: ticket.createdBy,
                notificationSubject,
                notificationText,
                notificationHtml
            };
        }));
        // Send notification email after successful transaction
        if (result.creator.email) {
            try {
                yield (0, emailService_1.sendEmail)({
                    to: result.creator.email,
                    subject: result.notificationSubject,
                    text: result.notificationText,
                    html: result.notificationHtml,
                });
            }
            catch (emailError) {
                console.error('Error sending approval notification:', emailError);
                // Don't fail the approval process if email fails
            }
        }
        res.status(200).json(result.ticket);
    }
    catch (error) {
        console.error('Error during ticket approval/rejection:', error);
        // Handle specific authorization errors
        if (error.message.includes('not the direct manager') ||
            error.message.includes('same department') ||
            error.message.includes('not pending approval')) {
            return res.status(403).json({ message: error.message });
        }
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error during ticket approval process.' });
    }
})));
// @route   POST /api/tickets/:ticketId/approve
// @desc    Approve a ticket (Manager only)  
// @access  Private (Manager only)
router.post('/:ticketId/approve', authMiddleware_1.protect, (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const ticketId = parseInt(req.params.ticketId);
    const { comments } = req.body;
    const managerId = req.user.id;
    // Check if user is a manager
    if (req.user.role !== 'manager') {
        return res.status(403).json({ message: 'Access denied. Manager role required.' });
    }
    const client = yield db_1.default.connect();
    try {
        // Get the ticket and verify manager authority
        const ticketResult = yield client.query(`
      SELECT t.*, u.manager_id, u.username as creator_username 
      FROM tickets t 
      JOIN users u ON t.created_by_user_id = u.id 
      WHERE t.id = $1
    `, [ticketId]);
        const ticket = ticketResult.rows[0];
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }
        if (ticket.manager_id !== managerId) {
            return res.status(403).json({ message: 'You are not authorized to approve this ticket.' });
        }
        if (ticket.status !== 'pending-approval') {
            return res.status(400).json({ message: 'Ticket is not pending approval.' });
        }
        // Approve the ticket
        const slaDueDate = getSlaDueDate(ticket.priority);
        const updateResult = yield client.query(`UPDATE tickets SET status = 'approved', manager_comments = $1, sla_due_date = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`, [comments || null, slaDueDate, ticketId]);
        const updatedTicket = updateResult.rows[0];
        // Send notification to requester
        try {
            const creatorResult = yield client.query('SELECT email FROM users WHERE id = $1', [ticket.created_by_user_id]);
            const creator = creatorResult.rows[0];
            if (creator && creator.email) {
                const subject = `Ticket Approved: #${ticket.id} - ${ticket.title}`;
                const text = `Your ticket "${ticket.title}" (#${ticket.id}) has been approved by your manager. It will now proceed to the next stage.`;
                const html = `<p>Your ticket "<b>${ticket.title}</b>" (#${ticket.id}) has been approved by your manager. It will now proceed to the next stage.</p>`;
                yield (0, emailService_1.sendEmail)({ to: creator.email, subject, text, html });
            }
        }
        catch (emailError) {
            console.error('Error sending approval notification:', emailError);
        }
        res.status(200).json(updatedTicket);
    }
    catch (error) {
        console.error('Error approving ticket:', error);
        res.status(500).json({ message: 'Server error during ticket approval.' });
    }
    finally {
        client.release();
    }
})));
// @route   POST /api/tickets/:ticketId/reject  
// @desc    Reject a ticket (Manager only)
// @access  Private (Manager only)
router.post('/:ticketId/reject', authMiddleware_1.protect, (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const ticketId = parseInt(req.params.ticketId);
    const { comments } = req.body;
    const managerId = req.user.id;
    // Check if user is a manager
    if (req.user.role !== 'manager') {
        return res.status(403).json({ message: 'Access denied. Manager role required.' });
    }
    // Comments are required for rejection
    if (!comments || comments.trim() === '') {
        return res.status(400).json({ message: 'Comments are required when rejecting a ticket.' });
    }
    const client = yield db_1.default.connect();
    try {
        // Get the ticket and verify manager authority
        const ticketResult = yield client.query(`
      SELECT t.*, u.manager_id, u.username as creator_username 
      FROM tickets t 
      JOIN users u ON t.created_by_user_id = u.id 
      WHERE t.id = $1
    `, [ticketId]);
        const ticket = ticketResult.rows[0];
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }
        if (ticket.manager_id !== managerId) {
            return res.status(403).json({ message: 'You are not authorized to reject this ticket.' });
        }
        if (ticket.status !== 'pending-approval') {
            return res.status(400).json({ message: 'Ticket is not pending approval.' });
        }
        // Reject the ticket
        const updateResult = yield client.query(`UPDATE tickets SET status = 'rejected', manager_comments = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`, [comments, ticketId]);
        const updatedTicket = updateResult.rows[0];
        // Send notification to requester
        try {
            const creatorResult = yield client.query('SELECT email FROM users WHERE id = $1', [ticket.created_by_user_id]);
            const creator = creatorResult.rows[0];
            if (creator && creator.email) {
                const subject = `Ticket Rejected: #${ticket.id} - ${ticket.title}`;
                const text = `Your ticket "${ticket.title}" (#${ticket.id}) has been rejected by your manager.\nReason: ${comments}`;
                const html = `<p>Your ticket "<b>${ticket.title}</b>" (#${ticket.id}) has been rejected by your manager.</p><p><b>Reason:</b> ${comments}</p>`;
                yield (0, emailService_1.sendEmail)({ to: creator.email, subject, text, html });
            }
        }
        catch (emailError) {
            console.error('Error sending rejection notification:', emailError);
        }
        res.status(200).json(updatedTicket);
    }
    catch (error) {
        console.error('Error rejecting ticket:', error);
        res.status(500).json({ message: 'Server error during ticket rejection.' });
    }
    finally {
        client.release();
    }
})));
exports.default = router;
