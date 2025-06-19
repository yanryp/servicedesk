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
// src/routes/reportingRoutes.ts
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const router = (0, express_1.Router)();
// @route   GET /api/reporting/summary
// @desc    Get a summary of ticket counts by status and priority
// @access  Private (Admin only)
router.get('/summary', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin'), (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Tickets by status
    const statusPromise = db_1.default.query(`
      SELECT status, COUNT(*) as count
      FROM tickets
      GROUP BY status
    `);
    // Tickets by priority
    const priorityPromise = db_1.default.query(`
      SELECT priority, COUNT(*) as count
      FROM tickets
      GROUP BY priority
    `);
    const [statusResult, priorityResult] = yield Promise.all([
        statusPromise,
        priorityPromise,
    ]);
    const summary = {
        byStatus: statusResult.rows,
        byPriority: priorityResult.rows,
    };
    res.status(200).json(summary);
})));
exports.default = router;
