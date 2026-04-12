import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { MessMember } from './mess-member.entity';
import { MemberRole } from '../../common/enums/member-role.enum';

@Injectable()
export class MessMemberRepository extends BaseRepository<MessMember> {
  constructor(
    @InjectRepository(MessMember)
    repository: Repository<MessMember>,
  ) {
    super(repository);
  }

  async findByMessId(messId: string): Promise<MessMember[]> {
    return this.findAll({ where: { messId }, relations: ['user'] });
  }

  async findByMessAndUser(
    messId: string,
    userId: string,
  ): Promise<MessMember | null> {
    return this.findOne({ where: { messId, userId } });
  }

  async findActiveMembers(messId: string): Promise<MessMember[]> {
    return this.findAll({
      where: { messId, isActive: true },
      relations: ['user'],
    });
  }

  async findCoManager(messId: string): Promise<MessMember | null> {
    return this.findOne({
      where: { messId, memberRole: MemberRole.CO_MANAGER },
    });
  }

  async findActiveParticipatingMembers(messId: string): Promise<MessMember[]> {
    return this.findAll({
      where: { messId, isActive: true, participatesInMeals: true },
    });
  }

  async countActiveMembers(messId: string): Promise<number> {
    return this.count({ where: { messId, isActive: true } });
  }
}
