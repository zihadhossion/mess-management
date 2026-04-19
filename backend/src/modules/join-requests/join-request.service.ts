import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BaseService } from '../../core/base/base.service';
import { JoinRequest } from './join-request.entity';
import { JoinRequestRepository } from './join-request.repository';
import { MessMemberRepository } from '../mess-members/mess-member.repository';
import { MessRepository } from '../messes/mess.repository';
import { AdminService } from '../admin/admin.service';
import { JoinRequestStatus } from '../../common/enums/join-request-status.enum';
import { MessStatus } from '../../common/enums/mess-status.enum';
import { MemberRole } from '../../common/enums/member-role.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import { Logger } from '@nestjs/common';

@Injectable()
export class JoinRequestService extends BaseService<JoinRequest> {
  private readonly logger = new Logger(JoinRequestService.name);

  constructor(
    protected readonly repository: JoinRequestRepository,
    private readonly messMemberRepository: MessMemberRepository,
    private readonly messRepository: MessRepository,
    private readonly adminService: AdminService,
  ) {
    super(repository, 'JoinRequest');
  }

  async submitRequest(messId: string, userId: string): Promise<JoinRequest> {
    const mess = await this.messRepository.findById(messId);
    if (!mess) throw new NotFoundException('Mess not found!');
    if (mess.status !== MessStatus.ACTIVE) {
      throw new BadRequestException('This mess is not currently active!');
    }

    const existingMember = await this.messMemberRepository.findByMessAndUser(
      messId,
      userId,
    );
    if (existingMember && existingMember.isActive) {
      throw new BadRequestException('You are already a member of this mess!');
    }

    const existingRequest = await this.repository.findPendingByMessAndUser(
      messId,
      userId,
    );
    if (existingRequest) {
      throw new BadRequestException(
        'You already have a pending join request for this mess!',
      );
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return this.repository.create({
      messId,
      userId,
      status: JoinRequestStatus.PENDING,
      expiresAt,
    });
  }

  async approveRequest(
    messId: string,
    requestId: string,
    managerId: string,
    managerRole: UserRole,
  ): Promise<JoinRequest> {
    const request = await this.repository.findById(requestId);
    if (!request || request.messId !== messId) {
      throw new NotFoundException('Join request not found!');
    }
    if (request.status !== JoinRequestStatus.PENDING) {
      throw new BadRequestException('Join request is no longer pending!');
    }
    await this.assertManagerAccess(messId, managerId, managerRole);

    await this.repository.update(requestId, {
      status: JoinRequestStatus.APPROVED,
      processedAt: new Date(),
    });

    // Enforce max members limit
    const [count, config] = await Promise.all([
      this.messMemberRepository.countActiveMembers(messId),
      this.adminService.getConfig(),
    ]);
    if (count >= config.maxMembersPerMess) {
      throw new BadRequestException(
        `This mess has reached the maximum member limit of ${config.maxMembersPerMess}.`,
      );
    }

    // Create membership
    const existingMember = await this.messMemberRepository.findByMessAndUser(
      messId,
      request.userId,
    );
    if (!existingMember) {
      await this.messMemberRepository.create({
        messId,
        userId: request.userId,
        memberRole: MemberRole.MEMBER,
        joinDate: new Date(),
        isActive: true,
        participatesInMeals: true,
      });
    } else {
      await this.messMemberRepository.update(existingMember.id, {
        isActive: true,
      });
    }

    return this.repository.findById(requestId) as Promise<JoinRequest>;
  }

  async rejectRequest(
    messId: string,
    requestId: string,
    managerId: string,
    managerRole: UserRole,
  ): Promise<JoinRequest> {
    const request = await this.repository.findById(requestId);
    if (!request || request.messId !== messId) {
      throw new NotFoundException('Join request not found!');
    }
    if (request.status !== JoinRequestStatus.PENDING) {
      throw new BadRequestException('Join request is no longer pending!');
    }
    await this.assertManagerAccess(messId, managerId, managerRole);

    await this.repository.update(requestId, {
      status: JoinRequestStatus.REJECTED,
      processedAt: new Date(),
    });
    return this.repository.findById(requestId) as Promise<JoinRequest>;
  }

  async listForMess(
    messId: string,
    managerId: string,
    managerRole: UserRole,
  ): Promise<JoinRequest[]> {
    await this.assertManagerAccess(messId, managerId, managerRole);
    return this.repository.findByMessId(messId);
  }

  async listForUser(userId: string): Promise<JoinRequest[]> {
    return this.repository.findByUserId(userId);
  }

  async listAllAdmin(
    page = 1,
    limit = 20,
  ): Promise<{ data: JoinRequest[]; total: number }> {
    const [data, total] = await this.repository.findAllForAdmin(page, limit);
    return { data, total };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async expireStaleRequests(): Promise<void> {
    const expired = await this.repository.findExpired();
    for (const req of expired) {
      await this.repository.update(req.id, {
        status: JoinRequestStatus.EXPIRED,
      });
    }
    if (expired.length > 0) {
      this.logger.log(`Expired ${expired.length} stale join requests.`);
    }
  }

  private async assertManagerAccess(
    messId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    if (userRole === UserRole.ADMIN) return;
    const mess = await this.messRepository.findById(messId);
    if (!mess) throw new NotFoundException('Mess not found!');
    if (mess.managerId !== userId) {
      const member = await this.messMemberRepository.findByMessAndUser(
        messId,
        userId,
      );
      if (!member || member.memberRole !== MemberRole.CO_MANAGER) {
        throw new ForbiddenException(
          'You do not have manager access to this mess!',
        );
      }
    }
  }
}
