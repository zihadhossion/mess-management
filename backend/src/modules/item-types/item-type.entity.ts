import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';
import { Mess } from '../messes/mess.entity';

@Entity('item_types')
export class ItemType extends BaseEntity {
  @Column({ name: 'mess_id' })
  @Index()
  messId: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'unit' })
  unit: string;

  @Column({
    name: 'default_daily_quantity',
    type: 'decimal',
    precision: 10,
    scale: 3,
  })
  defaultDailyQuantity: number;

  @Column({ name: 'cost_per_unit', type: 'decimal', precision: 10, scale: 2 })
  costPerUnit: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @ManyToOne(() => Mess, (mess) => mess.itemTypes)
  @JoinColumn({ name: 'mess_id' })
  mess: Mess;

  @OneToMany('ItemAllocation', 'itemType')
  allocations: unknown[];
}
