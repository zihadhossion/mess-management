import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcurementRequest } from './procurement-request.entity';
import { ProcurementStatus } from './enums/procurement-status.enum';

@Injectable()
export class ProcurementRequestService {
  constructor(
    @InjectRepository(ProcurementRequest)
    private readonly repo: Repository<ProcurementRequest>,
  ) {}

  async getAll(params: { status?: string; messId?: string }): Promise<{ data: ProcurementRequest[]; total: number }> {
    const where: Record<string, unknown> = {};
    if (params.status) where.status = params.status;
    if (params.messId) where.messId = params.messId;
    const [data, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
    });
    return { data, total };
  }

  async approve(id: string, reviewedById: string): Promise<ProcurementRequest> {
    const req = await this.repo.findOne({ where: { id } });
    if (!req) throw new NotFoundException(`ProcurementRequest ${id} not found`);
    req.status = ProcurementStatus.APPROVED;
    req.reviewedById = reviewedById;
    return this.repo.save(req);
  }

  async reject(id: string, reviewedById: string, notes?: string): Promise<ProcurementRequest> {
    const req = await this.repo.findOne({ where: { id } });
    if (!req) throw new NotFoundException(`ProcurementRequest ${id} not found`);
    req.status = ProcurementStatus.REJECTED;
    req.reviewedById = reviewedById;
    req.reviewNote = notes ?? null;
    return this.repo.save(req);
  }
}
