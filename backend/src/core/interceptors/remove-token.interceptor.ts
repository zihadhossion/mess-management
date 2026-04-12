import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Response } from 'express';

@Injectable()
export class RemoveTokenInterceptor implements NestInterceptor {
  private readonly accessCookieName: string;
  private readonly refreshCookieName: string;

  constructor(private readonly configService: ConfigService) {
    this.accessCookieName =
      this.configService.get<string>('AUTH_TOKEN_COOKIE_NAME') ?? 'access_token';
    this.refreshCookieName =
      this.configService.get<string>('REFRESH_TOKEN_COOKIE_NAME') ?? 'refresh_token';
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const res = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        res.clearCookie(this.accessCookieName, { path: '/' });
        res.clearCookie(this.refreshCookieName, { path: '/' });
      }),
    );
  }
}
