import { transporter } from '../lib/mailer'; // adjust path as needed
import logger from '../lib/logger';
import EmailLog from '../models/emailLog';

export async function sendEmail(options: { to: string; subject: string; text?: string; html?: string }) {
  logger.info('Sending email', { to: options.to, subject: options.subject });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    logger.info('Email sent', { messageId: info.messageId });

    // ✅ Save to DB
    await EmailLog.create({
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      messageId: info.messageId,
    });

    return info;
  } catch (err) {
    logger.error('Error sending email', err);
    throw err;
  }
}
