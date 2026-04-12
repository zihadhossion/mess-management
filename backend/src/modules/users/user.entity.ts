import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';
import { UserRole } from '../../common/enums/user-role.enum';

@Entity('users')
@Index(['isActive', 'isBanned', 'isSuspended'])
export class User extends BaseEntity {
  @Column({ name: 'email', unique: true })
  @Index()
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({
    name: 'role',
    type: 'enum',
    enum: UserRole,
    default: UserRole.MEMBER,
  })
  @Index()
  role: UserRole;

  @Column({ name: 'is_email_verified', type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_suspended', type: 'boolean', default: false })
  isSuspended: boolean;

  @Column({ name: 'is_banned', type: 'boolean', default: false })
  isBanned: boolean;

  @Column({ name: 'email_verification_token', type: 'text', nullable: true })
  emailVerificationToken: string | null;

  @Column({ name: 'password_reset_token', type: 'text', nullable: true })
  passwordResetToken: string | null;

  @Column({
    name: 'password_reset_expires_at',
    type: 'timestamp',
    nullable: true,
  })
  passwordResetExpiresAt: Date | null;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken: string | null;

  @OneToMany('MessMember', 'user')
  messMemberships: unknown[];

  @OneToMany('JoinRequest', 'user')
  joinRequests: unknown[];

  @OneToMany('Notification', 'user')
  notifications: unknown[];
}
