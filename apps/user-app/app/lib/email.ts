/* eslint-disable @typescript-eslint/no-unused-vars */
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

interface VerificationPayload {
  email: string;
  iat?: number;
  exp?: number;
}

interface SMTPError extends Error {
  code?: string;
  command?: string;
  response?: string;
  responseCode?: number;
}

// Log environment variables (without sensitive data)
console.log('SMTP Configuration:', {
  host: process.env.SMTP_ENDPOINT,
  port: 587,
  secure: true,
  from: process.env.FROM,
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
  hasUsername: !!process.env.SMTP_USERNAME,
  hasPassword: !!process.env.SMTP_PASSWORD,
});

const transport = nodemailer.createTransport({
  host: process.env.SMTP_ENDPOINT,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
  debug: true, // Enable debug logging
  logger: true, // Enable logger
});

// Verify SMTP connection configuration
transport.verify(function(error, success) {
  if (error) {
    const smtpError = error as SMTPError;
    console.error('SMTP connection error:', {
      code: smtpError.code,
      command: smtpError.command,
      response: smtpError.response,
      responseCode: smtpError.responseCode,
      stack: smtpError.stack
    });
  } else {
    console.log('SMTP server is ready to take our messages');
  }
});

export const generateVerificationToken = (email: string) => {
  return jwt.sign(
    { email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

export const verifyToken = (token: string): VerificationPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as VerificationPayload;
  } catch (error) {
    return null;
  }
};

export const sendVerificationEmail = async (email: string) => {
  try {
    console.log('Starting email verification process for:', email);
    
    const token = generateVerificationToken(email);
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
    
    console.log('Generated verification URL:', verificationUrl);

    const mailOptions = {
      from: `"Sawari" <${process.env.FROM}>`,
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a56db;">Welcome to Sawari!</h1>
          <p>Thank you for registering with Sawari. Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
          <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
    };

    console.log('Attempting to send email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    const info = await transport.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
    });
    return true;
  } catch (error) {
    const smtpError = error as SMTPError;
    console.error('Detailed error sending verification email:', {
      name: smtpError.name,
      message: smtpError.message,
      code: smtpError.code,
      command: smtpError.command,
      response: smtpError.response,
      responseCode: smtpError.responseCode,
      stack: smtpError.stack
    });
    throw new Error(`Failed to send verification email: ${smtpError.message}`);
  }
}; 