// src/shared/mail/mail.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor(private config: ConfigService) {
        const host = this.config.get<string>('MAIL_HOST', 'localhost');
        const port = Number(this.config.get<number>('MAIL_PORT', 1025)); // MailHog?
        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465, // true لــ SMTP TLS فقط
            auth: {
                user: this.config.get<string>('MAIL_USER', ''),
                pass: this.config.get<string>('MAIL_PASSWORD', ''),
            },
        });
    }

    /* ---------- helpers ---------- */
    private async _send(
        to: string,
        subject: string,
        html: string,
    ): Promise<void> {
        if (!to) {
            throw new InternalServerErrorException('Attempted to send email with empty "to" field');
        }
        await this.transporter.sendMail({
            from: this.config.get<string>('MAIL_FROM', 'no-reply@example.com'),
            to,
            subject,
            html,
        });
    }

    /* ---------- public API ---------- */
    async sendWelcomeEmail(email: string, username: string) {
        await this._send(
            email,
            'Welcome to Bounty Board!',
            `<h1>Welcome, ${username}!</h1><p>We’re excited to have you on board.</p>`,
        );
    }

    async sendPasswordResetEmail(email: string, resetToken: string) {
        const resetUrl = `${this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000'
            }/reset-password?token=${resetToken}`;

        await this._send(
            email,
            'Password Reset Request',
            `<p>You requested a password reset.</p>
       <p>Click <a href="${resetUrl}">here</a> to reset your password.
       This link is valid for 1 hour.</p>`,
        );
    }

    async sendMail(to: string, subject: string, html: string) {
        await this._send(to, subject, html);
    }
}
