// src/services/escalationService.ts
import cron from 'node-cron';
import pool from '../db';
import { sendEmail } from './emailService';

const escalateTicket = async (ticket: any) => {
  const escalationEmail = process.env.ESCALATION_EMAIL;
  if (!escalationEmail) {
    console.error('ESCALATION_EMAIL not configured. Skipping escalation email.');
    return;
  }

  try {
    // Update priority to urgent
    await pool.query(
      `UPDATE tickets SET priority = 'urgent', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [ticket.id]
    );

    // Send notification email
    const subject = `Ticket Escalation: #${ticket.id} - ${ticket.title}`;
    const text = `Ticket #${ticket.id} has breached its SLA and has been automatically escalated to 'urgent' priority.\n\nPlease review it immediately.\n\nDetails:\nTitle: ${ticket.title}\nDescription: ${ticket.description}\nCreated: ${new Date(ticket.created_at).toLocaleString()}`;
    const html = `<p>${text.replace(/\n/g, '<br>')}</p>`;
    
    await sendEmail({ to: escalationEmail, subject, text, html });
    console.log(`Ticket #${ticket.id} escalated and notification sent.`);

  } catch (error) {
    console.error(`Failed to escalate ticket #${ticket.id}:`, error);
  }
};

export const escalateOverdueTickets = async () => {
  console.log('Running SLA escalation check...');
  try {
    const overdueTicketsResult = await pool.query(`
      SELECT * FROM tickets
      WHERE sla_due_date < NOW() 
      AND status NOT IN ('closed', 'resolved')
      AND priority != 'urgent';
    `);

    const overdueTickets = overdueTicketsResult.rows;
    if (overdueTickets.length > 0) {
      console.log(`Found ${overdueTickets.length} overdue tickets to escalate.`);
      for (const ticket of overdueTickets) {
        await escalateTicket(ticket);
      }
    } else {
      console.log('No overdue tickets found.');
    }
  } catch (error) {
    console.error('Error checking for overdue tickets:', error);
  }
};

// Schedule the job to run every hour
export const startEscalationCronJob = () => {
  // Schedule to run every hour
  cron.schedule('0 * * * *', () => {
    escalateOverdueTickets();
  });
  console.log('SLA Escalation cron job started. Runs every hour.');
};
