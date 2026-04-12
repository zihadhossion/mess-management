import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';
import { BookingStatus } from '../../common/enums/booking-status.enum';
import { MealSlot } from '../meal-slots/meal-slot.entity';
import { MessMember } from '../mess-members/mess-member.entity';

@Entity('bookings')
@Unique(['mealSlotId', 'messMemberId'])
export class Booking extends BaseEntity {
  @Column({ name: 'meal_slot_id' })
  @Index()
  mealSlotId: string;

  @Column({ name: 'mess_member_id' })
  @Index()
  messMemberId: string;

  @Column({ name: 'portions', type: 'int', default: 1 })
  portions: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.BOOKED,
  })
  @Index()
  status: BookingStatus;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date | null;

  @ManyToOne(() => MealSlot, (slot) => slot.bookings)
  @JoinColumn({ name: 'meal_slot_id' })
  mealSlot: MealSlot;

  @ManyToOne(() => MessMember, (member) => member.bookings)
  @JoinColumn({ name: 'mess_member_id' })
  messMember: MessMember;
}
