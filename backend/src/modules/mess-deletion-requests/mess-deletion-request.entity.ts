import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';
import { DeletionRequestStatus } from '../../common/enums/deletion-request-status.enum';
import { Mess } from '../messes/mess.entity';
import { User } from '../users/user.entity';

@Entity('mess_deletion_requests')
export class MessDeletionRequest extends BaseEntity {
  @Column({ name: 'mess_id' })
  @Index()
  messId: string;

  @Column({ name: 'manager_id' })
  managerId: string;

  @Column({ name: 'reason', type: 'text' })
  reason: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: DeletionRequestStatus,
    default: DeletionRequestStatus.PENDING,
  })
  status: DeletionRequestStatus;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes: string | null;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt: Date | null;

  @ManyToOne(() => Mess, (mess) => mess.deletionRequests)
  @JoinColumn({ name: 'mess_id' })
  mess: Mess;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'manager_id' })
  manager: User;
}
