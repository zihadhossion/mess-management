import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealSlot } from './meal-slot.entity';
import { MealSlotRepository } from './meal-slot.repository';
import { MealSlotService } from './meal-slot.service';
import { MealSlotController } from './meal-slot.controller';
import { MessMembersModule } from '../mess-members/mess-members.module';
import { MessesModule } from '../messes/messes.module';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MealSlot]),
    MessMembersModule,
    MessesModule,
    forwardRef(() => BookingsModule),
  ],
  controllers: [MealSlotController],
  providers: [MealSlotService, MealSlotRepository],
  exports: [MealSlotService, MealSlotRepository],
})
export class MealSlotsModule {}
