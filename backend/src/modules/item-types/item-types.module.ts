import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemType } from './item-type.entity';
import { ItemTypeRepository } from './item-type.repository';
import { ItemTypeService } from './item-type.service';
import { ItemTypeController } from './item-type.controller';
import { MessesModule } from '../messes/messes.module';

@Module({
  imports: [TypeOrmModule.forFeature([ItemType]), MessesModule],
  controllers: [ItemTypeController],
  providers: [ItemTypeService, ItemTypeRepository],
  exports: [ItemTypeService, ItemTypeRepository],
})
export class ItemTypesModule {}
