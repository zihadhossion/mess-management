import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { MessDeletionRequest } from './mess-deletion-request.entity';

@Injectable()
export class MessDeletionRequestRepository extends BaseRepository<MessDeletionRequest> {
  constructor(
    @InjectRepository(MessDeletionRequest)
    repository: Repository<MessDeletionRequest>,
  ) {
    super(repository);
  }

  async findByMess(messId: string): Promise<MessDeletionRequest[]> {
    return this.findAll({ where: { messId }, order: { createdAt: 'DESC' } });
  }

  async findAllForAdmin(page = 1, limit = 20): Promise<[MessDeletionRequest[], number]> {
    return this.repository.findAndCount({
      relations: ['mess', 'manager'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}
