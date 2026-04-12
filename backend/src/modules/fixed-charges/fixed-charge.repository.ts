import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { FixedCharge } from './fixed-charge.entity';

@Injectable()
export class FixedChargeRepository extends BaseRepository<FixedCharge> {
  constructor(
    @InjectRepository(FixedCharge)
    repository: Repository<FixedCharge>,
  ) {
    super(repository);
  }

  async findByMess(messId: string): Promise<FixedCharge[]> {
    return this.findAll({ where: { messId } });
  }

  async findActiveByMess(messId: string): Promise<FixedCharge[]> {
    return this.findAll({ where: { messId, isActive: true } });
  }

  async sumActiveByMess(messId: string): Promise<number> {
    const active = await this.findActiveByMess(messId);
    return active.reduce((sum, c) => sum + Number(c.amount), 0);
  }
}
