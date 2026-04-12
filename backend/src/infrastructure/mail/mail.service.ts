import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('GMAIL_USER'),
        pass: this.configService.get<string>('GMAIL_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

    await this.send({
      to: email,
      subject: 'Verify Your Email — Mess Management',
      html: `
        <h2>Welcome to Mess Management!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verifyUrl}">Verify Email</a>
        <p>This link expires in 24 hours.</p>
        <p>If you did not register, ignore this email.</p>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    await this.send({
      to: email,
      subject: 'Reset Your Password — Mess Management',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request a password reset, ignore this email.</p>
      `,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.send({
      to: email,
      subject: 'Welcome to Mess Management!',
      html: `
        <h2>Welcome, ${name}!</h2>
        <p>Your account has been verified and you can now log in.</p>
        <p>Thank you for joining the Mess Management platform.</p>
      `,
    });
  }

  async sendInvoiceNotification(
    email: string,
    name: string,
    month: number,
    year: number,
    totalAmount: number,
  ): Promise<void> {
    await this.send({
      to: email,
      subject: `Invoice Ready — ${this.getMonthName(month)} ${year}`,
      html: `
        <h2>Your Invoice is Ready</h2>
        <p>Dear ${name},</p>
        <p>Your meal invoice for ${this.getMonthName(month)} ${year} has been generated.</p>
        <p><strong>Total Amount: ${totalAmount}</strong></p>
        <p>Please log in to view the details and make payment.</p>
      `,
    });
  }

  private async send(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    try {
      const gmailUser = this.configService.get<string>('GMAIL_USER');
      await this.transporter.sendMail({
        from: `"Mess Management" <${gmailUser}>`,
        ...options,
      });
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}: ${error}`);
      // Don't throw — email failures should not break the main flow
    }
  }

  private getMonthName(month: number): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[month - 1] || 'Unknown';
  }
}
