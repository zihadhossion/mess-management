import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Response } from 'express';

@Injectable()
export class SetTokenInterceptor implements NestInterceptor {
  private readonly ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
  private readonly REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
  private readonly accessCookieName: string;
  private readonly refreshCookieName: string;
  private readonly isProduction: boolean;

  constructor(private readonly configService: ConfigService) {
    this.accessCookieName =
      this.configService.get<string>('AUTH_TOKEN_COOKIE_NAME') ?? 'access_token';
    this.refreshCookieName =
      this.configService.get<string>('REFRESH_TOKEN_COOKIE_NAME') ?? 'refresh_token';
    this.isProduction = this.configService.get<string>('MODE') === 'PROD';
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const res = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data: Record<string, unknown>) => {
        const { accessToken, refreshToken, ...rest } = data;

        if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
          throw new InternalServerErrorException(
            'SetTokenInterceptor: handler did not return accessToken and refreshToken',
          );
        }

        const cookieOptions = {
          httpOnly: true,
          secure: this.isProduction,
          sameSite: 'strict' as const,
          path: '/',
        };

        res.cookie(this.accessCookieName, accessToken, {
          ...cookieOptions,
          maxAge: this.ACCESS_TOKEN_TTL_MS,
        });
        res.cookie(this.refreshCookieName, refreshToken, {
          ...cookieOptions,
          maxAge: this.REFRESH_TOKEN_TTL_MS,
        });

        return rest;
      }),
    );
  }
}
