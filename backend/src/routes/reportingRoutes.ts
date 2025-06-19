// src/routes/reportingRoutes.ts
import { Router } from 'express';
import pool from '../db';
import { protect, authorize } from '../middleware/authMiddleware';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

// @route   GET /api/reporting/summary
// @desc    Get a summary of ticket counts by status and priority
// @access  Private (Admin only)
router.get('/summary',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    // Tickets by status
    const statusPromise = pool.query(`
      SELECT status, COUNT(*) as count
      FROM tickets
      GROUP BY status
    `);

    // Tickets by priority
    const priorityPromise = pool.query(`
      SELECT priority, COUNT(*) as count
      FROM tickets
      GROUP BY priority
    `);

    const [statusResult, priorityResult] = await Promise.all([
      statusPromise,
      priorityPromise,
    ]);

    const summary = {
      byStatus: statusResult.rows,
      byPriority: priorityResult.rows,
    };

    res.status(200).json(summary);
  })
);

export default router;
