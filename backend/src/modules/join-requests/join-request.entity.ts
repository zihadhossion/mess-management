import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';
import { JoinRequestStatus } from '../../common/enums/join-request-status.enum';
import { Mess } from '../messes/mess.entity';
import { User } from '../users/user.entity';

@Entity('join_requests')
export class JoinRequest extends BaseEntity {
  @Column({ name: 'mess_id' })
  @Index()
  messId: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: JoinRequestStatus,
    default: JoinRequestStatus.PENDING,
  })
  status: JoinRequestStatus;

  @Column({ name: 'expires_at', type: 'timestamp' })
  @Index()
  expiresAt: Date;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt: Date | null;

  @ManyToOne(() => Mess, (mess) => mess.joinRequests)
  @JoinColumn({ name: 'mess_id' })
  mess: Mess;

  @ManyToOne(() => User, (user) => user.joinRequests)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
