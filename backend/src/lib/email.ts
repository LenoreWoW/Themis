import nodemailer from 'nodemailer';
import { createTransport } from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: EmailAttachment[];
}

interface EmailAttachment {
  filename: string;
  path?: string;
  content?: Buffer | string;
  contentType?: string;
}

// Create reusable transporter object using SMTP transport
let transporter: nodemailer.Transporter;

/**
 * Initialize email transport
 */
export function initEmailTransport(): void {
  // Read email configuration from environment variables
  const host = process.env.SMTP_HOST || 'smtp.example.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const from = process.env.EMAIL_FROM || 'themis@example.com';
  
  // Create transport
  transporter = createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });
  
  console.log(`Email transport initialized with host: ${host}, port: ${port}`);
}

/**
 * Send an email
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  // Initialize transport if not already done
  if (!transporter) {
    initEmailTransport();
  }
  
  // Extract options
  const { to, subject, text, html, cc, bcc, attachments } = options;
  
  // Set from address
  const from = process.env.EMAIL_FROM || 'themis@example.com';
  
  // Send email
  try {
    const info = await transporter.sendMail({
      from,
      to,
      cc,
      bcc,
      subject,
      text,
      html: html || text,
      attachments
    });
    
    console.log(`Email sent: ${info.messageId}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send a test email
 */
export async function sendTestEmail(to: string): Promise<void> {
  // Initialize transport if not already done
  if (!transporter) {
    initEmailTransport();
  }
  
  // Send test email
  try {
    await sendEmail({
      to,
      subject: 'Themis Test Email',
      text: 'This is a test email from Themis to verify your email configuration.',
      html: `
        <h1>Themis Email Test</h1>
        <p>This is a test email from Themis to verify your email configuration.</p>
        <p>If you received this email, your email configuration is working correctly.</p>
      `
    });
    
    console.log(`Test email sent to ${to}`);
  } catch (error) {
    console.error('Error sending test email:', error);
    throw error;
  }
}

// Initialize email transport on module load
initEmailTransport(); 