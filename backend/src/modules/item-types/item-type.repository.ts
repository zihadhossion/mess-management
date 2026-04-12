import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { ItemType } from './item-type.entity';

@Injectable()
export class ItemTypeRepository extends BaseRepository<ItemType> {
  constructor(
    @InjectRepository(ItemType)
    repository: Repository<ItemType>,
  ) {
    super(repository);
  }

  async findByMess(messId: string): Promise<ItemType[]> {
    return this.findAll({ where: { messId } });
  }

  async findActiveByMess(messId: string): Promise<ItemType[]> {
    return this.findAll({ where: { messId, isActive: true } });
  }
}
