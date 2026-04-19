import {
  Injectable,
  ForbiddenException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BaseService } from '../../core/base/base.service';
import { MessMember } from './mess-member.entity';
import { MessMemberRepository } from './mess-member.repository';
import { UserService } from '../users/user.service';
import { AdminService } from '../admin/admin.service';
import { MemberRole } from '../../common/enums/member-role.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import {
  AddMemberByEmailDto,
  CreateMemberAccountDto,
} from './dtos/create-mess-member.dto';
import { UpdateMessMemberDto } from './dtos/update-mess-member.dto';

@Injectable()
export class MessMemberService extends BaseService<MessMember> {
  constructor(
    protected readonly repository: MessMemberRepository,
    private readonly userService: UserService,
    private readonly adminService: AdminService,
  ) {
    super(repository, 'MessMember');
  }

  private async assertBelowMemberLimit(messId: string): Promise<void> {
    const [count, config] = await Promise.all([
      this.repository.countActiveMembers(messId),
      this.adminService.getConfig(),
    ]);
    if (count >= config.maxMembersPerMess) {
      throw new BadRequestException(
        `This mess has reached the maximum member limit of ${config.maxMembersPerMess}.`,
      );
    }
  }

  async getMembers(messId: string): Promise<MessMember[]> {
    return this.repository.findByMessId(messId);
  }

  async addMemberByEmail(
    messId: string,
    dto: AddMemberByEmailDto,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<MessMember> {
    await this.assertManagerAccess(messId, requesterId, requesterRole);

    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException(`User with email ${dto.email} not found!`);
    }

    const existing = await this.repository.findByMessAndUser(messId, user.id);
    if (existing) {
      throw new ConflictException('User is already a member of this mess!');
    }

    await this.assertBelowMemberLimit(messId);

    return this.repository.create({
      messId,
      userId: user.id,
      memberRole: dto.memberRole || MemberRole.MEMBER,
      joinDate: new Date(),
      isActive: true,
      isGuest: dto.isGuest || false,
      guestValidUntil: dto.guestValidUntil
        ? new Date(dto.guestValidUntil)
        : null,
      participatesInMeals: true,
    });
  }

  async createAndAddMember(
    messId: string,
    dto: CreateMemberAccountDto,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<MessMember> {
    await this.assertManagerAccess(messId, requesterId, requesterRole);
    await this.assertBelowMemberLimit(messId);

    const user = await this.userService.createUser({
      fullName: dto.fullName,
      email: dto.email,
      password: dto.password,
      role: UserRole.MEMBER,
    });

    return this.repository.create({
      messId,
      userId: user.id,
      memberRole: MemberRole.MEMBER,
      joinDate: new Date(),
      isActive: true,
      isGuest: dto.isGuest || false,
      guestValidUntil: dto.guestValidUntil
        ? new Date(dto.guestValidUntil)
        : null,
      participatesInMeals: true,
    });
  }

  async updateMember(
    messId: string,
    memberId: string,
    dto: UpdateMessMemberDto,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<MessMember> {
    await this.assertManagerAccess(messId, requesterId, requesterRole);
    const member = await this.repository.findById(memberId);
    if (!member || member.messId !== messId) {
      throw new NotFoundException('MessMember not found in this mess!');
    }
    const updates: Partial<MessMember> = {};
    if (dto.memberRole !== undefined) updates.memberRole = dto.memberRole;
    if (dto.isActive !== undefined) {
      if (dto.isActive && !member.isActive) {
        await this.assertBelowMemberLimit(messId);
      }
      updates.isActive = dto.isActive;
    }
    if (dto.participatesInMeals !== undefined)
      updates.participatesInMeals = dto.participatesInMeals;
    if (dto.isGuest !== undefined) updates.isGuest = dto.isGuest;
    if (dto.guestValidUntil !== undefined)
      updates.guestValidUntil = new Date(dto.guestValidUntil);
    return this.repository.update(memberId, updates) as Promise<MessMember>;
  }

  async removeMember(
    messId: string,
    memberId: string,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<void> {
    await this.assertManagerAccess(messId, requesterId, requesterRole);
    const member = await this.repository.findById(memberId);
    if (!member || member.messId !== messId) {
      throw new NotFoundException('MessMember not found in this mess!');
    }
    await this.repository.softDelete(memberId);
  }

  async assignCoManager(
    messId: string,
    memberId: string,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<MessMember> {
    await this.assertManagerAccess(messId, requesterId, requesterRole);
    const member = await this.repository.findById(memberId);
    if (!member || member.messId !== messId) {
      throw new NotFoundException('MessMember not found in this mess!');
    }
    // Remove existing co-manager
    const existing = await this.repository.findCoManager(messId);
    if (existing && existing.id !== memberId) {
      await this.repository.update(existing.id, {
        memberRole: MemberRole.MEMBER,
      });
    }
    return this.repository.update(memberId, {
      memberRole: MemberRole.CO_MANAGER,
    }) as Promise<MessMember>;
  }

  async getMemberByUserId(messId: string, userId: string): Promise<MessMember> {
    const member = await this.repository.findByMessAndUser(messId, userId);
    if (!member) {
      throw new NotFoundException('You are not a member of this mess!');
    }
    return member;
  }

  async getActiveParticipatingCount(messId: string): Promise<number> {
    const members =
      await this.repository.findActiveParticipatingMembers(messId);
    return members.length;
  }

  async getActiveParticipatingMembers(messId: string): Promise<MessMember[]> {
    return this.repository.findActiveParticipatingMembers(messId);
  }

  private async assertManagerAccess(
    messId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    if (userRole === UserRole.ADMIN) return;
    const member = await this.repository.findByMessAndUser(messId, userId);
    const isManager = member && member.memberRole === MemberRole.CO_MANAGER;
    // Also allow the mess manager (checked via mess entity); we trust caller to pass managerId
    if (userRole === UserRole.MANAGER) return;
    if (!isManager) {
      throw new ForbiddenException(
        'You do not have manager access to this mess!',
      );
    }
  }

  async assertMemberAccess(
    messId: string,
    userId: string,
  ): Promise<MessMember> {
    const member = await this.repository.findByMessAndUser(messId, userId);
    if (!member || !member.isActive) {
      throw new ForbiddenException(
        'You are not an active member of this mess!',
      );
    }
    return member;
  }
}
