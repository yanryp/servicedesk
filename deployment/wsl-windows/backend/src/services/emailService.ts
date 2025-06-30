import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: parseInt(process.env.EMAIL_PORT || '587', 10) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // Your email username
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export const sendEmail = async (options: MailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `"Ticketing System" <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // In a real app, you might want to throw the error or handle it differently
    // For now, we'll just log it to avoid crashing the ticket creation process
  }
};
