import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { Booking } from './booking.entity';
import { BookingStatus } from '../../common/enums/booking-status.enum';

@Injectable()
export class BookingRepository extends BaseRepository<Booking> {
  constructor(
    @InjectRepository(Booking)
    repository: Repository<Booking>,
  ) {
    super(repository);
  }

  async findBySlotAndMember(
    mealSlotId: string,
    messMemberId: string,
  ): Promise<Booking | null> {
    return this.findOne({ where: { mealSlotId, messMemberId } });
  }

  async findByMember(messMemberId: string): Promise<Booking[]> {
    return this.findAll({
      where: { messMemberId },
      relations: ['mealSlot'],
      order: { createdAt: 'DESC' },
    });
  }

  async findBySlot(mealSlotId: string): Promise<Booking[]> {
    return this.findAll({ where: { mealSlotId }, relations: ['messMember'] });
  }

  async findActiveByMember(messMemberId: string): Promise<Booking[]> {
    return this.findAll({
      where: { messMemberId, status: BookingStatus.BOOKED },
      relations: ['mealSlot'],
    });
  }

  async countActiveForSlot(mealSlotId: string): Promise<number> {
    return this.count({ where: { mealSlotId, status: BookingStatus.BOOKED } });
  }

  async sumPortionsForMember(
    messMemberId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('b')
      .innerJoin('b.mealSlot', 'ms')
      .where('b.mess_member_id = :messMemberId', { messMemberId })
      .andWhere('b.status = :status', { status: BookingStatus.BOOKED })
      .andWhere('ms.date >= :startDate', { startDate })
      .andWhere('ms.date <= :endDate', { endDate })
      .select('COALESCE(SUM(b.portions), 0)', 'total')
      .getRawOne<{ total: string }>();
    return parseFloat(result?.total ?? '0');
  }

  async sumPortionsForMemberFromDate(
    messMemberId: string,
    fromDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('b')
      .innerJoin('b.mealSlot', 'ms')
      .where('b.mess_member_id = :messMemberId', { messMemberId })
      .andWhere('b.status = :status', { status: BookingStatus.BOOKED })
      .andWhere('ms.date >= :fromDate', { fromDate })
      .andWhere('ms.date <= :endDate', { endDate })
      .select('COALESCE(SUM(b.portions), 0)', 'total')
      .getRawOne<{ total: string }>();
    return parseFloat(result?.total ?? '0');
  }

  async totalPortionsForMess(
    messId: string,
    month: number,
    year: number,
  ): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const result = await this.repository
      .createQueryBuilder('b')
      .innerJoin('b.mealSlot', 'ms')
      .innerJoin('b.messMember', 'mm')
      .where('mm.mess_id = :messId', { messId })
      .andWhere('b.status = :status', { status: BookingStatus.BOOKED })
      .andWhere('ms.date >= :startDate', { startDate })
      .andWhere('ms.date <= :endDate', { endDate })
      .select('COALESCE(SUM(b.portions), 0)', 'total')
      .getRawOne<{ total: string }>();
    return parseFloat(result?.total ?? '0');
  }
}
