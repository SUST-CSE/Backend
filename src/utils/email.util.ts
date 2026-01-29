import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { EmailLog } from '../modules/email-log/email-log.schema';

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
  const subject = 'Verify your SUST CSE Dashboard Account';
  const type = 'VERIFICATION';
  try {
    const info = await transporter.sendMail({
      from: `"SUST CSE Dashboard" <${env.EMAIL_USER}>`,
      to: email,
      subject,
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

    await EmailLog.create({
      recipient: email,
      subject,
      type,
      status: 'SUCCESS',
      sentAt: new Date(),
    });

    console.log('✅ Verification email sent:', info.messageId);
    return info;
  } catch (err: any) {
    console.error('❌ Email sending error:', err);
    await EmailLog.create({
      recipient: email,
      subject,
      type,
      status: 'FAILED',
      error: err.message,
      sentAt: new Date(),
    });
    throw new Error('Failed to send verification email');
  }
};

export const sendPasswordResetEmail = async (email: string, code: string) => {
  const subject = 'Password Reset Code - SUST CSE Dashboard';
  const type = 'PASSWORD_RESET';
  try {
    const info = await transporter.sendMail({
      from: `"SUST CSE Dashboard" <${env.EMAIL_USER}>`,
      to: email,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a; margin-bottom: 24px;">Reset Your Password</h2>
          <p style="color: #475569; font-size: 16px; line-height: 24px;">
            You requested to reset your password for the SUST CSE Dashboard. Use the following code to proceed:
          </p>
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; text-align: center; margin: 32px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #ef4444;">${code}</span>
          </div>
          <p style="color: #475569; font-size: 14px;">
            This code will expire in 10 minutes. If you didn't request a password reset, you can safely ignore this email.
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            &copy; ${new Date().getFullYear()} SUST CSE Department. All rights reserved.
          </p>
        </div>
      `,
    });

    await EmailLog.create({
      recipient: email,
      subject,
      type,
      status: 'SUCCESS',
      sentAt: new Date(),
    });

    console.log('✅ Password reset email sent:', info.messageId);
    return info;
  } catch (err: any) {
    console.error('❌ Password reset email sending error:', err);
    await EmailLog.create({
      recipient: email,
      subject,
      type,
      status: 'FAILED',
      error: err.message,
      sentAt: new Date(),
    });
    throw new Error('Failed to send password reset email');
  }
};

export const sendEmail = async ({ to, subject, html, type = 'GENERAL' }: { to: string; subject: string; html: string; type?: string }) => {
  try {
    const info = await transporter.sendMail({
      from: `"SUST CSE Department" <${env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    await EmailLog.create({
      recipient: to,
      subject,
      type,
      status: 'SUCCESS',
      sentAt: new Date(),
    });

    return info;
  } catch (error: any) {
    console.error('❌ Email sending error:', error);
    await EmailLog.create({
      recipient: to,
      subject,
      type,
      status: 'FAILED',
      error: error.message,
      sentAt: new Date(),
    });
    throw error;
  }
};
