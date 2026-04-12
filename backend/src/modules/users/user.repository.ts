import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { User } from './user.entity';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectRepository(User)
    repository: Repository<User>,
  ) {
    super(repository);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.findAll({
      where: { isActive: true, isBanned: false, isSuspended: false },
    });
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    return this.findOne({
      where: { emailVerificationToken: token } as unknown as Record<
        string,
        unknown
      >,
    });
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return this.findOne({
      where: { passwordResetToken: token } as unknown as Record<
        string,
        unknown
      >,
    });
  }

  async findByRefreshToken(token: string): Promise<User | null> {
    return this.findOne({
      where: { refreshToken: token } as unknown as Record<string, unknown>,
    });
  }
}
