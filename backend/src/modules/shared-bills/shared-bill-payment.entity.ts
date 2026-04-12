import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';
import { PaymentMethod } from '../../common/enums/payment-method.enum';
import { SharedBillInvoice } from './shared-bill-invoice.entity';
import { User } from '../users/user.entity';

@Entity('shared_bill_payments')
export class SharedBillPayment extends BaseEntity {
  @Column({ name: 'shared_bill_invoice_id' })
  @Index()
  sharedBillInvoiceId: string;

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

  @ManyToOne(() => SharedBillInvoice, (invoice) => invoice.payments)
  @JoinColumn({ name: 'shared_bill_invoice_id' })
  sharedBillInvoice: SharedBillInvoice;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recorded_by_id' })
  recordedBy: User;
}
