// BSG Template System API Routes
import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import pool from '../db';
import { protect, AuthenticatedRequest } from '../middleware/authMiddleware';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

// @route   GET /api/bsg-templates/categories
// @desc    Get all BSG template categories
// @access  Private
router.get('/categories', protect, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        c.id,
        c.name,
        c.display_name,
        c.description,
        c.icon,
        COUNT(t.id) as template_count
      FROM bsg_template_categories c
      LEFT JOIN bsg_templates t ON c.id = t.category_id AND t.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id, c.name, c.display_name, c.description, c.icon, c.sort_order
      ORDER BY c.sort_order ASC, c.name ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching BSG template categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching template categories'
    });
  } finally {
    client.release();
  }
}));

// @route   GET /api/bsg-templates/templates
// @desc    Get BSG templates by category with search
// @access  Private
router.get('/templates', protect, [
  query('categoryId').optional().isInt().withMessage('Category ID must be an integer'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative')
], asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { categoryId, search, limit = 20, offset = 0 } = req.query;
  const client = await pool.connect();

  try {
    let whereClause = 'WHERE t.is_active = true';
    const params: any[] = [];
    let paramIndex = 1;

    if (categoryId) {
      whereClause += ` AND t.category_id = $${paramIndex}`;
      params.push(parseInt(categoryId as string));
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (t.name ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const query = `
      SELECT 
        t.id,
        t.template_number,
        t.name,
        t.display_name,
        t.description,
        t.popularity_score,
        t.usage_count,
        c.name as category_name,
        c.display_name as category_display_name
      FROM bsg_templates t
      JOIN bsg_template_categories c ON t.category_id = c.id
      ${whereClause}
      ORDER BY t.popularity_score DESC, t.usage_count DESC, t.template_number ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await client.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching BSG templates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching templates'
    });
  } finally {
    client.release();
  }
}));

// @route   GET /api/bsg-templates/templates/:templateId/fields
// @desc    Get template fields and their options
// @access  Private
router.get('/templates/:templateId/fields', protect, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const templateId = parseInt(req.params.templateId);
  const client = await pool.connect();

  try {
    // Get template fields with their types
    const fieldsResult = await client.query(`
      SELECT 
        f.id,
        f.field_name,
        f.field_label,
        f.field_description,
        f.is_required,
        f.max_length,
        f.sort_order,
        f.placeholder_text,
        f.help_text,
        f.validation_rules,
        ft.name as field_type,
        ft.display_name as field_type_display,
        ft.html_input_type
      FROM bsg_template_fields f
      JOIN bsg_field_types ft ON f.field_type_id = ft.id
      WHERE f.template_id = $1
      ORDER BY f.sort_order ASC, f.id ASC
    `, [templateId]);

    // Get field options for dropdown fields
    const optionsResult = await client.query(`
      SELECT 
        fo.field_id,
        fo.option_value,
        fo.option_label,
        fo.is_default,
        fo.sort_order
      FROM bsg_field_options fo
      JOIN bsg_template_fields f ON fo.field_id = f.id
      WHERE f.template_id = $1
      ORDER BY fo.field_id, fo.sort_order ASC
    `, [templateId]);

    // Group options by field_id
    const optionsByField: { [key: number]: any[] } = {};
    optionsResult.rows.forEach(option => {
      if (!optionsByField[option.field_id]) {
        optionsByField[option.field_id] = [];
      }
      optionsByField[option.field_id].push(option);
    });

    // For dropdown fields that reference master data, get the master data
    const masterDataResult = await client.query(`
      SELECT 
        md.data_type,
        md.code,
        md.name,
        md.display_name,
        md.sort_order
      FROM bsg_master_data md
      WHERE md.is_active = true 
        AND md.data_type IN ('branch', 'olibs_menu')
      ORDER BY md.data_type, md.sort_order ASC, md.name ASC
    `);

    // Group master data by type
    const masterDataByType: { [key: string]: any[] } = {};
    masterDataResult.rows.forEach(item => {
      if (!masterDataByType[item.data_type]) {
        masterDataByType[item.data_type] = [];
      }
      masterDataByType[item.data_type].push(item);
    });

    // Combine fields with their options
    const fields = fieldsResult.rows.map(field => ({
      ...field,
      options: optionsByField[field.id] || [],
      masterData: field.field_type.includes('dropdown_') 
        ? masterDataByType[field.field_type.replace('dropdown_', '')] || []
        : []
    }));

    res.json({
      success: true,
      data: fields
    });
  } catch (error) {
    console.error('Error fetching template fields:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching template fields'
    });
  } finally {
    client.release();
  }
}));

// @route   GET /api/bsg-templates/master-data/:dataType
// @desc    Get master data by type (branches, menus, etc.)
// @access  Private
router.get('/master-data/:dataType', protect, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { dataType } = req.params;
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT 
        id,
        code,
        name,
        display_name,
        parent_id,
        metadata,
        sort_order
      FROM bsg_master_data
      WHERE data_type = $1 AND is_active = true
      ORDER BY sort_order ASC, name ASC
    `, [dataType]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching master data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching master data'
    });
  } finally {
    client.release();
  }
}));

// @route   POST /api/bsg-templates/templates/:templateId/usage
// @desc    Log template usage for analytics
// @access  Private
router.post('/templates/:templateId/usage', protect, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const templateId = parseInt(req.params.templateId);
  const { actionType, sessionId, completionTimeMs } = req.body;
  const userId = req.user!.id;
  const departmentId = req.user!.departmentId;

  const client = await pool.connect();
  try {
    await client.query(`
      INSERT INTO bsg_template_usage_logs 
      (template_id, user_id, department_id, action_type, session_id, completion_time_ms, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      templateId,
      userId,
      departmentId,
      actionType,
      sessionId,
      completionTimeMs,
      req.ip,
      req.get('User-Agent')
    ]);

    // Update template usage count
    if (actionType === 'completed') {
      await client.query(`
        UPDATE bsg_templates 
        SET usage_count = usage_count + 1, popularity_score = popularity_score + 1
        WHERE id = $1
      `, [templateId]);
    }

    res.json({
      success: true,
      message: 'Usage logged successfully'
    });
  } catch (error) {
    console.error('Error logging template usage:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging usage'
    });
  } finally {
    client.release();
  }
}));

export default router;