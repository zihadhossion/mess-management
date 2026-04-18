import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '../users/user.service';
import { LoginHistoryService } from '../users/login-history.service';
import { TokenService } from '../../infrastructure/token/token.service';
import { MailService } from '../../infrastructure/mail/mail.service';
import { MessRepository } from '../messes/mess.repository';
import { MessMemberRepository } from '../mess-members/mess-member.repository';
import { JoinRequestService } from '../join-requests/join-request.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { User } from '../users/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { MessStatus } from '../../common/enums/mess-status.enum';
import { JoinRequestStatus } from '../../common/enums/join-request-status.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly loginHistoryService: LoginHistoryService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly messRepository: MessRepository,
    private readonly messMemberRepository: MessMemberRepository,
    private readonly joinRequestService: JoinRequestService,
  ) {}

  async register(
    dto: RegisterDto,
  ): Promise<
    Omit<
      User,
      | 'passwordHash'
      | 'refreshToken'
      | 'emailVerificationToken'
      | 'passwordResetToken'
      | 'passwordResetExpiresAt'
    >
  > {
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists!');
    }

    const role =
      dto.role === UserRole.MANAGER ? UserRole.MANAGER : UserRole.MEMBER;
    const user = await this.userService.createUser({ ...dto, role });

    const verificationToken = this.tokenService.generateRandomToken();
    await this.userService.setEmailVerificationToken(
      user.id,
      verificationToken,
    );
    await this.mailService.sendVerificationEmail(user.email, verificationToken);

    const {
      passwordHash,
      refreshToken,
      emailVerificationToken,
      passwordResetToken,
      passwordResetExpiresAt,
      ...safeUser
    } = user;
    return safeUser;
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.userService.findByEmailVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token!');
    }
    await this.userService.markEmailVerified(user.id);
    await this.mailService.sendWelcomeEmail(user.email, user.fullName);
  }

  async resendVerification(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      // Don't reveal whether email exists
      return;
    }
    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified!');
    }
    const verificationToken = this.tokenService.generateRandomToken();
    await this.userService.setEmailVerificationToken(
      user.id,
      verificationToken,
    );
    await this.mailService.sendVerificationEmail(user.email, verificationToken);
  }

  async login(
    dto: LoginDto,
  ): Promise<{
    user: Partial<User>;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password!');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password!');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in!',
      );
    }

    if (user.isBanned) {
      throw new UnauthorizedException(
        'Your account has been banned. Please contact support!',
      );
    }

    if (user.isSuspended) {
      throw new UnauthorizedException(
        'Your account has been suspended. Please contact support!',
      );
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    await this.userService.setRefreshToken(user.id, refreshToken);
    this.loginHistoryService.record(user.id).catch(() => null);

    const safeUser = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };

    return { user: safeUser, accessToken, refreshToken };
  }

  async logout(userId: string): Promise<void> {
    // Clear refresh token from DB
    await this.userService.setRefreshToken(userId, null);
  }

  async refresh(
    token: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: { sub: string; email: string; role: string };
    try {
      payload = this.tokenService.verifyRefreshToken(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token!');
    }

    const user = await this.userService.findByRefreshToken(token);
    if (!user) {
      throw new UnauthorizedException(
        'Refresh token not found or already rotated!',
      );
    }

    // Token rotation: delete previous refresh token before issuing new one
    await this.userService.setRefreshToken(user.id, null);

    const newPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.tokenService.generateAccessToken(newPayload);
    const newRefreshToken = this.tokenService.generateRefreshToken(newPayload);

    await this.userService.setRefreshToken(user.id, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      // Don't reveal whether email exists
      return;
    }
    const resetToken = this.tokenService.generateRandomToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await this.userService.setPasswordResetToken(
      user.id,
      resetToken,
      expiresAt,
    );
    await this.mailService.sendPasswordResetEmail(user.email, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userService.findByPasswordResetToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token!');
    }
    if (
      !user.passwordResetExpiresAt ||
      user.passwordResetExpiresAt < new Date()
    ) {
      throw new BadRequestException('Password reset token has expired!');
    }
    await this.userService.resetPassword(user.id, newPassword);
  }

  async getMe(userId: string): Promise<object> {
    const user = await this.userService.findByIdOrFail(userId);
    const {
      passwordHash,
      refreshToken,
      emailVerificationToken,
      passwordResetToken,
      passwordResetExpiresAt,
      ...safeUser
    } = user;

    let messId: string | null = null;
    let messName: string | null = null;
    let messCode: string | null = null;
    let onboardingStatus: 'pending' | 'rejected' | null = null;

    if (user.role === UserRole.MANAGER) {
      const messes = await this.messRepository.findByManagerId(userId);
      const activeMess = messes.find((m) => m.status === MessStatus.ACTIVE);
      if (activeMess) {
        messId = activeMess.id;
        messName = activeMess.name;
        messCode = activeMess.messId;
      } else {
        const pending = messes.find(
          (m) => m.status === MessStatus.PENDING_APPROVAL,
        );
        if (pending) {
          onboardingStatus = 'pending';
        } else {
          const rejected = messes
            .filter((m) => m.status === MessStatus.REJECTED)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
          if (rejected) onboardingStatus = 'rejected';
        }
      }
    } else if (user.role === UserRole.MEMBER) {
      const membership =
        await this.messMemberRepository.findActiveByUserId(userId);
      if (membership && membership.mess?.status === MessStatus.ACTIVE) {
        messId = membership.mess.id;
        messName = membership.mess.name;
        messCode = membership.mess.messId;
      } else {
        const requests = await this.joinRequestService.listForUser(userId);
        const sorted = [...requests].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        );
        const latestPending = sorted.find(
          (r) => r.status === JoinRequestStatus.PENDING,
        );
        if (latestPending) {
          onboardingStatus = 'pending';
        } else {
          const latestRejected = sorted.find(
            (r) => r.status === JoinRequestStatus.REJECTED,
          );
          if (latestRejected) onboardingStatus = 'rejected';
        }
      }
    }

    return {
      ...safeUser,
      messId,
      messName,
      messCode,
      onboardingStatus,
    };
  }
}
