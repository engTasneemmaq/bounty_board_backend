// src/auth/auth.controller.ts
import { Body, Controller, Post, Get, Query, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import {
    RegisterDto,
    LoginDto,
    ForgotPasswordDto,
    ResetPasswordDto,
} from '../dto/auth.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({
        status: 201,
        description:
            'Registration successful! Please check your email to verify your account.',
    })
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiResponse({
        status: 201,
        description: 'Login successful, returns JWT token.',
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid credentials or email not verified.',
    })
    async login(@Body() dto: LoginDto) {
        const user = await this.authService.validateUser(dto.email, dto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials.');
        }
        return this.authService.login(user);
    }

    @Get('verify-email')
    @ApiOperation({ summary: 'Verify user email with token' })
    @ApiResponse({ status: 200, description: 'Email verified successfully!' })
    @ApiResponse({
        status: 400,
        description: 'Invalid or expired verification link.',
    })
    async verifyEmail(@Query('token') token: string) {
        return this.authService.verifyEmail(token);
    }

    @Post('resend-verification')
    @ApiOperation({ summary: 'Resend verification email' })
    @ApiResponse({
        status: 200,
        description: 'Verification email sent successfully.',
    })
    async resendVerification(@Body() dto: ForgotPasswordDto) {
        return this.authService.resendVerificationEmail(dto.email);
    }

    @Post('forgot-password')
    @ApiOperation({ summary: 'Request a password reset link' })
    @ApiResponse({
        status: 200,
        description: 'Password reset email sent if user exists.',
    })
    forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto.email);
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password using token' })
    @ApiResponse({ status: 200, description: 'Password reset successful.' })
    @ApiResponse({ status: 400, description: 'Invalid or expired token.' })
    resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto.token, dto.newPassword);
    }
}
