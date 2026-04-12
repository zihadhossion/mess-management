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
import { MemberRole } from '../../common/enums/member-role.enum';
import { Mess } from '../messes/mess.entity';
import { User } from '../users/user.entity';

@Entity('mess_members')
@Unique(['messId', 'userId'])
export class MessMember extends BaseEntity {
  @Column({ name: 'mess_id' })
  @Index()
  messId: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({
    name: 'member_role',
    type: 'enum',
    enum: MemberRole,
    default: MemberRole.MEMBER,
  })
  memberRole: MemberRole;

  @Column({ name: 'join_date', type: 'date' })
  joinDate: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ name: 'is_guest', type: 'boolean', default: false })
  @Index()
  isGuest: boolean;

  @Column({ name: 'guest_valid_until', type: 'date', nullable: true })
  guestValidUntil: Date | null;

  @Column({ name: 'participates_in_meals', type: 'boolean', default: true })
  participatesInMeals: boolean;

  @ManyToOne(() => Mess, (mess) => mess.members)
  @JoinColumn({ name: 'mess_id' })
  mess: Mess;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany('Booking', 'messMember')
  bookings: unknown[];

  @OneToMany('ItemAllocation', 'messMember')
  itemAllocations: unknown[];

  @OneToMany('MealInvoice', 'messMember')
  mealInvoices: unknown[];

  @OneToMany('SharedBillInvoice', 'messMember')
  sharedBillInvoices: unknown[];

  @OneToMany('Feedback', 'messMember')
  feedbacks: unknown[];
}
