import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';
import { FeedbackStatus } from '../../common/enums/feedback-status.enum';
import { MessMember } from '../mess-members/mess-member.entity';
import { MealSlot } from '../meal-slots/meal-slot.entity';

@Entity('feedbacks')
export class Feedback extends BaseEntity {
  @Column({ name: 'mess_member_id' })
  @Index()
  messMemberId: string;

  @Column({ name: 'meal_slot_id', type: 'text', nullable: true })
  @Index()
  mealSlotId: string | null;

  @Column({ name: 'date', type: 'date' })
  date: Date;

  @Column({ name: 'complaint', type: 'text' })
  complaint: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: FeedbackStatus,
    default: FeedbackStatus.OPEN,
  })
  status: FeedbackStatus;

  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes: string | null;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt: Date | null;

  @ManyToOne(() => MessMember, (member) => member.feedbacks)
  @JoinColumn({ name: 'mess_member_id' })
  messMember: MessMember;

  @ManyToOne(() => MealSlot, (slot) => slot.feedbacks, { nullable: true })
  @JoinColumn({ name: 'meal_slot_id' })
  mealSlot: MealSlot | null;
}
