// src/routes/testRoutes.ts
import { Router } from 'express';
import { protect, authorize, AuthenticatedRequest } from '../middleware/authMiddleware';
import { escalateOverdueTickets } from '../services/escalationService';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

// @route   POST /api/test/trigger-escalation
// @desc    Manually trigger the ticket escalation service for testing
// @access  Private (Admin only)
router.post(
  '/trigger-escalation',
  protect,
  authorize('admin'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    console.log('Manual escalation trigger received by admin.');
    try {
      await escalateOverdueTickets();
      res.status(200).json({ message: 'Escalation service triggered successfully. Check console for details.' });
    } catch (error) {
      console.error('Error manually triggering escalation service:', error);
      res.status(500).json({ message: 'Failed to trigger escalation service.' });
    }
  })
);

export default router;
