import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { Mess } from './mess.entity';
import { MessStatus } from '../../common/enums/mess-status.enum';

@Injectable()
export class MessRepository extends BaseRepository<Mess> {
  constructor(
    @InjectRepository(Mess)
    repository: Repository<Mess>,
  ) {
    super(repository);
  }

  async findByManagerId(managerId: string): Promise<Mess[]> {
    return this.findAll({ where: { managerId } });
  }

  async findByMessId(messId: string): Promise<Mess | null> {
    return this.findOne({ where: { messId } });
  }

  async findByStatus(status: MessStatus): Promise<Mess[]> {
    return this.findAll({ where: { status } });
  }

  async search(query: string, page = 1, limit = 20): Promise<[Mess[], number]> {
    return this.repository.findAndCount({
      where: [
        { name: ILike(`%${query}%`), status: MessStatus.ACTIVE },
        { messId: ILike(`%${query}%`), status: MessStatus.ACTIVE },
      ],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async generateUniqueMessId(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let attempt = 0;
    while (attempt < 20) {
      const id =
        'MESS-' +
        Array.from(
          { length: 4 },
          () => chars[Math.floor(Math.random() * chars.length)],
        ).join('');
      const existing = await this.findByMessId(id);
      if (!existing) return id;
      attempt++;
    }
    throw new Error('Could not generate unique messId after 20 attempts');
  }
}
