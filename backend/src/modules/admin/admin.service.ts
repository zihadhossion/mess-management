import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { IsNull } from 'typeorm';
import { User } from '../users/user.entity';
import { Mess } from '../messes/mess.entity';
import { MessMember } from '../mess-members/mess-member.entity';
import { JoinRequest } from '../join-requests/join-request.entity';
import { MessDeletionRequest } from '../mess-deletion-requests/mess-deletion-request.entity';
import { AdminConfig } from './admin-config.entity';
import { EmailTemplate } from './email-template.entity';
import { UpdateAdminConfigDto } from './dtos/update-admin-config.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { MessStatus } from '../../common/enums/mess-status.enum';
import { JoinRequestStatus } from '../../common/enums/join-request-status.enum';
import { DeletionRequestStatus } from '../../common/enums/deletion-request-status.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Mess)
    private readonly messRepo: Repository<Mess>,
    @InjectRepository(MessMember)
    private readonly messMemberRepo: Repository<MessMember>,
    @InjectRepository(JoinRequest)
    private readonly joinRequestRepo: Repository<JoinRequest>,
    @InjectRepository(MessDeletionRequest)
    private readonly deletionRequestRepo: Repository<MessDeletionRequest>,
    @InjectRepository(AdminConfig)
    private readonly adminConfigRepo: Repository<AdminConfig>,
    @InjectRepository(EmailTemplate)
    private readonly emailTemplateRepo: Repository<EmailTemplate>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getConfig(): Promise<AdminConfig> {
    let config = await this.adminConfigRepo.findOne({ where: {} });
    if (!config) {
      config = this.adminConfigRepo.create();
      await this.adminConfigRepo.save(config);
    }
    return config;
  }

  async updateConfig(dto: UpdateAdminConfigDto): Promise<AdminConfig> {
    const config = await this.getConfig();
    Object.assign(config, dto);
    return this.adminConfigRepo.save(config);
  }

  async getCurrencies(): Promise<string[]> {
    const config = await this.getConfig();
    return (config as any).supportedCurrencies ?? ['BDT', 'USD'];
  }

  async updateCurrencies(currencies: string[]): Promise<string[]> {
    const config = await this.getConfig();
    (config as any).supportedCurrencies = currencies;
    await this.adminConfigRepo.save(config);
    return currencies;
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return this.emailTemplateRepo.find({ order: { name: 'ASC' } });
  }

  async updateEmailTemplate(
    id: string,
    dto: { subject: string; body: string },
  ): Promise<EmailTemplate> {
    const template = await this.emailTemplateRepo.findOne({ where: { id } });
    if (!template) {
      const created = this.emailTemplateRepo.create({ id, ...dto, name: id });
      return this.emailTemplateRepo.save(created);
    }
    Object.assign(template, dto);
    return this.emailTemplateRepo.save(template);
  }

  async getStats() {
    const softDeleteFilter = { deletedAt: IsNull() };

    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      bannedUsers,
      adminUsers,
      managerUsers,
      memberUsers,
      totalMesses,
      activeMesses,
      pendingMesses,
      inactiveMesses,
      rejectedMesses,
      totalMembers,
      pendingJoinRequests,
      pendingDeletionRequests,
    ] = await Promise.all([
      this.userRepo.count({ where: softDeleteFilter }),
      this.userRepo.count({ where: { ...softDeleteFilter, isActive: true } }),
      this.userRepo.count({ where: { ...softDeleteFilter, isSuspended: true } }),
      this.userRepo.count({ where: { ...softDeleteFilter, isBanned: true } }),
      this.userRepo.count({ where: { ...softDeleteFilter, role: UserRole.ADMIN } }),
      this.userRepo.count({ where: { ...softDeleteFilter, role: UserRole.MANAGER } }),
      this.userRepo.count({ where: { ...softDeleteFilter, role: UserRole.MEMBER } }),
      this.messRepo.count({ where: softDeleteFilter }),
      this.messRepo.count({ where: { ...softDeleteFilter, status: MessStatus.ACTIVE } }),
      this.messRepo.count({ where: { ...softDeleteFilter, status: MessStatus.PENDING_APPROVAL } }),
      this.messRepo.count({ where: { ...softDeleteFilter, status: MessStatus.INACTIVE } }),
      this.messRepo.count({ where: { ...softDeleteFilter, status: MessStatus.REJECTED } }),
      this.messMemberRepo.count({ where: { ...softDeleteFilter, isActive: true } }),
      this.joinRequestRepo.count({ where: { ...softDeleteFilter, status: JoinRequestStatus.PENDING } }),
      this.deletionRequestRepo.count({ where: { ...softDeleteFilter, status: DeletionRequestStatus.PENDING } }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        banned: bannedUsers,
        byRole: {
          admin: adminUsers,
          manager: managerUsers,
          member: memberUsers,
        },
      },
      messes: {
        total: totalMesses,
        active: activeMesses,
        pending: pendingMesses,
        inactive: inactiveMesses,
        rejected: rejectedMesses,
      },
      members: {
        total: totalMembers,
      },
      pendingJoinRequests,
      pendingDeletionRequests,
    };
  }

  private parsePeriodStart(period: string): Date {
    const now = new Date();
    switch (period) {
      case '7d': return new Date(now.getTime() - 7 * 86400000);
      case '3m': return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      case '1y': return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      default: return new Date(now.getTime() - 30 * 86400000); // 30d
    }
  }

  async getUserGrowth(period = '30d'): Promise<{ date: string; count: number }[]> {
    const start = this.parsePeriodStart(period);
    const rows: { date: string; count: string }[] = await this.userRepo
      .createQueryBuilder('u')
      .select("DATE(u.created_at)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('u.created_at >= :start', { start })
      .groupBy('DATE(u.created_at)')
      .orderBy('date', 'ASC')
      .getRawMany();
    return rows.map((r) => ({ date: r.date, count: Number(r.count) }));
  }

  async getMessTrend(period = '30d'): Promise<{ date: string; count: number }[]> {
    const start = this.parsePeriodStart(period);
    const rows: { date: string; count: string }[] = await this.messRepo
      .createQueryBuilder('m')
      .select("DATE(m.created_at)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('m.created_at >= :start', { start })
      .groupBy('DATE(m.created_at)')
      .orderBy('date', 'ASC')
      .getRawMany();
    return rows.map((r) => ({ date: r.date, count: Number(r.count) }));
  }

  async getRecentActivity(): Promise<{ type: string; id: string; description: string; createdAt: Date }[]> {
    const [users, messes, joinReqs, delReqs] = await Promise.all([
      this.userRepo.find({ order: { createdAt: 'DESC' }, take: 5 }),
      this.messRepo.find({ order: { createdAt: 'DESC' }, take: 5 }),
      this.joinRequestRepo.find({ order: { createdAt: 'DESC' }, take: 5 }),
      this.deletionRequestRepo.find({ order: { createdAt: 'DESC' }, take: 5 }),
    ]);
    const items = [
      ...users.map((u) => ({ type: 'user_registered', id: u.id, description: `New user: ${(u as any).email ?? u.id}`, createdAt: u.createdAt })),
      ...messes.map((m) => ({ type: 'mess_created', id: m.id, description: `Mess created: ${(m as any).name ?? m.id}`, createdAt: m.createdAt })),
      ...joinReqs.map((j) => ({ type: 'join_request', id: j.id, description: `Join request submitted`, createdAt: j.createdAt })),
      ...delReqs.map((d) => ({ type: 'deletion_request', id: d.id, description: `Deletion request submitted`, createdAt: d.createdAt })),
    ];
    return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 20);
  }

  async generateReport(params: { type: string; from: string; to: string; [k: string]: string }): Promise<{ columns: string[]; rows: Record<string, unknown>[] }> {
    const from = new Date(params.from);
    const to = new Date(params.to);

    if (params.type === 'messes') {
      const rows = await this.messRepo.createQueryBuilder('m')
        .where('m.created_at BETWEEN :from AND :to', { from, to })
        .orderBy('m.created_at', 'DESC')
        .getMany();
      return {
        columns: ['id', 'name', 'status', 'managerId', 'createdAt'],
        rows: rows.map((m) => ({ id: m.id, name: (m as any).name, status: (m as any).status, managerId: (m as any).managerId, createdAt: m.createdAt })),
      };
    }

    if (params.type === 'activity') {
      const rows = await this.joinRequestRepo.createQueryBuilder('j')
        .where('j.created_at BETWEEN :from AND :to', { from, to })
        .orderBy('j.created_at', 'DESC')
        .getMany();
      return {
        columns: ['id', 'messId', 'userId', 'status', 'createdAt'],
        rows: rows.map((j) => ({ id: j.id, messId: (j as any).messId, userId: (j as any).userId, status: (j as any).status, createdAt: j.createdAt })),
      };
    }

    // default: users report
    const rows = await this.userRepo.createQueryBuilder('u')
      .where('u.created_at BETWEEN :from AND :to', { from, to })
      .orderBy('u.created_at', 'DESC')
      .getMany();
    return {
      columns: ['id', 'fullName', 'email', 'role', 'createdAt'],
      rows: rows.map((u) => ({ id: u.id, fullName: u.fullName, email: u.email, role: u.role, createdAt: u.createdAt })),
    };
  }

  async mergeAccounts(sourceId: string, targetId: string): Promise<{ message: string }> {
    await Promise.all([
      this.userRepo.findOneOrFail({ where: { id: sourceId } }),
      this.userRepo.findOneOrFail({ where: { id: targetId } }),
    ]);
    await this.dataSource.transaction(async (em) => {
      await em.query(`UPDATE mess_members SET user_id = $1 WHERE user_id = $2`, [targetId, sourceId]);
      await em.query(`UPDATE join_requests SET user_id = $1 WHERE user_id = $2`, [targetId, sourceId]);
      await em.query(`UPDATE notifications SET user_id = $1 WHERE user_id = $2`, [targetId, sourceId]);
      await em.query(`UPDATE users SET deleted_at = NOW() WHERE id = $1`, [sourceId]);
    });
    return { message: 'Accounts merged successfully.' };
  }
}
