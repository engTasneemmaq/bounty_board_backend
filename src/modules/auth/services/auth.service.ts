// src/modules/auth/services/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../user/entities/user.entity';
import { MailService } from '../../../shared/mail/mail.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../dto/auth.dto';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import { Sequelize as SequelizeOrigin, UniqueConstraintError as SequelizeUniqueConstraintError, CreationAttributes } from 'sequelize';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    private jwtService: JwtService,
    private mailService: MailService,
    private readonly configService: ConfigService,
    private readonly sequelize: Sequelize, // for transaction
  ) { }

  /* ---------- basic auth ---------- */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      // Check if email is verified
      if (!user.isVerified) {
        throw new UnauthorizedException('Please verify your email before logging in.');
      }
      const { password, ...result } = user.toJSON();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, roles: user.roles };
    return { access_token: this.jwtService.sign(payload) };
  }

  async validateUserById(id: number): Promise<any> {
    return this.userModel.findOne({
      where: { id },
      include: ['roles'],
    });
  }

  /**
   * Register a new user with e-mail verification.
   * @param userData RegisterDto
   * @throws ConflictException if email or username already exists
   * @returns { message: string }
   */
  async register(userData: RegisterDto): Promise<{ message: string }> {
    let transaction: Transaction | undefined;
    try {
      transaction = await this.sequelize.transaction();
      // Check email
      const emailExists = await this.userModel.findOne({ where: { email: userData.email }, transaction });
      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
      // Check username
      const usernameExists = await this.userModel.findOne({ where: { username: userData.username }, transaction });
      if (usernameExists) {
        throw new ConflictException('Username already exists');
      }
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      // Create user
      const user = await this.userModel.create(
        {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          username: userData.username,
          password: hashedPassword,
          isVerified: false,
        } as CreationAttributes<User>,
        { transaction }
      );
      // Generate verification token
      const token = this.jwtService.sign(
        { sub: user.id, email: user.email },
        { expiresIn: '24h' },
      );
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;
      // Send verification email
      const html = `<h1>Welcome, ${user.firstName}!</h1>
        <p>Thank you for registering. Please verify your email by clicking the button below:</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">Verify Email</a>
        <p>If you did not register, please ignore this email.</p>`;
      await this.mailService.sendMail(user.email, 'Verify your account', html);
      await transaction.commit();
      return { message: 'Registration successful. Check your inbox.' };
    } catch (err) {
      if (transaction) await transaction.rollback();
      if (err instanceof SequelizeUniqueConstraintError) {
        throw new ConflictException('Email or username already exists');
      }
      throw err;
    }
  }

  /* ---------- email verification ---------- */
  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userModel.findOne({
        where: { id: payload.sub, email: payload.email },
      });
      if (!user) {
        return { message: 'Invalid or expired verification link.' };
      }
      if (user.isVerified) {
        return { message: 'Email is already verified.' };
      }
      user.isVerified = true;
      await user.save();
      return { message: 'Email verified successfully!' };
    } catch {
      return { message: 'Invalid or expired verification link.' };
    }
  }

  /**
   * Resend verification email for unverified users.
   * @param email User's email address
   * @returns { message: string }
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists for security
      return { message: 'If an account with that email exists, a verification link has been sent.' };
    }

    if (user.isVerified) {
      return { message: 'Email is already verified.' };
    }

    // Generate new verification token
    const token = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '24h' },
    );

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

    // Send verification email
    const html = `<h1>Email Verification</h1>
      <p>Hello ${user.firstName},</p>
      <p>You requested a new verification email. Please verify your email by clicking the button below:</p>
      <a href="${verifyUrl}" style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">Verify Email</a>
      <p>If you did not request this, please ignore this email.</p>`;

    await this.mailService.sendMail(user.email, 'Verify your account', html);

    return { message: 'Verification email sent successfully.' };
  }

  /* ---------- password reset flow ---------- */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ where: { email } });
    if (user) {
      const token = this.jwtService.sign(
        { sub: user.id, email: user.email },
        { expiresIn: '1h' },
      );
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'
        }/reset-password?token=${token}`;

      const html = `<p>You requested a password reset.</p>
                    <p>Click <a href="${resetUrl}">here</a> to reset your password. 
                    This link is valid for 1 hour.</p>`;

      await this.mailService.sendMail(
        user.email,
        'Reset your password',
        html,
      );
    }
    // Always return the same message for security
    return {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userModel.findOne({
        where: { id: payload.sub, email: payload.email },
      });
      if (!user) {
        return { message: 'Invalid or expired password reset link.' };
      }
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      return { message: 'Password reset successful.' };
    } catch {
      return { message: 'Invalid or expired password reset link.' };
    }
  }
}
