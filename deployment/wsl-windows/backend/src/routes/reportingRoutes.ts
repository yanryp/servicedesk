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

// @route   GET /api/reporting/dashboard
// @desc    Get comprehensive dashboard data with SLA metrics
// @access  Private (Admin only)
router.get('/dashboard',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    try {
      // Current time for SLA calculations
      const now = new Date();

      // 1. Tickets by status with counts
      const statusQuery = `
        SELECT status, COUNT(*) as count
        FROM tickets
        GROUP BY status
        ORDER BY count DESC
      `;

      // 2. Tickets by priority with counts
      const priorityQuery = `
        SELECT priority, COUNT(*) as count
        FROM tickets
        GROUP BY priority
        ORDER BY 
          CASE priority 
            WHEN 'urgent' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
            ELSE 5
          END
      `;

      // 3. SLA Metrics - tickets approaching or breaching SLA
      const slaQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE sla_due_date < $1) as breached,
          COUNT(*) FILTER (WHERE sla_due_date BETWEEN $1 AND $1 + INTERVAL '4 hours') as approaching,
          COUNT(*) FILTER (WHERE sla_due_date > $1 + INTERVAL '4 hours') as on_time,
          COUNT(*) as total_active
        FROM tickets 
        WHERE status NOT IN ('closed', 'resolved', 'cancelled')
      `;

      // 4. Tickets created over time (last 30 days)
      const trendsQuery = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM tickets
        WHERE created_at >= $1
        GROUP BY DATE(created_at)
        ORDER BY date
      `;

      // 5. Resolution time metrics
      const resolutionQuery = `
        SELECT 
          AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_resolution_hours,
          COUNT(*) FILTER (WHERE resolved_at IS NOT NULL) as resolved_count,
          COUNT(*) as total_count
        FROM tickets
        WHERE created_at >= $1
      `;

      // 6. Technician performance
      const technicianQuery = `
        SELECT 
          u.username,
          COUNT(t.id) as assigned_tickets,
          COUNT(CASE WHEN t.status = 'resolved' THEN 1 END) as resolved_tickets,
          AVG(CASE WHEN t.resolved_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (t.resolved_at - t.created_at))/3600 
          END) as avg_resolution_hours
        FROM users u
        LEFT JOIN tickets t ON u.id = t.assigned_to_user_id
        WHERE u.role IN ('technician', 'manager')
        GROUP BY u.id, u.username
        ORDER BY resolved_tickets DESC
        LIMIT 10
      `;

      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Execute all queries
      const [
        statusResult,
        priorityResult,
        slaResult,
        trendsResult,
        resolutionResult,
        technicianResult
      ] = await Promise.all([
        pool.query(statusQuery),
        pool.query(priorityQuery),
        pool.query(slaQuery, [now]),
        pool.query(trendsQuery, [thirtyDaysAgo]),
        pool.query(resolutionQuery, [thirtyDaysAgo]),
        pool.query(technicianQuery)
      ]);

      // Calculate SLA compliance percentage
      const slaData = slaResult.rows[0];
      const slaCompliance = slaData.total_active > 0 
        ? ((slaData.on_time + slaData.approaching) / slaData.total_active * 100).toFixed(1)
        : "100.0";

      // Format response
      const dashboard = {
        overview: {
          totalTickets: statusResult.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
          slaCompliance: parseFloat(slaCompliance),
          avgResolutionTime: resolutionResult.rows[0]?.avg_resolution_hours 
            ? parseFloat(parseFloat(resolutionResult.rows[0].avg_resolution_hours).toFixed(1))
            : 0,
          resolvedTickets: resolutionResult.rows[0]?.resolved_count || 0
        },
        charts: {
          ticketsByStatus: statusResult.rows.map(row => ({
            status: row.status,
            count: parseInt(row.count)
          })),
          ticketsByPriority: priorityResult.rows.map(row => ({
            priority: row.priority,
            count: parseInt(row.count)
          })),
          slaMetrics: {
            breached: parseInt(slaData.breached) || 0,
            approaching: parseInt(slaData.approaching) || 0,
            onTime: parseInt(slaData.on_time) || 0,
            compliance: parseFloat(slaCompliance)
          },
          ticketTrends: trendsResult.rows.map(row => ({
            date: row.date,
            count: parseInt(row.count)
          }))
        },
        technicians: technicianResult.rows.map(row => ({
          username: row.username,
          assignedTickets: parseInt(row.assigned_tickets) || 0,
          resolvedTickets: parseInt(row.resolved_tickets) || 0,
          avgResolutionHours: row.avg_resolution_hours 
            ? parseFloat(parseFloat(row.avg_resolution_hours).toFixed(1))
            : 0
        }))
      };

      res.status(200).json(dashboard);
    } catch (error) {
      console.error('Dashboard reporting error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate dashboard data'
      });
    }
  })
);

export default router;
