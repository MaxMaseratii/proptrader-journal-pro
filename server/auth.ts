import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { users } from '@shared/schema';
import { db } from './db';
import { eq } from 'drizzle-orm';

// Email transporter setup
const transporter = nodemailer.createTransport({
  // Configure with your email service
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@proptraderjournal.com',
    to: email,
    subject: 'Verify Your Email - PropTrader Journal',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">Welcome to PropTrader Journal!</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Verify Email Address
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
        <p>This verification link will expire in 24 hours.</p>
        <hr style="margin: 40px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          If you didn't create an account with PropTrader Journal, please ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}