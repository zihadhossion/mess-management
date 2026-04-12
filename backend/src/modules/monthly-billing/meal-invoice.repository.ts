import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { MealInvoice } from './meal-invoice.entity';

@Injectable()
export class MealInvoiceRepository extends BaseRepository<MealInvoice> {
  constructor(
    @InjectRepository(MealInvoice)
    repository: Repository<MealInvoice>,
  ) {
    super(repository);
  }

  async findBySummary(monthlySummaryId: string): Promise<MealInvoice[]> {
    return this.findAll({
      where: { monthlySummaryId },
      relations: ['messMember', 'messMember.user'],
    });
  }

  async findByMember(messMemberId: string): Promise<MealInvoice[]> {
    return this.findAll({ where: { messMemberId }, relations: ['monthlySummary'], order: { createdAt: 'DESC' } });
  }
}
