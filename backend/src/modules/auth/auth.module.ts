import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../../infrastructure/mail/mail.module';
import { TokenModule } from '../../infrastructure/token/token.module';
import { JwtStrategy } from '../../core/strategies/jwt.strategy';

@Module({
  imports: [PassportModule, UsersModule, MailModule, TokenModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
