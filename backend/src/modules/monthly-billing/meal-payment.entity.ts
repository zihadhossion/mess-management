import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';
import { PaymentMethod } from '../../common/enums/payment-method.enum';
import { MealInvoice } from './meal-invoice.entity';
import { User } from '../users/user.entity';

@Entity('meal_payments')
export class MealPayment extends BaseEntity {
  @Column({ name: 'meal_invoice_id' })
  @Index()
  mealInvoiceId: string;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    name: 'method',
    type: 'enum',
    enum: PaymentMethod,
  })
  method: PaymentMethod;

  @Column({ name: 'payment_date', type: 'date' })
  paymentDate: Date;

  @Column({ name: 'reference_note', type: 'text', nullable: true })
  referenceNote: string | null;

  @Column({ name: 'recorded_by_id' })
  recordedById: string;

  @ManyToOne(() => MealInvoice, (invoice) => invoice.payments)
  @JoinColumn({ name: 'meal_invoice_id' })
  mealInvoice: MealInvoice;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recorded_by_id' })
  recordedBy: User;
}
