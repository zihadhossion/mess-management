import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyCost } from './daily-cost.entity';
import { DailyCostRepository } from './daily-cost.repository';
import { DailyCostService } from './daily-cost.service';
import { DailyCostController } from './daily-cost.controller';
import { MessesModule } from '../messes/messes.module';

@Module({
  imports: [TypeOrmModule.forFeature([DailyCost]), MessesModule],
  controllers: [DailyCostController],
  providers: [DailyCostService, DailyCostRepository],
  exports: [DailyCostService, DailyCostRepository],
})
export class DailyCostsModule {}
