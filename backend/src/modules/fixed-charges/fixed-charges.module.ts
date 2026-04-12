import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FixedCharge } from './fixed-charge.entity';
import { FixedChargeRepository } from './fixed-charge.repository';
import { FixedChargeService } from './fixed-charge.service';
import { FixedChargeController } from './fixed-charge.controller';
import { MessesModule } from '../messes/messes.module';

@Module({
  imports: [TypeOrmModule.forFeature([FixedCharge]), MessesModule],
  controllers: [FixedChargeController],
  providers: [FixedChargeService, FixedChargeRepository],
  exports: [FixedChargeService, FixedChargeRepository],
})
export class FixedChargesModule {}
