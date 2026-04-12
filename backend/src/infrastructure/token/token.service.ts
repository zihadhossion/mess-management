import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(payload: TokenPayload): string {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is required');
    }
    return this.jwtService.sign(payload as unknown as Record<string, unknown>, {
      secret,
      expiresIn: (this.configService.get<string>('JWT_EXPIRY') ||
        '15m') as `${number}${'s' | 'm' | 'h' | 'd'}`,
    });
  }

  generateRefreshToken(payload: TokenPayload): string {
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is required');
    }
    return this.jwtService.sign(payload as unknown as Record<string, unknown>, {
      secret,
      expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRY') ||
        '7d') as `${number}${'s' | 'm' | 'h' | 'd'}`,
    });
  }

  verifyRefreshToken(token: string): TokenPayload {
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is required');
    }
    return this.jwtService.verify<TokenPayload>(token, { secret });
  }

  generateRandomToken(): string {
    return uuidv4().replace(/-/g, '') + crypto.randomBytes(16).toString('hex');
  }
}
