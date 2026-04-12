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

@Entity('shared_bill_categories')
export class SharedBillCategory extends BaseEntity {
  @Column({ name: 'mess_id' })
  @Index()
  messId: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => Mess, (mess) => mess.sharedBillCategories)
  @JoinColumn({ name: 'mess_id' })
  mess: Mess;

  @OneToMany('SharedBillEntry', 'category')
  entries: unknown[];
}
