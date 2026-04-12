import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';
import { BillSummaryStatus } from '../../common/enums/bill-summary-status.enum';
import { Mess } from '../messes/mess.entity';

@Entity('monthly_bill_summaries')
@Unique(['messId', 'month', 'year'])
export class MonthlyBillSummary extends BaseEntity {
  @Column({ name: 'mess_id' })
  @Index()
  messId: string;

  @Column({ name: 'month', type: 'int' })
  month: number;

  @Column({ name: 'year', type: 'int' })
  year: number;

  @Column({
    name: 'total_cost',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalCost: number;

  @Column({ name: 'total_portions', type: 'int', default: 0 })
  totalPortions: number;

  @Column({
    name: 'cost_per_meal',
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: 0,
  })
  costPerMeal: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: BillSummaryStatus,
    default: BillSummaryStatus.OPEN,
  })
  @Index()
  status: BillSummaryStatus;

  @Column({ name: 'finalized_at', type: 'timestamp', nullable: true })
  finalizedAt: Date | null;

  @ManyToOne(() => Mess, (mess) => mess.monthlyBillSummaries)
  @JoinColumn({ name: 'mess_id' })
  mess: Mess;

  @OneToMany('MealInvoice', 'monthlySummary')
  mealInvoices: unknown[];
}
