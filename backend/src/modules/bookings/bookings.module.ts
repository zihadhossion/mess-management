import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { BookingRepository } from './booking.repository';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { MessMembersModule } from '../mess-members/mess-members.module';
import { MealSlotsModule } from '../meal-slots/meal-slots.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    MessMembersModule,
    forwardRef(() => MealSlotsModule),
  ],
  controllers: [BookingController],
  providers: [BookingService, BookingRepository],
  exports: [BookingService, BookingRepository],
})
export class BookingsModule {}
