import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BaseService } from '../../core/base/base.service';
import { MessDeletionRequest } from './mess-deletion-request.entity';
import { MessDeletionRequestRepository } from './mess-deletion-request.repository';
import { MessRepository } from '../messes/mess.repository';
import { DeletionRequestStatus } from '../../common/enums/deletion-request-status.enum';
import { MessStatus } from '../../common/enums/mess-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateDeletionRequestDto, ProcessDeletionRequestDto } from './dtos/deletion-request.dto';

@Injectable()
export class MessDeletionRequestService extends BaseService<MessDeletionRequest> {
  constructor(
    protected readonly repository: MessDeletionRequestRepository,
    private readonly messRepository: MessRepository,
  ) {
    super(repository, 'MessDeletionRequest');
  }

  async createRequest(messId: string, dto: CreateDeletionRequestDto, managerId: string): Promise<MessDeletionRequest> {
    const mess = await this.messRepository.findById(messId);
    if (!mess) throw new NotFoundException('Mess not found!');
    if (mess.managerId !== managerId) throw new ForbiddenException('You are not the manager of this mess!');

    const existing = await this.repository.findOne({
      where: { messId, status: DeletionRequestStatus.PENDING },
    });
    if (existing) throw new BadRequestException('A deletion request is already pending for this mess!');

    return this.repository.create({
      messId,
      managerId,
      reason: dto.reason,
      status: DeletionRequestStatus.PENDING,
    });
  }

  async approveRequest(id: string, dto: ProcessDeletionRequestDto): Promise<MessDeletionRequest> {
    const req = await this.findByIdOrFail(id);
    if (req.status !== DeletionRequestStatus.PENDING) throw new BadRequestException('Request is no longer pending!');

    await this.messRepository.update(req.messId, { status: MessStatus.INACTIVE });
    await this.repository.update(id, {
      status: DeletionRequestStatus.APPROVED,
      adminNotes: dto.adminNotes || null,
      processedAt: new Date(),
    });

    return this.findByIdOrFail(id);
  }

  async rejectRequest(id: string, dto: ProcessDeletionRequestDto): Promise<MessDeletionRequest> {
    const req = await this.findByIdOrFail(id);
    if (req.status !== DeletionRequestStatus.PENDING) throw new BadRequestException('Request is no longer pending!');

    await this.repository.update(id, {
      status: DeletionRequestStatus.REJECTED,
      adminNotes: dto.adminNotes || null,
      processedAt: new Date(),
    });

    return this.findByIdOrFail(id);
  }

  async listForAdmin(page = 1, limit = 20): Promise<{ data: MessDeletionRequest[]; total: number }> {
    const [data, total] = await this.repository.findAllForAdmin(page, limit);
    return { data, total };
  }

  async listForMess(messId: string): Promise<MessDeletionRequest[]> {
    return this.repository.findByMess(messId);
  }
}
