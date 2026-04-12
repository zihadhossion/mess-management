import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from '../../core/base/base.service';
import { MonthlyBillSummary } from './monthly-bill-summary.entity';
import { MonthlyBillSummaryRepository } from './monthly-bill-summary.repository';
import { MealInvoiceRepository } from './meal-invoice.repository';
import { MealPaymentRepository } from './meal-payment.repository';
import { DailyCostRepository } from '../daily-costs/daily-cost.repository';
import { BookingRepository } from '../bookings/booking.repository';
import { MessMemberRepository } from '../mess-members/mess-member.repository';
import { FixedChargeRepository } from '../fixed-charges/fixed-charge.repository';
import { ItemAllocationRepository } from '../item-allocations/item-allocation.repository';
import { MessRepository } from '../messes/mess.repository';
import { BillSummaryStatus } from '../../common/enums/bill-summary-status.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import { MealInvoice } from './meal-invoice.entity';
import { RecordPaymentDto } from './dtos/billing.dto';

@Injectable()
export class MonthlyBillingService extends BaseService<MonthlyBillSummary> {
  constructor(
    protected readonly repository: MonthlyBillSummaryRepository,
    private readonly mealInvoiceRepository: MealInvoiceRepository,
    private readonly mealPaymentRepository: MealPaymentRepository,
    private readonly dailyCostRepository: DailyCostRepository,
    private readonly bookingRepository: BookingRepository,
    private readonly messMemberRepository: MessMemberRepository,
    private readonly fixedChargeRepository: FixedChargeRepository,
    private readonly itemAllocationRepository: ItemAllocationRepository,
    private readonly messRepository: MessRepository,
  ) {
    super(repository, 'MonthlyBillSummary');
  }

  async getSummary(
    messId: string,
    month: number,
    year: number,
  ): Promise<{
    summary: MonthlyBillSummary | null;
    totalCost: number;
    totalPortions: number;
    estimatedCpm: number;
  }> {
    const existing = await this.repository.findByMessMonthYear(
      messId,
      month,
      year,
    );
    const totalCost = await this.dailyCostRepository.sumByMessAndMonth(
      messId,
      month,
      year,
    );
    const totalPortions = await this.bookingRepository.totalPortionsForMess(
      messId,
      month,
      year,
    );
    const estimatedCpm = totalPortions > 0 ? totalCost / totalPortions : 0;

    return { summary: existing, totalCost, totalPortions, estimatedCpm };
  }

  async finalize(
    messId: string,
    month: number,
    year: number,
    userId: string,
    userRole: UserRole,
  ): Promise<MonthlyBillSummary> {
    await this.assertManagerAccess(messId, userId, userRole);

    const existing = await this.repository.findByMessMonthYear(
      messId,
      month,
      year,
    );
    if (existing && existing.status === BillSummaryStatus.FINALIZED) {
      throw new BadRequestException('This month has already been finalized!');
    }

    // Calculate totals
    const totalCost = await this.dailyCostRepository.sumByMessAndMonth(
      messId,
      month,
      year,
    );
    const totalPortions = await this.bookingRepository.totalPortionsForMess(
      messId,
      month,
      year,
    );
    const costPerMeal = totalPortions > 0 ? totalCost / totalPortions : 0;

    // Get or create summary
    let summary: MonthlyBillSummary;
    if (existing) {
      summary = (await this.repository.update(existing.id, {
        totalCost,
        totalPortions,
        costPerMeal,
        status: BillSummaryStatus.FINALIZED,
        finalizedAt: new Date(),
      })) as MonthlyBillSummary;
    } else {
      summary = await this.repository.create({
        messId,
        month,
        year,
        totalCost,
        totalPortions,
        costPerMeal,
        status: BillSummaryStatus.FINALIZED,
        finalizedAt: new Date(),
      });
    }

    // Generate invoices for each active member
    const activeMembers =
      await this.messMemberRepository.findActiveMembers(messId);
    const fixedChargesTotal =
      await this.fixedChargeRepository.sumActiveByMess(messId);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    for (const member of activeMembers) {
      // Proration: count portions from join date within the month
      const memberJoinDate = new Date(member.joinDate);
      const effectiveStart =
        memberJoinDate > startDate ? memberJoinDate : startDate;

      // Only count portions from effectiveStart onward
      const mealPortions =
        await this.bookingRepository.sumPortionsForMemberFromDate(
          member.id,
          effectiveStart,
          endDate,
        );

      const mealSubtotal = mealPortions * costPerMeal;

      // Items cost for member (from join date)
      const itemsSubtotal =
        await this.itemAllocationRepository.sumItemCostForMember(
          member.id,
          month,
          year,
        );

      // Fixed charges: full amount regardless of join date
      const fixedChargesSubtotal = fixedChargesTotal;

      const totalAmount = mealSubtotal + itemsSubtotal + fixedChargesSubtotal;

      // Check if invoice already exists for this member+summary
      const existingInvoice = await this.mealInvoiceRepository.findOne({
        where: { monthlySummaryId: summary.id, messMemberId: member.id },
      });

      if (!existingInvoice) {
        await this.mealInvoiceRepository.create({
          monthlySummaryId: summary.id,
          messMemberId: member.id,
          mealPortions,
          mealSubtotal: Math.round(mealSubtotal * 100) / 100,
          itemsSubtotal: Math.round(itemsSubtotal * 100) / 100,
          fixedChargesSubtotal: Math.round(fixedChargesSubtotal * 100) / 100,
          totalAmount: Math.round(totalAmount * 100) / 100,
          paymentStatus: PaymentStatus.UNPAID,
        });
      }
    }

    return summary;
  }

  async listInvoices(
    messId: string,
    month: number,
    year: number,
  ): Promise<MealInvoice[]> {
    const summary = await this.repository.findByMessMonthYear(
      messId,
      month,
      year,
    );
    if (!summary) return [];
    return this.mealInvoiceRepository.findBySummary(summary.id);
  }

  async getInvoice(invoiceId: string): Promise<MealInvoice> {
    const invoice = await this.mealInvoiceRepository.findById(invoiceId, {
      messMember: true,
      monthlySummary: true,
      payments: true,
    } as Record<string, boolean>);
    if (!invoice) throw new NotFoundException('Invoice not found!');
    return invoice;
  }

  async getMemberInvoices(messMemberId: string): Promise<MealInvoice[]> {
    return this.mealInvoiceRepository.findByMember(messMemberId);
  }

  async recordPayment(
    invoiceId: string,
    dto: RecordPaymentDto,
    recordedById: string,
  ): Promise<void> {
    const invoice = await this.mealInvoiceRepository.findById(invoiceId);
    if (!invoice) throw new NotFoundException('Invoice not found!');

    await this.mealPaymentRepository.create({
      mealInvoiceId: invoiceId,
      amount: dto.amount,
      method: dto.method,
      paymentDate: new Date(dto.paymentDate),
      referenceNote: dto.referenceNote || null,
      recordedById,
    });

    // Mark as paid
    await this.mealInvoiceRepository.update(invoiceId, {
      paymentStatus: PaymentStatus.PAID,
    });
  }

  async getBillHistory(messId: string): Promise<MonthlyBillSummary[]> {
    return this.repository.findByMess(messId);
  }

  private async assertManagerAccess(
    messId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    if (userRole === UserRole.ADMIN) return;
    const mess = await this.messRepository.findById(messId);
    if (!mess) throw new NotFoundException('Mess not found!');
    if (mess.managerId !== userId && userRole !== UserRole.MANAGER) {
      throw new ForbiddenException('Manager access required!');
    }
  }
}
