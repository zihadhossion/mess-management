import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { MealSlot } from './meal-slot.entity';
import { MealSlotStatus } from '../../common/enums/meal-slot-status.enum';

@Injectable()
export class MealSlotRepository extends BaseRepository<MealSlot> {
  constructor(
    @InjectRepository(MealSlot)
    repository: Repository<MealSlot>,
  ) {
    super(repository);
  }

  async findByMessAndDate(messId: string, date: string): Promise<MealSlot[]> {
    return this.findAll({ where: { messId, date: new Date(date) } });
  }

  async findByMessDateRange(
    messId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MealSlot[]> {
    return this.findAll({
      where: { messId, date: Between(startDate, endDate) },
    });
  }

  async findPublished(messId: string): Promise<MealSlot[]> {
    return this.findAll({
      where: { messId, status: MealSlotStatus.PUBLISHED },
      order: { date: 'DESC' },
    });
  }
}
