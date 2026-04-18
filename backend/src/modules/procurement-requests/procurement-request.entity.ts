import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';
import { ProcurementStatus } from './enums/procurement-status.enum';

@Entity('procurement_requests')
export class ProcurementRequest extends BaseEntity {
  @Column({ name: 'mess_id' })
  messId: string;

  @Column({ name: 'requested_by_id' })
  requestedById: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string | null;

  @Column('json')
  items: { name: string; qty: number; estimatedCost: number }[];

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (v: number) => v,
      from: (v: string) => parseFloat(v),
    },
  })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: ProcurementStatus,
    default: ProcurementStatus.PENDING,
  })
  status: ProcurementStatus;

  @Column('text', { name: 'review_note', nullable: true })
  reviewNote: string | null;

  @Column({ name: 'reviewed_by_id', type: 'varchar', nullable: true })
  reviewedById: string | null;
}
