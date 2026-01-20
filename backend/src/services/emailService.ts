import nodemailer from 'nodemailer';
import logger from '../middlewares/logger';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify connection
transporter.verify((error) => {
  if (error) {
    logger.error('Email service error:', error);
  } else {
    logger.info('Email service is ready');
  }
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email
 */
export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Employee Management" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    logger.info(`Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Failed to send email:', error);
    return false;
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  name: string
): Promise<boolean> => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7CB8E8 0%, #A8D5F2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #7CB8E8; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>You requested to reset your password for your Employee Management System account.</p>
          <p>Click the button below to reset your password:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #7CB8E8;">${resetUrl}</p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
          <p>Best regards,<br>Employee Management Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Hi ${name},

    You requested to reset your password for your Employee Management System account.

    Click this link to reset your password: ${resetUrl}

    This link will expire in 1 hour.

    If you didn't request this, please ignore this email.

    Best regards,
    Employee Management Team
  `;

  return sendEmail({
    to: email,
    subject: 'Password Reset Request - Employee Management System',
    html,
    text,
  });
};

/**
 * Send password reset confirmation email
 */
export const sendPasswordResetConfirmation = async (
  email: string,
  name: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7CB8E8 0%, #A8D5F2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Changed Successfully</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <div class="success">
            <strong>✓ Your password has been changed successfully!</strong>
          </div>
          <p>Your password was recently changed. You can now log in with your new password.</p>
          <p>If you didn't make this change, please contact your administrator immediately.</p>
          <p>Best regards,<br>Employee Management Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Password Changed - Employee Management System',
    html,
    text: `Hi ${name}, Your password has been changed successfully. If you didn't make this change, please contact your administrator immediately.`,
  });
};

/**
 * Send leave status email
 */
export const sendLeaveStatusEmail = async (
  email: string,
  name: string,
  status: string,
  type: string,
  startDate: Date,
  endDate: Date,
  approvedBy?: string
): Promise<boolean> => {
  const isApproved = status === 'APPROVED';
  const color = isApproved ? '#28a745' : '#dc3545';
  const title = isApproved ? 'Leave Approved' : 'Leave Rejected';
  const statusText = isApproved ? 'approved' : 'rejected';

  // Format dates
  const start = new Date(startDate).toLocaleDateString();
  const end = new Date(endDate).toLocaleDateString();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, ${isApproved ? '#28a745' : '#dc3545'} 0%, ${isApproved ? '#5cd677' : '#ff6b7d'} 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .status-badge { display: inline-block; padding: 8px 15px; background: ${color}; color: white; border-radius: 20px; font-weight: bold; margin: 10px 0; }
        .details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid ${color}; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Your ${type.toLowerCase()} leave request has been <strong>${statusText}</strong>.</p>
          
          <div class="details">
            <p><strong>Leave Type:</strong> ${type}</p>
            <p><strong>Duration:</strong> ${start} to ${end}</p>
            <p><strong>Status:</strong> <span style="color: ${color}; font-weight: bold;">${status}</span></p>
          </div>
          
          <p>Please log in to your dashboard to view full details.</p>
          
          <p>Best regards,<br>Employee Management Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Leave Request ${status} - Employee Management System`,
    html,
    text: `Hi ${name}, Your ${type} leave request from ${start} to ${end} has been ${statusText}.`,
  });
};

export default { sendEmail, sendPasswordResetEmail, sendPasswordResetConfirmation, sendLeaveStatusEmail };
