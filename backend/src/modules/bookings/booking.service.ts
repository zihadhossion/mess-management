import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { BaseService } from '../../core/base/base.service';
import { Booking } from './booking.entity';
import { BookingRepository } from './booking.repository';
import { MessMemberRepository } from '../mess-members/mess-member.repository';
import { MealSlotRepository } from '../meal-slots/meal-slot.repository';
import { BookingStatus } from '../../common/enums/booking-status.enum';
import { MealSlotStatus } from '../../common/enums/meal-slot-status.enum';

@Injectable()
export class BookingService extends BaseService<Booking> {
  constructor(
    protected readonly repository: BookingRepository,
    private readonly messMemberRepository: MessMemberRepository,
    @Inject(forwardRef(() => MealSlotRepository))
    private readonly mealSlotRepository: MealSlotRepository,
  ) {
    super(repository, 'Booking');
  }

  async listMemberBookings(messId: string, userId: string): Promise<Booking[]> {
    const member = await this.messMemberRepository.findByMessAndUser(
      messId,
      userId,
    );
    if (!member)
      throw new ForbiddenException('You are not a member of this mess!');
    return this.repository.findByMember(member.id);
  }

  async cancelBooking(
    messId: string,
    bookingId: string,
    userId: string,
  ): Promise<Booking> {
    const booking = await this.repository.findById(bookingId, {
      mealSlot: true,
    });
    if (!booking) throw new NotFoundException('Booking not found!');

    const member = await this.messMemberRepository.findByMessAndUser(
      messId,
      userId,
    );
    if (!member || booking.messMemberId !== member.id) {
      throw new ForbiddenException('You do not own this booking!');
    }
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled!');
    }

    this.assertCancellationDeadline(booking.mealSlot as { date: Date });

    return this.repository.update(bookingId, {
      status: BookingStatus.CANCELLED,
      cancelledAt: new Date(),
    }) as Promise<Booking>;
  }

  async restoreBooking(
    messId: string,
    bookingId: string,
    userId: string,
  ): Promise<Booking> {
    const booking = await this.repository.findById(bookingId, {
      mealSlot: true,
    });
    if (!booking) throw new NotFoundException('Booking not found!');

    const member = await this.messMemberRepository.findByMessAndUser(
      messId,
      userId,
    );
    if (!member || booking.messMemberId !== member.id) {
      throw new ForbiddenException('You do not own this booking!');
    }
    if (booking.status === BookingStatus.BOOKED) {
      throw new BadRequestException('Booking is already active!');
    }

    this.assertCancellationDeadline(booking.mealSlot as { date: Date });

    return this.repository.update(bookingId, {
      status: BookingStatus.BOOKED,
      cancelledAt: null,
    }) as Promise<Booking>;
  }

  async bulkCancel(
    messId: string,
    bookingIds: string[],
    userId: string,
  ): Promise<void> {
    const member = await this.messMemberRepository.findByMessAndUser(
      messId,
      userId,
    );
    if (!member)
      throw new ForbiddenException('You are not a member of this mess!');

    for (const id of bookingIds) {
      const booking = await this.repository.findById(id, { mealSlot: true });
      if (!booking || booking.messMemberId !== member.id) continue;
      if (booking.status === BookingStatus.BOOKED) {
        this.assertCancellationDeadline(booking.mealSlot as { date: Date });
        await this.repository.update(id, {
          status: BookingStatus.CANCELLED,
          cancelledAt: new Date(),
        });
      }
    }
  }

  async bulkBook(
    messId: string,
    slotIds: string[],
    userId: string,
  ): Promise<Booking[]> {
    const member = await this.messMemberRepository.findByMessAndUser(
      messId,
      userId,
    );
    if (!member)
      throw new ForbiddenException('You are not a member of this mess!');

    const results: Booking[] = [];
    for (const slotId of slotIds) {
      const slot = await this.mealSlotRepository.findById(slotId);
      if (
        !slot ||
        slot.messId !== messId ||
        slot.status !== MealSlotStatus.PUBLISHED
      )
        continue;

      const existing = await this.repository.findBySlotAndMember(
        slotId,
        member.id,
      );
      if (existing) {
        if (existing.status === BookingStatus.CANCELLED) {
          this.assertCancellationDeadline(slot as { date: Date });
          const updated = await this.repository.update(existing.id, {
            status: BookingStatus.BOOKED,
            cancelledAt: null,
          });
          results.push(updated as Booking);
        }
      } else {
        const created = await this.repository.create({
          mealSlotId: slotId,
          messMemberId: member.id,
          portions: 1,
          status: BookingStatus.BOOKED,
        });
        results.push(created);
      }
    }
    return results;
  }

  async updatePortions(
    messId: string,
    bookingId: string,
    portions: number,
    userId: string,
  ): Promise<Booking> {
    const booking = await this.repository.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found!');

    const member = await this.messMemberRepository.findByMessAndUser(
      messId,
      userId,
    );
    if (!member || booking.messMemberId !== member.id) {
      throw new ForbiddenException('You do not own this booking!');
    }
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a cancelled booking!');
    }
    return this.repository.update(bookingId, { portions }) as Promise<Booking>;
  }

  private assertCancellationDeadline(slot: { date: Date }): void {
    const slotDate = new Date(slot.date);
    const midnight = new Date(slotDate);
    midnight.setDate(midnight.getDate() - 1);
    midnight.setHours(23, 59, 59, 999);
    if (new Date() > midnight) {
      throw new BadRequestException(
        'Cancellation deadline has passed (midnight of previous day)!',
      );
    }
  }
}
