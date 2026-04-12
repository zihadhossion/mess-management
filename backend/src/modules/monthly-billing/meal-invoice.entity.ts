import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { MonthlyBillSummary } from './monthly-bill-summary.entity';
import { MessMember } from '../mess-members/mess-member.entity';

@Entity('meal_invoices')
export class MealInvoice extends BaseEntity {
  @Column({ name: 'monthly_summary_id' })
  @Index()
  monthlySummaryId: string;

  @Column({ name: 'mess_member_id' })
  @Index()
  messMemberId: string;

  @Column({ name: 'meal_portions', type: 'int' })
  mealPortions: number;

  @Column({ name: 'meal_subtotal', type: 'decimal', precision: 10, scale: 2 })
  mealSubtotal: number;

  @Column({ name: 'items_subtotal', type: 'decimal', precision: 10, scale: 2 })
  itemsSubtotal: number;

  @Column({
    name: 'fixed_charges_subtotal',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  fixedChargesSubtotal: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  paymentStatus: PaymentStatus;

  @Column({ name: 'pdf_url', type: 'text', nullable: true })
  pdfUrl: string | null;

  @ManyToOne(() => MonthlyBillSummary, (summary) => summary.mealInvoices)
  @JoinColumn({ name: 'monthly_summary_id' })
  monthlySummary: MonthlyBillSummary;

  @ManyToOne(() => MessMember, (member) => member.mealInvoices)
  @JoinColumn({ name: 'mess_member_id' })
  messMember: MessMember;

  @OneToMany('MealPayment', 'mealInvoice')
  payments: unknown[];
}
