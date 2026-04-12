import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from '../../core/base/base.service';
import { DailyCost } from './daily-cost.entity';
import { DailyCostRepository } from './daily-cost.repository';
import { MessRepository } from '../messes/mess.repository';
import { UserRole } from '../../common/enums/user-role.enum';
import {
  CreateDailyCostDto,
  UpdateDailyCostDto,
} from './dtos/create-daily-cost.dto';

@Injectable()
export class DailyCostService extends BaseService<DailyCost> {
  constructor(
    protected readonly repository: DailyCostRepository,
    private readonly messRepository: MessRepository,
  ) {
    super(repository, 'DailyCost');
  }

  async createCost(
    messId: string,
    dto: CreateDailyCostDto,
    userId: string,
    userRole: UserRole,
  ): Promise<DailyCost> {
    await this.assertManagerAccess(messId, userId, userRole);
    return this.repository.create({ ...dto, messId, date: new Date(dto.date) });
  }

  async updateCost(
    messId: string,
    id: string,
    dto: UpdateDailyCostDto,
    userId: string,
    userRole: UserRole,
  ): Promise<DailyCost> {
    await this.assertManagerAccess(messId, userId, userRole);
    const cost = await this.findByIdOrFail(id);
    if (cost.messId !== messId)
      throw new NotFoundException('Daily cost not found in this mess!');
    return this.repository.update(id, dto) as Promise<DailyCost>;
  }

  async removeCost(
    messId: string,
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    await this.assertManagerAccess(messId, userId, userRole);
    const cost = await this.findByIdOrFail(id);
    if (cost.messId !== messId)
      throw new NotFoundException('Daily cost not found in this mess!');
    await this.repository.softDelete(id);
  }

  async listByMonth(
    messId: string,
    month: number,
    year: number,
  ): Promise<DailyCost[]> {
    return this.repository.findByMessAndMonth(messId, month, year);
  }

  async getMonthlySummary(
    messId: string,
    month: number,
    year: number,
  ): Promise<{ totalCost: number; month: number; year: number }> {
    const totalCost = await this.repository.sumByMessAndMonth(
      messId,
      month,
      year,
    );
    return { totalCost, month, year };
  }

  private async assertManagerAccess(
    messId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    if (userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) return;
    const mess = await this.messRepository.findById(messId);
    if (!mess) throw new NotFoundException('Mess not found!');
    if (mess.managerId !== userId)
      throw new ForbiddenException('Manager access required!');
  }
}
