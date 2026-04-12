import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';
import { MessStatus } from '../../common/enums/mess-status.enum';
import { Currency } from '../../common/enums/currency.enum';
import { User } from '../users/user.entity';

@Entity('messes')
export class Mess extends BaseEntity {
  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'address' })
  address: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'mess_id', type: 'text', unique: true, nullable: true })
  @Index()
  messId: string | null;

  @Column({
    name: 'currency',
    type: 'enum',
    enum: Currency,
    default: Currency.BDT,
  })
  currency: Currency;

  @Column({
    name: 'status',
    type: 'enum',
    enum: MessStatus,
    default: MessStatus.PENDING_APPROVAL,
  })
  @Index()
  status: MessStatus;

  @Column({ name: 'manager_id' })
  @Index()
  managerId: string;

  @Column({ name: 'resubmission_count', type: 'int', default: 0 })
  resubmissionCount: number;

  @Column({ name: 'rejection_notes', type: 'text', nullable: true })
  rejectionNotes: string | null;

  @Column({ name: 'requires_join_approval', type: 'boolean', default: true })
  requiresJoinApproval: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  @OneToMany('MessMember', 'mess')
  members: unknown[];

  @OneToMany('MealSlot', 'mess')
  mealSlots: unknown[];

  @OneToMany('DailyCost', 'mess')
  dailyCosts: unknown[];

  @OneToMany('FixedCharge', 'mess')
  fixedCharges: unknown[];

  @OneToMany('ItemType', 'mess')
  itemTypes: unknown[];

  @OneToMany('MonthlyBillSummary', 'mess')
  monthlyBillSummaries: unknown[];

  @OneToMany('SharedBillCategory', 'mess')
  sharedBillCategories: unknown[];

  @OneToMany('SharedBillEntry', 'mess')
  sharedBillEntries: unknown[];

  @OneToMany('SharedBillInvoice', 'mess')
  sharedBillInvoices: unknown[];

  @OneToMany('JoinRequest', 'mess')
  joinRequests: unknown[];

  @OneToMany('MessDeletionRequest', 'mess')
  deletionRequests: unknown[];
}
