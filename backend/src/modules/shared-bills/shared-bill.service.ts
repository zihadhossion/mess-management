import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BaseService } from '../../core/base/base.service';
import { SharedBillCategory } from './shared-bill-category.entity';
import {
  SharedBillCategoryRepository,
  SharedBillEntryRepository,
  SharedBillInvoiceRepository,
  SharedBillPaymentRepository,
} from './shared-bill.repository';
import { MessMemberRepository } from '../mess-members/mess-member.repository';
import { MessRepository } from '../messes/mess.repository';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { SharedBillInvoiceStatus } from '../../common/enums/shared-bill-invoice-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import {
  CreateSharedBillCategoryDto,
  UpdateSharedBillCategoryDto,
  CreateSharedBillEntryDto,
  UpdateSharedBillEntryDto,
  RecordSharedBillPaymentDto,
} from './dtos/shared-bill.dto';
import { SharedBillEntry } from './shared-bill-entry.entity';
import { SharedBillInvoice } from './shared-bill-invoice.entity';

@Injectable()
export class SharedBillService extends BaseService<SharedBillCategory> {
  constructor(
    protected readonly repository: SharedBillCategoryRepository,
    private readonly entryRepository: SharedBillEntryRepository,
    private readonly invoiceRepository: SharedBillInvoiceRepository,
    private readonly paymentRepository: SharedBillPaymentRepository,
    private readonly messMemberRepository: MessMemberRepository,
    private readonly messRepository: MessRepository,
  ) {
    super(repository, 'SharedBillCategory');
  }

  // Categories
  async createCategory(messId: string, dto: CreateSharedBillCategoryDto, userId: string, userRole: UserRole): Promise<SharedBillCategory> {
    await this.assertManagerAccess(messId, userId, userRole);
    return this.repository.create({ ...dto, messId });
  }

  async updateCategory(messId: string, id: string, dto: UpdateSharedBillCategoryDto, userId: string, userRole: UserRole): Promise<SharedBillCategory> {
    await this.assertManagerAccess(messId, userId, userRole);
    const cat = await this.findByIdOrFail(id);
    if (cat.messId !== messId) throw new NotFoundException('Category not found in this mess!');
    return this.repository.update(id, dto) as Promise<SharedBillCategory>;
  }

  async deleteCategory(messId: string, id: string, userId: string, userRole: UserRole): Promise<void> {
    await this.assertManagerAccess(messId, userId, userRole);
    const cat = await this.findByIdOrFail(id);
    if (cat.messId !== messId) throw new NotFoundException('Category not found in this mess!');
    await this.repository.softDelete(id);
  }

  async listCategories(messId: string): Promise<SharedBillCategory[]> {
    return this.repository.findByMess(messId);
  }

  async toggleCategory(messId: string, id: string, userId: string, userRole: UserRole): Promise<SharedBillCategory> {
    await this.assertManagerAccess(messId, userId, userRole);
    const cat = await this.findByIdOrFail(id);
    if (cat.messId !== messId) throw new NotFoundException('Category not found in this mess!');
    return this.repository.update(id, { isActive: !cat.isActive }) as Promise<SharedBillCategory>;
  }

  // Entries
  async createEntry(messId: string, dto: CreateSharedBillEntryDto, userId: string, userRole: UserRole): Promise<SharedBillEntry> {
    await this.assertManagerAccess(messId, userId, userRole);
    return this.entryRepository.create({ ...dto, messId, entryDate: new Date(dto.entryDate) });
  }

  async updateEntry(messId: string, id: string, dto: UpdateSharedBillEntryDto, userId: string, userRole: UserRole): Promise<SharedBillEntry> {
    await this.assertManagerAccess(messId, userId, userRole);
    const entry = await this.entryRepository.findById(id);
    if (!entry || entry.messId !== messId) throw new NotFoundException('Entry not found in this mess!');
    return this.entryRepository.update(id, dto) as Promise<SharedBillEntry>;
  }

  async deleteEntry(messId: string, id: string, userId: string, userRole: UserRole): Promise<void> {
    await this.assertManagerAccess(messId, userId, userRole);
    const entry = await this.entryRepository.findById(id);
    if (!entry || entry.messId !== messId) throw new NotFoundException('Entry not found in this mess!');
    await this.entryRepository.softDelete(id);
  }

  async listEntries(messId: string, month: number, year: number): Promise<SharedBillEntry[]> {
    return this.entryRepository.findByMessAndMonth(messId, month, year);
  }

  // Finalization: divide total equally among active participating members
  async finalize(messId: string, month: number, year: number, userId: string, userRole: UserRole): Promise<SharedBillInvoice[]> {
    await this.assertManagerAccess(messId, userId, userRole);

    const totalAmount = await this.entryRepository.sumByMessAndMonth(messId, month, year);
    if (totalAmount === 0) {
      throw new BadRequestException('No shared bill entries found for this month!');
    }

    const activeParticipating = await this.messMemberRepository.findActiveParticipatingMembers(messId);
    const activeMemberCount = activeParticipating.length;

    if (activeMemberCount === 0) {
      throw new BadRequestException('No active participating members found!');
    }

    const sharePerMember = Math.round((totalAmount / activeMemberCount) * 100) / 100;

    const invoices: SharedBillInvoice[] = [];
    for (const member of activeParticipating) {
      const existing = await this.invoiceRepository.findOne({
        where: { messId, messMemberId: member.id, month, year },
      });
      if (!existing) {
        const invoice = await this.invoiceRepository.create({
          messId,
          messMemberId: member.id,
          month,
          year,
          totalShare: sharePerMember,
          activeMemberCount,
          paymentStatus: PaymentStatus.UNPAID,
          status: SharedBillInvoiceStatus.FINALIZED,
        });
        invoices.push(invoice);
      }
    }

    return invoices;
  }

  async listInvoices(messId: string, month: number, year: number): Promise<SharedBillInvoice[]> {
    return this.invoiceRepository.findByMessAndMonth(messId, month, year);
  }

  async getInvoice(invoiceId: string): Promise<SharedBillInvoice> {
    const invoice = await this.invoiceRepository.findById(invoiceId, {
      messMember: true,
      payments: true,
    } as Record<string, boolean>);
    if (!invoice) throw new NotFoundException('Shared bill invoice not found!');
    return invoice;
  }

  async recordPayment(invoiceId: string, dto: RecordSharedBillPaymentDto, recordedById: string): Promise<void> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) throw new NotFoundException('Shared bill invoice not found!');

    await this.paymentRepository.create({
      sharedBillInvoiceId: invoiceId,
      amount: dto.amount,
      method: dto.method,
      paymentDate: new Date(dto.paymentDate),
      referenceNote: dto.referenceNote || null,
      recordedById,
    });

    await this.invoiceRepository.update(invoiceId, { paymentStatus: PaymentStatus.PAID });
  }

  private async assertManagerAccess(messId: string, userId: string, userRole: UserRole): Promise<void> {
    if (userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) return;
    const mess = await this.messRepository.findById(messId);
    if (!mess) throw new NotFoundException('Mess not found!');
    if (mess.managerId !== userId) throw new ForbiddenException('Manager access required!');
  }
}
