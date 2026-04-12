import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { JoinRequest } from './join-request.entity';
import { JoinRequestStatus } from '../../common/enums/join-request-status.enum';

@Injectable()
export class JoinRequestRepository extends BaseRepository<JoinRequest> {
  constructor(
    @InjectRepository(JoinRequest)
    repository: Repository<JoinRequest>,
  ) {
    super(repository);
  }

  async findByMessId(messId: string): Promise<JoinRequest[]> {
    return this.findAll({
      where: { messId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: string): Promise<JoinRequest[]> {
    return this.findAll({
      where: { userId },
      relations: ['mess'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPendingByMessAndUser(
    messId: string,
    userId: string,
  ): Promise<JoinRequest | null> {
    return this.findOne({
      where: { messId, userId, status: JoinRequestStatus.PENDING },
    });
  }

  async findExpired(): Promise<JoinRequest[]> {
    return this.findAll({
      where: {
        status: JoinRequestStatus.PENDING,
        expiresAt: LessThan(new Date()),
      },
    });
  }

  async findAllForAdmin(
    page = 1,
    limit = 20,
  ): Promise<[JoinRequest[], number]> {
    return this.repository.findAndCount({
      relations: ['mess', 'user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}
