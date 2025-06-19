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
// src/routes/testRoutes.ts
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const escalationService_1 = require("../services/escalationService");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const router = (0, express_1.Router)();
// @route   POST /api/test/trigger-escalation
// @desc    Manually trigger the ticket escalation service for testing
// @access  Private (Admin only)
router.post('/trigger-escalation', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin'), (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Manual escalation trigger received by admin.');
    try {
        yield (0, escalationService_1.escalateOverdueTickets)();
        res.status(200).json({ message: 'Escalation service triggered successfully. Check console for details.' });
    }
    catch (error) {
        console.error('Error manually triggering escalation service:', error);
        res.status(500).json({ message: 'Failed to trigger escalation service.' });
    }
})));
exports.default = router;
