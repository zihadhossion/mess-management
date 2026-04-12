import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { BaseService } from '../../core/base/base.service';
import { MealSlot } from './meal-slot.entity';
import { MealSlotRepository } from './meal-slot.repository';
import { MessMemberRepository } from '../mess-members/mess-member.repository';
import { BookingRepository } from '../bookings/booking.repository';
import { MealSlotStatus } from '../../common/enums/meal-slot-status.enum';
import { BookingStatus } from '../../common/enums/booking-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import { MessRepository } from '../messes/mess.repository';
import {
  CreateMealSlotDto,
  UpdateMealSlotDto,
} from './dtos/create-meal-slot.dto';

@Injectable()
export class MealSlotService extends BaseService<MealSlot> {
  constructor(
    protected readonly repository: MealSlotRepository,
    private readonly messMemberRepository: MessMemberRepository,
    @Inject(forwardRef(() => BookingRepository))
    private readonly bookingRepository: BookingRepository,
    private readonly messRepository: MessRepository,
  ) {
    super(repository, 'MealSlot');
  }

  async createSlot(
    messId: string,
    dto: CreateMealSlotDto,
    userId: string,
    userRole: UserRole,
  ): Promise<MealSlot> {
    await this.assertManagerAccess(messId, userId, userRole);
    const existing = await this.repository.findOne({
      where: { messId, date: new Date(dto.date), type: dto.type },
    });
    if (existing) {
      throw new BadRequestException(
        `A ${dto.type} slot already exists for this date!`,
      );
    }
    return this.repository.create({
      messId,
      date: new Date(dto.date),
      type: dto.type,
      timeWindowStart: dto.timeWindowStart,
      timeWindowEnd: dto.timeWindowEnd,
      menuDescription: dto.menuDescription || null,
      status: MealSlotStatus.DRAFT,
    });
  }

  async updateSlot(
    messId: string,
    slotId: string,
    dto: UpdateMealSlotDto,
    userId: string,
    userRole: UserRole,
  ): Promise<MealSlot> {
    await this.assertManagerAccess(messId, userId, userRole);
    const slot = await this.findByIdOrFail(slotId);
    if (slot.messId !== messId)
      throw new NotFoundException('Meal slot not found in this mess!');
    if (slot.status === MealSlotStatus.PUBLISHED) {
      throw new BadRequestException('Published slots cannot be edited!');
    }
    return this.repository.update(slotId, dto) as Promise<MealSlot>;
  }

  async publishSlot(
    messId: string,
    slotId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<MealSlot> {
    await this.assertManagerAccess(messId, userId, userRole);
    const slot = await this.findByIdOrFail(slotId);
    if (slot.messId !== messId)
      throw new NotFoundException('Meal slot not found in this mess!');
    if (slot.status === MealSlotStatus.PUBLISHED) {
      throw new BadRequestException('Slot is already published!');
    }

    // Must publish at least 24 hours before meal time
    const slotDatetime = new Date(
      `${slot.date instanceof Date ? slot.date.toISOString().split('T')[0] : slot.date}T${slot.timeWindowStart}:00`,
    );
    const now = new Date();
    const diffMs = slotDatetime.getTime() - now.getTime();
    if (diffMs < 24 * 60 * 60 * 1000) {
      throw new BadRequestException(
        'Slots must be published at least 24 hours before meal time!',
      );
    }

    const published = (await this.repository.update(slotId, {
      status: MealSlotStatus.PUBLISHED,
      publishedAt: new Date(),
    })) as MealSlot;

    // Auto-book all active participating members
    const members =
      await this.messMemberRepository.findActiveParticipatingMembers(messId);
    for (const member of members) {
      const existing = await this.bookingRepository.findBySlotAndMember(
        slotId,
        member.id,
      );
      if (!existing) {
        await this.bookingRepository.create({
          mealSlotId: slotId,
          messMemberId: member.id,
          portions: 1,
          status: BookingStatus.BOOKED,
        });
      }
    }

    return published;
  }

  async deleteSlot(
    messId: string,
    slotId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    await this.assertManagerAccess(messId, userId, userRole);
    const slot = await this.findByIdOrFail(slotId);
    if (slot.messId !== messId)
      throw new NotFoundException('Meal slot not found in this mess!');
    if (slot.status === MealSlotStatus.PUBLISHED) {
      throw new BadRequestException('Published slots cannot be deleted!');
    }
    await this.repository.softDelete(slotId);
  }

  async listForMess(messId: string, date?: string): Promise<MealSlot[]> {
    if (date) return this.repository.findByMessAndDate(messId, date);
    return this.repository.findAll({
      where: { messId },
      order: { date: 'DESC' },
    });
  }

  private async assertManagerAccess(
    messId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    if (userRole === UserRole.ADMIN) return;
    const mess = await this.messRepository.findById(messId);
    if (!mess) throw new NotFoundException('Mess not found!');
    if (mess.managerId === userId) return;
    if (userRole === UserRole.MANAGER) return;
    throw new ForbiddenException(
      'You do not have manager access to this mess!',
    );
  }
}
