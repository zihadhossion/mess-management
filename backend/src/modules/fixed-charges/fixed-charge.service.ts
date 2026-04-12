import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BaseService } from '../../core/base/base.service';
import { FixedCharge } from './fixed-charge.entity';
import { FixedChargeRepository } from './fixed-charge.repository';
import { MessRepository } from '../messes/mess.repository';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateFixedChargeDto, UpdateFixedChargeDto } from './dtos/create-fixed-charge.dto';

@Injectable()
export class FixedChargeService extends BaseService<FixedCharge> {
  constructor(
    protected readonly repository: FixedChargeRepository,
    private readonly messRepository: MessRepository,
  ) {
    super(repository, 'FixedCharge');
  }

  async createCharge(messId: string, dto: CreateFixedChargeDto, userId: string, userRole: UserRole): Promise<FixedCharge> {
    await this.assertManagerAccess(messId, userId, userRole);
    return this.repository.create({ ...dto, messId });
  }

  async updateCharge(messId: string, id: string, dto: UpdateFixedChargeDto, userId: string, userRole: UserRole): Promise<FixedCharge> {
    await this.assertManagerAccess(messId, userId, userRole);
    const charge = await this.findByIdOrFail(id);
    if (charge.messId !== messId) throw new NotFoundException('Fixed charge not found in this mess!');
    return this.repository.update(id, dto) as Promise<FixedCharge>;
  }

  async removeCharge(messId: string, id: string, userId: string, userRole: UserRole): Promise<void> {
    await this.assertManagerAccess(messId, userId, userRole);
    const charge = await this.findByIdOrFail(id);
    if (charge.messId !== messId) throw new NotFoundException('Fixed charge not found in this mess!');
    await this.repository.softDelete(id);
  }

  async listByMess(messId: string): Promise<FixedCharge[]> {
    return this.repository.findByMess(messId);
  }

  async toggleActive(messId: string, id: string, userId: string, userRole: UserRole): Promise<FixedCharge> {
    await this.assertManagerAccess(messId, userId, userRole);
    const charge = await this.findByIdOrFail(id);
    if (charge.messId !== messId) throw new NotFoundException('Fixed charge not found in this mess!');
    return this.repository.update(id, { isActive: !charge.isActive }) as Promise<FixedCharge>;
  }

  async sumActiveByMess(messId: string): Promise<number> {
    return this.repository.sumActiveByMess(messId);
  }

  private async assertManagerAccess(messId: string, userId: string, userRole: UserRole): Promise<void> {
    if (userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) return;
    const mess = await this.messRepository.findById(messId);
    if (!mess) throw new NotFoundException('Mess not found!');
    if (mess.managerId !== userId) throw new ForbiddenException('Manager access required!');
  }
}
