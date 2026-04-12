import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { MealPayment } from './meal-payment.entity';

@Injectable()
export class MealPaymentRepository extends BaseRepository<MealPayment> {
  constructor(
    @InjectRepository(MealPayment)
    repository: Repository<MealPayment>,
  ) {
    super(repository);
  }

  async findByInvoice(mealInvoiceId: string): Promise<MealPayment[]> {
    return this.findAll({ where: { mealInvoiceId } });
  }
}
