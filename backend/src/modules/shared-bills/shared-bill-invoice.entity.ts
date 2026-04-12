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
import { SharedBillInvoiceStatus } from '../../common/enums/shared-bill-invoice-status.enum';
import { Mess } from '../messes/mess.entity';
import { MessMember } from '../mess-members/mess-member.entity';

@Entity('shared_bill_invoices')
export class SharedBillInvoice extends BaseEntity {
  @Column({ name: 'mess_id' })
  @Index()
  messId: string;

  @Column({ name: 'mess_member_id' })
  @Index()
  messMemberId: string;

  @Column({ name: 'month', type: 'int' })
  month: number;

  @Column({ name: 'year', type: 'int' })
  year: number;

  @Column({ name: 'total_share', type: 'decimal', precision: 10, scale: 2 })
  totalShare: number;

  @Column({ name: 'active_member_count', type: 'int' })
  activeMemberCount: number;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  paymentStatus: PaymentStatus;

  @Column({ name: 'pdf_url', type: 'text', nullable: true })
  pdfUrl: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: SharedBillInvoiceStatus,
    default: SharedBillInvoiceStatus.DRAFT,
  })
  status: SharedBillInvoiceStatus;

  @ManyToOne(() => Mess, (mess) => mess.sharedBillInvoices)
  @JoinColumn({ name: 'mess_id' })
  mess: Mess;

  @ManyToOne(() => MessMember, (member) => member.sharedBillInvoices)
  @JoinColumn({ name: 'mess_member_id' })
  messMember: MessMember;

  @OneToMany('SharedBillPayment', 'sharedBillInvoice')
  payments: unknown[];
}
