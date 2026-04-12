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
import { MealSlotType } from '../../common/enums/meal-slot-type.enum';
import { MealSlotStatus } from '../../common/enums/meal-slot-status.enum';
import { Mess } from '../messes/mess.entity';

@Entity('meal_slots')
@Unique(['messId', 'date', 'type'])
@Index(['messId', 'date'])
export class MealSlot extends BaseEntity {
  @Column({ name: 'mess_id' })
  @Index()
  messId: string;

  @Column({ name: 'date', type: 'date' })
  @Index()
  date: Date;

  @Column({
    name: 'type',
    type: 'enum',
    enum: MealSlotType,
  })
  type: MealSlotType;

  @Column({ name: 'time_window_start', type: 'time' })
  timeWindowStart: string;

  @Column({ name: 'time_window_end', type: 'time' })
  timeWindowEnd: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: MealSlotStatus,
    default: MealSlotStatus.DRAFT,
  })
  @Index()
  status: MealSlotStatus;

  @Column({ name: 'menu_description', type: 'text', nullable: true })
  menuDescription: string | null;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @ManyToOne(() => Mess, (mess) => mess.mealSlots)
  @JoinColumn({ name: 'mess_id' })
  mess: Mess;

  @OneToMany('Booking', 'mealSlot')
  bookings: unknown[];

  @OneToMany('Feedback', 'mealSlot')
  feedbacks: unknown[];
}
