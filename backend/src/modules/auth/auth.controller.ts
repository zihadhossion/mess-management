import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import {
  VerifyEmailDto,
  ResendVerificationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dtos/verify-email.dto';
import { Public } from '../../core/decorators/public.decorator';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { SetTokenInterceptor } from '../../core/interceptors/set-token.interceptor';
import { RemoveTokenInterceptor } from '../../core/interceptors/remove-token.interceptor';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({
    status: 201,
    description: 'Registration successful. Please verify your email.',
  })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    return {
      success: true,
      statusCode: 201,
      message: 'Registration successful. Please verify your email.',
      data: user,
    };
  }

  @Post('verify-email')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify user email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token.' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.authService.verifyEmail(dto.token);
    return {
      success: true,
      statusCode: 200,
      message: 'Email verified successfully.',
      data: null,
    };
  }

  @Post('resend-verification')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend email verification link' })
  @ApiResponse({ status: 200, description: 'Verification email sent.' })
  async resendVerification(@Body() dto: ResendVerificationDto) {
    await this.authService.resendVerification(dto.email);
    return {
      success: true,
      statusCode: 200,
      message: 'Verification email sent.',
      data: null,
    };
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(SetTokenInterceptor)
  @ApiOperation({ summary: 'Authenticate user and set auth cookies' })
  @ApiResponse({ status: 200, description: 'Login successful.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() dto: LoginDto) {
    const { user, accessToken, refreshToken } = await this.authService.login(dto);
    return {
      success: true,
      statusCode: 200,
      message: 'Login successful.',
      data: user,
      accessToken,
      refreshToken,
    };
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(RemoveTokenInterceptor)
  @ApiOperation({ summary: 'Logout user and clear auth cookies' })
  @ApiResponse({ status: 200, description: 'Logged out successfully.' })
  async logout(@Req() req: Request) {
    // Try to clear DB refresh token if user is identifiable; ignore errors
    try {
      const user = req['user'] as { id: string } | undefined;
      if (user?.id) {
        await this.authService.logout(user.id);
      }
    } catch {
      // logout must work even with expired tokens
    }

    return {
      success: true,
      statusCode: 200,
      message: 'Logged out successfully.',
      data: null,
    };
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(SetTokenInterceptor)
  @ApiOperation({ summary: 'Refresh access token using refresh token cookie' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully.' })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token.',
  })
  async refresh(@Req() req: Request) {
    const refreshCookieName =
      this.configService.get<string>('REFRESH_TOKEN_COOKIE_NAME') ?? 'refresh_token';
    const token: string | undefined = req.cookies?.[refreshCookieName];
    if (!token) {
      throw new UnauthorizedException('No refresh token provided!');
    }
    const { accessToken, refreshToken } = await this.authService.refresh(token);
    return {
      success: true,
      statusCode: 200,
      message: 'Token refreshed successfully.',
      data: null,
      accessToken,
      refreshToken,
    };
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send password reset email' })
  @ApiResponse({ status: 200, description: 'Password reset email sent.' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return {
      success: true,
      statusCode: 200,
      message: 'Password reset email sent.',
      data: null,
    };
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token from email' })
  @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token.' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.password);
    return {
      success: true,
      statusCode: 200,
      message: 'Password reset successfully.',
      data: null,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user profile.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getMe(@CurrentUser() user: { id: string }) {
    const data = await this.authService.getMe(user.id);
    return {
      success: true,
      statusCode: 200,
      message: 'Profile retrieved successfully.',
      data,
    };
  }
}
