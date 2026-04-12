import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Not } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BaseService } from '../../core/base/base.service';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AdminUpdateUserDto } from './dtos/admin-update-user.dto';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(protected readonly repository: UserRepository) {
    super(repository, 'User');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findByEmail(email);
  }

  async findByEmailOrFail(email: string): Promise<User> {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found!`);
    }
    return user;
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const existing = await this.repository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists!');
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    return this.repository.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      role: dto.role || UserRole.MEMBER,
    });
  }

  async updateProfile(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findByIdOrFail(id);
    return this.repository.update(id, {
      fullName: dto.fullName,
    }) as Promise<User>;
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findByIdOrFail(id);
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new BadRequestException('Current password is incorrect!');
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.repository.update(id, { passwordHash });
  }

  async adminUpdateUser(id: string, dto: AdminUpdateUserDto): Promise<User> {
    const user = await this.findByIdOrFail(id);
    if (
      user.role === UserRole.ADMIN &&
      dto.role &&
      dto.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('Cannot demote an admin account!');
    }
    const updates: Partial<User> = {};
    if (dto.fullName !== undefined) updates.fullName = dto.fullName;
    if (dto.role !== undefined) updates.role = dto.role;
    if (dto.isActive !== undefined) updates.isActive = dto.isActive;
    if (dto.isSuspended !== undefined) updates.isSuspended = dto.isSuspended;
    if (dto.isBanned !== undefined) updates.isBanned = dto.isBanned;
    return this.repository.update(id, updates) as Promise<User>;
  }

  async adminResetPassword(id: string, newPassword: string): Promise<void> {
    await this.findByIdOrFail(id);
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.repository.update(id, { passwordHash });
  }

  async setRefreshToken(id: string, token: string | null): Promise<void> {
    await this.repository.update(id, { refreshToken: token });
  }

  async setEmailVerificationToken(
    id: string,
    token: string | null,
  ): Promise<void> {
    await this.repository.update(id, { emailVerificationToken: token });
  }

  async markEmailVerified(id: string): Promise<void> {
    await this.repository.update(id, {
      isEmailVerified: true,
      emailVerificationToken: null,
    });
  }

  async setPasswordResetToken(
    id: string,
    token: string | null,
    expiresAt: Date | null,
  ): Promise<void> {
    await this.repository.update(id, {
      passwordResetToken: token,
      passwordResetExpiresAt: expiresAt,
    });
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.repository.update(id, {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    });
  }

  async findByRefreshToken(token: string): Promise<User | null> {
    return this.repository.findByRefreshToken(token);
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return this.repository.findByPasswordResetToken(token);
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    return this.repository.findByEmailVerificationToken(token);
  }

  async getAllUsers(
    page = 1,
    limit = 20,
    role?: UserRole,
    isActive?: boolean,
  ): Promise<{ data: User[]; total: number }> {
    const where: Record<string, unknown> = { role: Not(UserRole.ADMIN) };
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;
    const [data, total] = await Promise.all([
      this.repository.findAll({
        where,
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      }),
      this.repository.count({ where }),
    ]);
    return { data, total };
  }
}
