import nodemailer from 'nodemailer';
import { env } from '@/config/env';

// Create reusable transporter using dynamic SMTP config
const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: parseInt(env.EMAIL_PORT),
  secure: env.EMAIL_PORT === '465', // true for 465, false for 587 (STARTTLS)
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS.replace(/\s/g, ''), // Remove any spaces from app password
  },
});

export const sendVerificationEmail = async (email: string, code: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"SUST CSE Dashboard" <${env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your SUST CSE Dashboard Account',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a; margin-bottom: 24px;">Confirm Your Email</h2>
          <p style="color: #475569; font-size: 16px; line-height: 24px;">
            Thank you for registering for the SUST CSE Dashboard. Use the following verification code to complete your registration:
          </p>
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; text-align: center; margin: 32px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #16a34a;">${code}</span>
          </div>
          <p style="color: #475569; font-size: 14px;">
            This code will expire in 10 minutes. If you didn't request this code, you can safely ignore this email.
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            &copy; ${new Date().getFullYear()} SUST CSE Department. All rights reserved.
          </p>
        </div>
      `,
    });

    console.log('✅ Verification email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('❌ Email sending error:', err);
    throw new Error('Failed to send verification email');
  }
};

export const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
  try {
    const info = await transporter.sendMail({
      from: `"SUST CSE Department" <${env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    console.error('❌ Email sending error:', error);
    throw error;
  }
};
