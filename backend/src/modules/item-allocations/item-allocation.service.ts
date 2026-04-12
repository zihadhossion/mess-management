import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BaseService } from '../../core/base/base.service';
import { ItemAllocation } from './item-allocation.entity';
import { ItemAllocationRepository } from './item-allocation.repository';
import { MessMemberRepository } from '../mess-members/mess-member.repository';
import { ItemAllocationStatus } from '../../common/enums/item-allocation-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateItemAllocationDto, UpdateItemAllocationDto } from './dtos/create-item-allocation.dto';

@Injectable()
export class ItemAllocationService extends BaseService<ItemAllocation> {
  constructor(
    protected readonly repository: ItemAllocationRepository,
    private readonly messMemberRepository: MessMemberRepository,
  ) {
    super(repository, 'ItemAllocation');
  }

  async createAllocation(messId: string, dto: CreateItemAllocationDto, userId: string, userRole: UserRole): Promise<ItemAllocation> {
    await this.assertManagerAccess(messId, userId, userRole);
    return this.repository.create({
      ...dto,
      date: new Date(dto.date),
      status: ItemAllocationStatus.ALLOCATED,
    });
  }

  async updateAllocation(messId: string, id: string, dto: UpdateItemAllocationDto, userId: string, userRole: UserRole): Promise<ItemAllocation> {
    await this.assertManagerAccess(messId, userId, userRole);
    const alloc = await this.findByIdOrFail(id);
    const member = await this.messMemberRepository.findById(alloc.messMemberId);
    if (!member || member.messId !== messId) throw new NotFoundException('Allocation not in this mess!');
    return this.repository.update(id, { quantity: dto.quantity, status: ItemAllocationStatus.ADJUSTED }) as Promise<ItemAllocation>;
  }

  async cancelAllocation(messId: string, id: string, userId: string, userRole: UserRole): Promise<ItemAllocation> {
    await this.assertManagerAccess(messId, userId, userRole);
    const alloc = await this.findByIdOrFail(id);
    const member = await this.messMemberRepository.findById(alloc.messMemberId);
    if (!member || member.messId !== messId) throw new NotFoundException('Allocation not in this mess!');
    return this.repository.update(id, { status: ItemAllocationStatus.CANCELLED, cancelledAt: new Date() }) as Promise<ItemAllocation>;
  }

  async listForMember(messId: string, memberId: string): Promise<ItemAllocation[]> {
    return this.repository.findByMemberAndDate(memberId, new Date());
  }

  async getMonthlyItemCost(messMemberId: string, month: number, year: number): Promise<number> {
    return this.repository.sumItemCostForMember(messMemberId, month, year);
  }

  private async assertManagerAccess(messId: string, userId: string, userRole: UserRole): Promise<void> {
    if (userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) return;
    const member = await this.messMemberRepository.findByMessAndUser(messId, userId);
    if (!member) throw new ForbiddenException('Manager access required!');
  }
}
