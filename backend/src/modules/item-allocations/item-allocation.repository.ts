import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { ItemAllocation } from './item-allocation.entity';
import { ItemAllocationStatus } from '../../common/enums/item-allocation-status.enum';

@Injectable()
export class ItemAllocationRepository extends BaseRepository<ItemAllocation> {
  constructor(
    @InjectRepository(ItemAllocation)
    repository: Repository<ItemAllocation>,
  ) {
    super(repository);
  }

  async findByMemberAndDate(messMemberId: string, date: Date): Promise<ItemAllocation[]> {
    return this.findAll({ where: { messMemberId, date }, relations: ['itemType'] });
  }

  async findActiveByMemberAndMonth(messMemberId: string, month: number, year: number): Promise<ItemAllocation[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return this.findAll({
      where: { messMemberId, status: ItemAllocationStatus.ALLOCATED, date: Between(startDate, endDate) },
      relations: ['itemType'],
    });
  }

  async sumItemCostForMember(messMemberId: string, month: number, year: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const result = await this.repository
      .createQueryBuilder('ia')
      .innerJoin('ia.itemType', 'it')
      .where('ia.mess_member_id = :messMemberId', { messMemberId })
      .andWhere('ia.status = :status', { status: ItemAllocationStatus.ALLOCATED })
      .andWhere('ia.date >= :startDate', { startDate })
      .andWhere('ia.date <= :endDate', { endDate })
      .select('COALESCE(SUM(ia.quantity * it.cost_per_unit), 0)', 'total')
      .getRawOne<{ total: string }>();
    return parseFloat(result?.total ?? '0');
  }
}
