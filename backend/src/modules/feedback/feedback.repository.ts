import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { Feedback } from './feedback.entity';

@Injectable()
export class FeedbackRepository extends BaseRepository<Feedback> {
  constructor(
    @InjectRepository(Feedback)
    repository: Repository<Feedback>,
  ) {
    super(repository);
  }

  async findByMember(messMemberId: string): Promise<Feedback[]> {
    return this.findAll({ where: { messMemberId }, order: { createdAt: 'DESC' } });
  }

  async findByMess(messId: string): Promise<Feedback[]> {
    // Join via messMember to get mess-level feedback
    return this.repository
      .createQueryBuilder('f')
      .innerJoin('f.messMember', 'mm')
      .where('mm.mess_id = :messId', { messId })
      .orderBy('f.created_at', 'DESC')
      .getMany();
  }
}
