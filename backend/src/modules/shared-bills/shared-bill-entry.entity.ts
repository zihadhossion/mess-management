import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';
import { Mess } from '../messes/mess.entity';
import { SharedBillCategory } from './shared-bill-category.entity';

@Entity('shared_bill_entries')
@Unique(['categoryId', 'month', 'year'])
export class SharedBillEntry extends BaseEntity {
  @Column({ name: 'category_id' })
  @Index()
  categoryId: string;

  @Column({ name: 'mess_id' })
  @Index()
  messId: string;

  @Column({ name: 'month', type: 'int' })
  month: number;

  @Column({ name: 'year', type: 'int' })
  year: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ name: 'reference_note', type: 'text', nullable: true })
  referenceNote: string | null;

  @Column({ name: 'entry_date', type: 'date' })
  entryDate: Date;

  @ManyToOne(() => SharedBillCategory, (cat) => cat.entries)
  @JoinColumn({ name: 'category_id' })
  category: SharedBillCategory;

  @ManyToOne(() => Mess, (mess) => mess.sharedBillEntries)
  @JoinColumn({ name: 'mess_id' })
  mess: Mess;
}
