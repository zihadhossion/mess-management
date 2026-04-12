import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';
import { DailyCostCategory } from '../../common/enums/daily-cost-category.enum';
import { Mess } from '../messes/mess.entity';

@Entity('daily_costs')
@Index(['messId', 'date'])
export class DailyCost extends BaseEntity {
  @Column({ name: 'mess_id' })
  @Index()
  messId: string;

  @Column({ name: 'date', type: 'date' })
  @Index()
  date: Date;

  @Column({ name: 'description' })
  description: string;

  @Column({
    name: 'quantity',
    type: 'decimal',
    precision: 10,
    scale: 3,
    nullable: true,
  })
  quantity: number | null;

  @Column({ name: 'unit', type: 'text', nullable: true })
  unit: string | null;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    name: 'category',
    type: 'enum',
    enum: DailyCostCategory,
    default: DailyCostCategory.INGREDIENT,
  })
  category: DailyCostCategory;

  @ManyToOne(() => Mess, (mess) => mess.dailyCosts)
  @JoinColumn({ name: 'mess_id' })
  mess: Mess;
}
