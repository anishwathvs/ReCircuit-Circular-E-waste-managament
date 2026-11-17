import { prisma } from '../config/db.js';
import { sendTransactionalEmail } from './email.service.js';

export interface NotificationPayload {
  userId: string;
  userEmail?: string;
  userName?: string;
  title: string;
  message: string;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  link?: string;
  sendEmail?: boolean;
}

export const notifyUser = async (payload: NotificationPayload): Promise<void> => {
  try {
    // 1. Create In-App Notification in PostgreSQL
    await prisma.notification.create({
      data: {
        userId: payload.userId,
        title: payload.title,
        message: payload.message,
        type: payload.type || 'INFO',
        link: payload.link,
      },
    });

    // 2. Send Transactional Email if email is available or fetch from user
    if (payload.sendEmail !== false) {
      let email = payload.userEmail;
      let name = payload.userName;

      if (!email) {
        const u = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { email: true, name: true },
        });
        if (u) {
          email = u.email;
          name = u.name;
        }
      }

      if (email) {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5EBE5; border-radius: 12px; background-color: #F8FAF7;">
            <div style="background-color: #084D36; padding: 16px 20px; border-radius: 8px 8px 0 0; color: #FFFFFF; display: flex; align-items: center;">
              <h2 style="margin: 0; font-size: 20px;">ReCircuit — Circular E-Waste Platform</h2>
            </div>
            <div style="padding: 24px; background-color: #FFFFFF; border-radius: 0 0 8px 8px;">
              <p style="font-size: 14px; color: #151A17;">Hello <strong>${name || 'Valued User'}</strong>,</p>
              <h3 style="color: #084D36; font-size: 16px; margin-top: 10px;">${payload.title}</h3>
              <p style="font-size: 14px; color: #6B756E; line-height: 1.5;">${payload.message}</p>
              ${
                payload.link
                  ? `<div style="margin-top: 20px;">
                      <a href="${(process.env.CLIENT_URL || 'https://recircuit-frontend.vercel.app').replace(/\/+$/, '')}${payload.link}" style="display: inline-block; padding: 10px 20px; background-color: #084D36; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px;">View in Dashboard</a>
                    </div>`
                  : ''
              }
              <hr style="border: none; border-top: 1px solid #E5EBE5; margin: 24px 0 16px 0;" />
              <p style="font-size: 11px; color: #8F9A92;">
                Zero-Landfill Commitment • Certified Safe Data Destruction • CPCB Authorized Partner
              </p>
            </div>
          </div>
        `;

        sendTransactionalEmail({
          to: email,
          subject: `[ReCircuit] ${payload.title}`,
          html: emailHtml,
          text: `${payload.title}\n\n${payload.message}`,
        }).catch((err) => console.error('Transactional email send error:', err));
      }
    }
  } catch (error) {
    console.error('Error dispatching notification:', error);
  }
};

