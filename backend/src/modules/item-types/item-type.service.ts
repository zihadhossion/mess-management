import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BaseService } from '../../core/base/base.service';
import { ItemType } from './item-type.entity';
import { ItemTypeRepository } from './item-type.repository';
import { MessRepository } from '../messes/mess.repository';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateItemTypeDto, UpdateItemTypeDto } from './dtos/create-item-type.dto';

@Injectable()
export class ItemTypeService extends BaseService<ItemType> {
  constructor(
    protected readonly repository: ItemTypeRepository,
    private readonly messRepository: MessRepository,
  ) {
    super(repository, 'ItemType');
  }

  async createItemType(messId: string, dto: CreateItemTypeDto, userId: string, userRole: UserRole): Promise<ItemType> {
    await this.assertManagerAccess(messId, userId, userRole);
    return this.repository.create({ ...dto, messId });
  }

  async updateItemType(messId: string, id: string, dto: UpdateItemTypeDto, userId: string, userRole: UserRole): Promise<ItemType> {
    await this.assertManagerAccess(messId, userId, userRole);
    const item = await this.findByIdOrFail(id);
    if (item.messId !== messId) throw new NotFoundException('Item type not found in this mess!');
    return this.repository.update(id, dto) as Promise<ItemType>;
  }

  async removeItemType(messId: string, id: string, userId: string, userRole: UserRole): Promise<void> {
    await this.assertManagerAccess(messId, userId, userRole);
    const item = await this.findByIdOrFail(id);
    if (item.messId !== messId) throw new NotFoundException('Item type not found in this mess!');
    await this.repository.softDelete(id);
  }

  async listByMess(messId: string): Promise<ItemType[]> {
    return this.repository.findByMess(messId);
  }

  async toggleActive(messId: string, id: string, userId: string, userRole: UserRole): Promise<ItemType> {
    await this.assertManagerAccess(messId, userId, userRole);
    const item = await this.findByIdOrFail(id);
    if (item.messId !== messId) throw new NotFoundException('Item type not found in this mess!');
    return this.repository.update(id, { isActive: !item.isActive }) as Promise<ItemType>;
  }

  private async assertManagerAccess(messId: string, userId: string, userRole: UserRole): Promise<void> {
    if (userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) return;
    const mess = await this.messRepository.findById(messId);
    if (!mess) throw new NotFoundException('Mess not found!');
    if (mess.managerId !== userId) throw new ForbiddenException('Manager access required!');
  }
}
