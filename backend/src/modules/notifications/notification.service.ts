import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/base/base.service';
import { Notification } from './notification.entity';
import { NotificationRepository } from './notification.repository';

@Injectable()
export class NotificationService extends BaseService<Notification> {
  constructor(protected readonly repository: NotificationRepository) {
    super(repository, 'Notification');
  }

  async listForUser(userId: string, page = 1, limit = 20): Promise<{ data: Notification[]; total: number }> {
    const [data, total] = await this.repository.findByUser(userId, page, limit);
    return { data, total };
  }

  async markRead(id: string): Promise<Notification> {
    const notif = await this.findByIdOrFail(id);
    return this.repository.update(id, { isRead: true }) as Promise<Notification>;
  }

  async markAllRead(userId: string): Promise<void> {
    await this.repository.markAllRead(userId);
  }

  async createNotification(userId: string, type: string, title: string, body: string, data?: Record<string, unknown>): Promise<Notification> {
    return this.repository.create({ userId, type, title, body, data: data || null, isRead: false });
  }
}
