import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemAllocation } from './item-allocation.entity';
import { ItemAllocationRepository } from './item-allocation.repository';
import { ItemAllocationService } from './item-allocation.service';
import { ItemAllocationController } from './item-allocation.controller';
import { MessMembersModule } from '../mess-members/mess-members.module';

@Module({
  imports: [TypeOrmModule.forFeature([ItemAllocation]), MessMembersModule],
  controllers: [ItemAllocationController],
  providers: [ItemAllocationService, ItemAllocationRepository],
  exports: [ItemAllocationService, ItemAllocationRepository],
})
export class ItemAllocationsModule {}
