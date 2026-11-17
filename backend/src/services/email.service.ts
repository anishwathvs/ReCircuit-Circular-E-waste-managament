import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.ethereal.email';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || 'ReCircuit Platform <notifications@recircuit.in>';

// Reusable transporter
let transporter: any = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  } else {
    // In production or when credentials not configured, use simulated logger to avoid network delay
    transporter = null;
  }

  return transporter;
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendTransactionalEmail = async (options: EmailOptions): Promise<{ sent: boolean; messageId?: string; previewUrl?: string }> => {
  try {
    const t = await getTransporter();
    if (!t) {
      console.log(`[EMAIL SIMULATED to ${options.to}]: ${options.subject}`);
      return { sent: true, messageId: `mock-${Date.now()}` };
    }

    const info = await t.sendMail({
      from: SMTP_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text || options.subject,
      html: options.html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    console.log(`📧 Transactional email sent to ${options.to}: ${info.messageId} ${previewUrl ? `(Preview: ${previewUrl})` : ''}`);
    return { sent: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error('Email send failed:', error);
    // Never crash the request on notification email failure
    return { sent: false };
  }
};
