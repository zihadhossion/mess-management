import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';
import { Mess } from '../messes/mess.entity';

@Entity('fixed_charges')
export class FixedCharge extends BaseEntity {
  @Column({ name: 'mess_id' })
  @Index()
  messId: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @ManyToOne(() => Mess, (mess) => mess.fixedCharges)
  @JoinColumn({ name: 'mess_id' })
  mess: Mess;
}
