import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginHistory } from './login-history.entity';

@Injectable()
export class LoginHistoryService {
  constructor(
    @InjectRepository(LoginHistory)
    private readonly repo: Repository<LoginHistory>,
  ) {}

  async record(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const entry = this.repo.create({
      userId,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    });
    await this.repo.save(entry);
  }

  async getByUserId(userId: string): Promise<LoginHistory[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}
