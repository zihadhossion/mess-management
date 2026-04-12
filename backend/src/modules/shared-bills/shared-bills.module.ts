import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedBillCategory } from './shared-bill-category.entity';
import { SharedBillEntry } from './shared-bill-entry.entity';
import { SharedBillInvoice } from './shared-bill-invoice.entity';
import { SharedBillPayment } from './shared-bill-payment.entity';
import {
  SharedBillCategoryRepository,
  SharedBillEntryRepository,
  SharedBillInvoiceRepository,
  SharedBillPaymentRepository,
} from './shared-bill.repository';
import { SharedBillService } from './shared-bill.service';
import { SharedBillController } from './shared-bill.controller';
import { MessMembersModule } from '../mess-members/mess-members.module';
import { MessesModule } from '../messes/messes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SharedBillCategory, SharedBillEntry, SharedBillInvoice, SharedBillPayment]),
    MessMembersModule,
    MessesModule,
  ],
  controllers: [SharedBillController],
  providers: [
    SharedBillService,
    SharedBillCategoryRepository,
    SharedBillEntryRepository,
    SharedBillInvoiceRepository,
    SharedBillPaymentRepository,
  ],
  exports: [SharedBillService],
})
export class SharedBillsModule {}
