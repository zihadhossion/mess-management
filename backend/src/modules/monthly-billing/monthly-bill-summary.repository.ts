import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { MonthlyBillSummary } from './monthly-bill-summary.entity';

@Injectable()
export class MonthlyBillSummaryRepository extends BaseRepository<MonthlyBillSummary> {
  constructor(
    @InjectRepository(MonthlyBillSummary)
    repository: Repository<MonthlyBillSummary>,
  ) {
    super(repository);
  }

  async findByMessMonthYear(messId: string, month: number, year: number): Promise<MonthlyBillSummary | null> {
    return this.findOne({ where: { messId, month, year } });
  }

  async findByMess(messId: string): Promise<MonthlyBillSummary[]> {
    return this.findAll({ where: { messId }, order: { year: 'DESC', month: 'DESC' } });
  }
}
