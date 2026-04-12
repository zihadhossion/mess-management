import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { DailyCost } from './daily-cost.entity';

@Injectable()
export class DailyCostRepository extends BaseRepository<DailyCost> {
  constructor(
    @InjectRepository(DailyCost)
    repository: Repository<DailyCost>,
  ) {
    super(repository);
  }

  async findByMessAndMonth(
    messId: string,
    month: number,
    year: number,
  ): Promise<DailyCost[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return this.findAll({
      where: { messId, date: Between(startDate, endDate) },
      order: { date: 'ASC' },
    });
  }

  async sumByMessAndMonth(
    messId: string,
    month: number,
    year: number,
  ): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const result = await this.repository
      .createQueryBuilder('dc')
      .where('dc.mess_id = :messId', { messId })
      .andWhere('dc.date >= :startDate', { startDate })
      .andWhere('dc.date <= :endDate', { endDate })
      .select('COALESCE(SUM(dc.amount), 0)', 'total')
      .getRawOne<{ total: string }>();
    return parseFloat(result?.total ?? '0');
  }
}
