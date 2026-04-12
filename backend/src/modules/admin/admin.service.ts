import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsNull } from 'typeorm';
import { User } from '../users/user.entity';
import { Mess } from '../messes/mess.entity';
import { MessMember } from '../mess-members/mess-member.entity';
import { JoinRequest } from '../join-requests/join-request.entity';
import { MessDeletionRequest } from '../mess-deletion-requests/mess-deletion-request.entity';
import { AdminConfig } from './admin-config.entity';
import { UpdateAdminConfigDto } from './dtos/update-admin-config.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { MessStatus } from '../../common/enums/mess-status.enum';
import { JoinRequestStatus } from '../../common/enums/join-request-status.enum';
import { DeletionRequestStatus } from '../../common/enums/deletion-request-status.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Mess)
    private readonly messRepo: Repository<Mess>,
    @InjectRepository(MessMember)
    private readonly messMemberRepo: Repository<MessMember>,
    @InjectRepository(JoinRequest)
    private readonly joinRequestRepo: Repository<JoinRequest>,
    @InjectRepository(MessDeletionRequest)
    private readonly deletionRequestRepo: Repository<MessDeletionRequest>,
    @InjectRepository(AdminConfig)
    private readonly adminConfigRepo: Repository<AdminConfig>,
  ) {}

  async getConfig(): Promise<AdminConfig> {
    let config = await this.adminConfigRepo.findOne({ where: {} });
    if (!config) {
      config = this.adminConfigRepo.create();
      await this.adminConfigRepo.save(config);
    }
    return config;
  }

  async updateConfig(dto: UpdateAdminConfigDto): Promise<AdminConfig> {
    const config = await this.getConfig();
    Object.assign(config, dto);
    return this.adminConfigRepo.save(config);
  }

  async getStats() {
    const softDeleteFilter = { deletedAt: IsNull() };

    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      bannedUsers,
      adminUsers,
      managerUsers,
      memberUsers,
      totalMesses,
      activeMesses,
      pendingMesses,
      inactiveMesses,
      rejectedMesses,
      totalMembers,
      pendingJoinRequests,
      pendingDeletionRequests,
    ] = await Promise.all([
      this.userRepo.count({ where: softDeleteFilter }),
      this.userRepo.count({ where: { ...softDeleteFilter, isActive: true } }),
      this.userRepo.count({ where: { ...softDeleteFilter, isSuspended: true } }),
      this.userRepo.count({ where: { ...softDeleteFilter, isBanned: true } }),
      this.userRepo.count({ where: { ...softDeleteFilter, role: UserRole.ADMIN } }),
      this.userRepo.count({ where: { ...softDeleteFilter, role: UserRole.MANAGER } }),
      this.userRepo.count({ where: { ...softDeleteFilter, role: UserRole.MEMBER } }),
      this.messRepo.count({ where: softDeleteFilter }),
      this.messRepo.count({ where: { ...softDeleteFilter, status: MessStatus.ACTIVE } }),
      this.messRepo.count({ where: { ...softDeleteFilter, status: MessStatus.PENDING_APPROVAL } }),
      this.messRepo.count({ where: { ...softDeleteFilter, status: MessStatus.INACTIVE } }),
      this.messRepo.count({ where: { ...softDeleteFilter, status: MessStatus.REJECTED } }),
      this.messMemberRepo.count({ where: { ...softDeleteFilter, isActive: true } }),
      this.joinRequestRepo.count({ where: { ...softDeleteFilter, status: JoinRequestStatus.PENDING } }),
      this.deletionRequestRepo.count({ where: { ...softDeleteFilter, status: DeletionRequestStatus.PENDING } }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        banned: bannedUsers,
        byRole: {
          admin: adminUsers,
          manager: managerUsers,
          member: memberUsers,
        },
      },
      messes: {
        total: totalMesses,
        active: activeMesses,
        pending: pendingMesses,
        inactive: inactiveMesses,
        rejected: rejectedMesses,
      },
      members: {
        total: totalMembers,
      },
      pendingJoinRequests,
      pendingDeletionRequests,
    };
  }
}
