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
exports.startEscalationCronJob = exports.escalateOverdueTickets = void 0;
// src/services/escalationService.ts
const node_cron_1 = __importDefault(require("node-cron"));
const db_1 = __importDefault(require("../db"));
const emailService_1 = require("./emailService");
const escalateTicket = (ticket) => __awaiter(void 0, void 0, void 0, function* () {
    const escalationEmail = process.env.ESCALATION_EMAIL;
    if (!escalationEmail) {
        console.error('ESCALATION_EMAIL not configured. Skipping escalation email.');
        return;
    }
    try {
        // Update priority to urgent
        yield db_1.default.query(`UPDATE tickets SET priority = 'urgent', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [ticket.id]);
        // Send notification email
        const subject = `Ticket Escalation: #${ticket.id} - ${ticket.title}`;
        const text = `Ticket #${ticket.id} has breached its SLA and has been automatically escalated to 'urgent' priority.\n\nPlease review it immediately.\n\nDetails:\nTitle: ${ticket.title}\nDescription: ${ticket.description}\nCreated: ${new Date(ticket.created_at).toLocaleString()}`;
        const html = `<p>${text.replace(/\n/g, '<br>')}</p>`;
        yield (0, emailService_1.sendEmail)({ to: escalationEmail, subject, text, html });
        console.log(`Ticket #${ticket.id} escalated and notification sent.`);
    }
    catch (error) {
        console.error(`Failed to escalate ticket #${ticket.id}:`, error);
    }
});
const escalateOverdueTickets = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Running SLA escalation check...');
    try {
        const overdueTicketsResult = yield db_1.default.query(`
      SELECT * FROM tickets
      WHERE sla_due_date < NOW() 
      AND status NOT IN ('closed', 'resolved')
      AND priority != 'urgent';
    `);
        const overdueTickets = overdueTicketsResult.rows;
        if (overdueTickets.length > 0) {
            console.log(`Found ${overdueTickets.length} overdue tickets to escalate.`);
            for (const ticket of overdueTickets) {
                yield escalateTicket(ticket);
            }
        }
        else {
            console.log('No overdue tickets found.');
        }
    }
    catch (error) {
        console.error('Error checking for overdue tickets:', error);
    }
});
exports.escalateOverdueTickets = escalateOverdueTickets;
// Schedule the job to run every hour
const startEscalationCronJob = () => {
    // Schedule to run every hour
    node_cron_1.default.schedule('0 * * * *', () => {
        (0, exports.escalateOverdueTickets)();
    });
    console.log('SLA Escalation cron job started. Runs every hour.');
};
exports.startEscalationCronJob = startEscalationCronJob;
