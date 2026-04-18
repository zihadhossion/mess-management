import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from '../../core/base/base.service';
import { Mess } from './mess.entity';
import { MessRepository } from './mess.repository';
import { MessStatus } from '../../common/enums/mess-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import { Between } from 'typeorm';
import { CreateMessDto } from './dtos/create-mess.dto';
import { UpdateMessDto } from './dtos/update-mess.dto';

@Injectable()
export class MessService extends BaseService<Mess> {
  constructor(protected readonly repository: MessRepository) {
    super(repository, 'Mess');
  }

  async createMess(dto: CreateMessDto, managerId: string): Promise<Mess> {
    return this.repository.create({
      ...dto,
      managerId,
      status: MessStatus.PENDING_APPROVAL,
      messId: null,
    });
  }

  async approveMess(id: string, notes?: string): Promise<Mess> {
    const mess = await this.findByIdOrFail(id);
    if (mess.status !== MessStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Mess is not pending approval!');
    }
    const messId = await this.repository.generateUniqueMessId();
    return this.repository.update(id, {
      status: MessStatus.ACTIVE,
      messId,
      rejectionNotes: notes || null,
    }) as Promise<Mess>;
  }

  async rejectMess(id: string, notes?: string): Promise<Mess> {
    const mess = await this.findByIdOrFail(id);
    if (mess.status !== MessStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Mess is not pending approval!');
    }
    const newCount = mess.resubmissionCount + 1;
    return this.repository.update(id, {
      status: MessStatus.REJECTED,
      rejectionNotes: notes || null,
      resubmissionCount: newCount,
    }) as Promise<Mess>;
  }

  async resubmitMess(
    id: string,
    managerId: string,
    dto: UpdateMessDto,
  ): Promise<Mess> {
    const mess = await this.findByIdOrFail(id);
    if (mess.managerId !== managerId) {
      throw new ForbiddenException('You are not the manager of this mess!');
    }
    if (mess.status !== MessStatus.REJECTED) {
      throw new BadRequestException('Only rejected messes can be resubmitted!');
    }
    if (mess.resubmissionCount >= 3) {
      throw new BadRequestException('Maximum resubmission limit (3) reached!');
    }
    return this.repository.update(id, {
      ...dto,
      status: MessStatus.PENDING_APPROVAL,
    }) as Promise<Mess>;
  }

  async updateMess(
    id: string,
    managerId: string,
    dto: UpdateMessDto,
    userRole: UserRole,
  ): Promise<Mess> {
    const mess = await this.findByIdOrFail(id);
    if (userRole !== UserRole.ADMIN && mess.managerId !== managerId) {
      throw new ForbiddenException('You are not the manager of this mess!');
    }
    return this.repository.update(id, dto) as Promise<Mess>;
  }

  async deactivateMess(
    id: string,
    managerId: string,
    userRole: UserRole,
  ): Promise<Mess> {
    const mess = await this.findByIdOrFail(id);
    if (userRole !== UserRole.ADMIN && mess.managerId !== managerId) {
      throw new ForbiddenException('You are not the manager of this mess!');
    }
    return this.repository.update(id, {
      status: MessStatus.INACTIVE,
    }) as Promise<Mess>;
  }

  async getMyMesses(managerId: string): Promise<Mess[]> {
    return this.repository.findByManagerId(managerId);
  }

  async searchMesses(
    query: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: Mess[]; total: number }> {
    const [data, total] = await this.repository.search(query, page, limit);
    return { data, total };
  }

  async getMessForManager(
    messId: string,
    managerId: string,
    userRole: UserRole,
  ): Promise<Mess> {
    const mess = await this.findByIdOrFail(messId);
    if (userRole !== UserRole.ADMIN && mess.managerId !== managerId) {
      throw new ForbiddenException('You do not have access to this mess!');
    }
    return mess;
  }

  async getPendingRequests(
    page = 1,
    limit = 20,
  ): Promise<{ data: Mess[]; total: number }> {
    const where = { status: MessStatus.PENDING_APPROVAL };
    const [data, total] = await Promise.all([
      this.repository.findAll({ where, skip: (page - 1) * limit, take: limit }),
      this.repository.count({ where }),
    ]);
    return { data, total };
  }

  async reassignManager(id: string, newManagerId: string): Promise<Mess> {
    await this.findByIdOrFail(id);
    return this.repository.update(id, { managerId: newManagerId }) as Promise<Mess>;
  }

  async getMessRequests(
    page = 1,
    limit = 20,
    status?: MessStatus,
    from?: string,
    to?: string,
  ): Promise<{ data: Mess[]; total: number }> {
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (from || to) {
      where.createdAt = Between(
        from ? new Date(from) : new Date(0),
        to ? new Date(to) : new Date(),
      );
    }
    const [data, total] = await Promise.all([
      this.repository.findAll({ where, skip: (page - 1) * limit, take: limit, order: { createdAt: 'DESC' } }),
      this.repository.count({ where }),
    ]);
    return { data, total };
  }

  async getAllMesses(
    page = 1,
    limit = 20,
    status?: MessStatus,
  ): Promise<{ data: Mess[]; total: number }> {
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.repository.findAll({
        where,
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      }),
      this.repository.count({ where }),
    ]);
    return { data, total };
  }
}
