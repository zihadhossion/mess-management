import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonthlyBillSummary } from './monthly-bill-summary.entity';
import { MealInvoice } from './meal-invoice.entity';
import { MealPayment } from './meal-payment.entity';
import { MonthlyBillSummaryRepository } from './monthly-bill-summary.repository';
import { MealInvoiceRepository } from './meal-invoice.repository';
import { MealPaymentRepository } from './meal-payment.repository';
import { MonthlyBillingService } from './monthly-billing.service';
import { MonthlyBillingController } from './monthly-billing.controller';
import { DailyCostsModule } from '../daily-costs/daily-costs.module';
import { BookingsModule } from '../bookings/bookings.module';
import { MessMembersModule } from '../mess-members/mess-members.module';
import { FixedChargesModule } from '../fixed-charges/fixed-charges.module';
import { ItemAllocationsModule } from '../item-allocations/item-allocations.module';
import { MessesModule } from '../messes/messes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MonthlyBillSummary, MealInvoice, MealPayment]),
    DailyCostsModule,
    BookingsModule,
    MessMembersModule,
    FixedChargesModule,
    ItemAllocationsModule,
    MessesModule,
  ],
  controllers: [MonthlyBillingController],
  providers: [
    MonthlyBillingService,
    MonthlyBillSummaryRepository,
    MealInvoiceRepository,
    MealPaymentRepository,
  ],
  exports: [MonthlyBillingService],
})
export class MonthlyBillingModule {}
