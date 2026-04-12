import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { SharedBillCategory } from './shared-bill-category.entity';
import { SharedBillEntry } from './shared-bill-entry.entity';
import { SharedBillInvoice } from './shared-bill-invoice.entity';
import { SharedBillPayment } from './shared-bill-payment.entity';
import { PaymentStatus } from '../../common/enums/payment-status.enum';

@Injectable()
export class SharedBillCategoryRepository extends BaseRepository<SharedBillCategory> {
  constructor(
    @InjectRepository(SharedBillCategory)
    repository: Repository<SharedBillCategory>,
  ) { super(repository); }

  async findByMess(messId: string): Promise<SharedBillCategory[]> {
    return this.findAll({ where: { messId } });
  }
}

@Injectable()
export class SharedBillEntryRepository extends BaseRepository<SharedBillEntry> {
  constructor(
    @InjectRepository(SharedBillEntry)
    repository: Repository<SharedBillEntry>,
  ) { super(repository); }

  async findByMessAndMonth(messId: string, month: number, year: number): Promise<SharedBillEntry[]> {
    return this.findAll({ where: { messId, month, year }, relations: ['category'] });
  }

  async sumByMessAndMonth(messId: string, month: number, year: number): Promise<number> {
    const entries = await this.findByMessAndMonth(messId, month, year);
    return entries.reduce((sum, e) => sum + Number(e.totalAmount), 0);
  }
}

@Injectable()
export class SharedBillInvoiceRepository extends BaseRepository<SharedBillInvoice> {
  constructor(
    @InjectRepository(SharedBillInvoice)
    repository: Repository<SharedBillInvoice>,
  ) { super(repository); }

  async findByMessAndMonth(messId: string, month: number, year: number): Promise<SharedBillInvoice[]> {
    return this.findAll({ where: { messId, month, year }, relations: ['messMember', 'messMember.user'] });
  }

  async findByMember(messMemberId: string): Promise<SharedBillInvoice[]> {
    return this.findAll({ where: { messMemberId }, order: { year: 'DESC', month: 'DESC' } });
  }
}

@Injectable()
export class SharedBillPaymentRepository extends BaseRepository<SharedBillPayment> {
  constructor(
    @InjectRepository(SharedBillPayment)
    repository: Repository<SharedBillPayment>,
  ) { super(repository); }

  async findByInvoice(sharedBillInvoiceId: string): Promise<SharedBillPayment[]> {
    return this.findAll({ where: { sharedBillInvoiceId } });
  }
}
