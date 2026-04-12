import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BaseService } from '../../core/base/base.service';
import { Feedback } from './feedback.entity';
import { FeedbackRepository } from './feedback.repository';
import { MessMemberRepository } from '../mess-members/mess-member.repository';
import { FeedbackStatus } from '../../common/enums/feedback-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateFeedbackDto, ResolveFeedbackDto } from './dtos/create-feedback.dto';

@Injectable()
export class FeedbackService extends BaseService<Feedback> {
  constructor(
    protected readonly repository: FeedbackRepository,
    private readonly messMemberRepository: MessMemberRepository,
  ) {
    super(repository, 'Feedback');
  }

  async submitFeedback(messId: string, dto: CreateFeedbackDto, userId: string): Promise<Feedback> {
    const member = await this.messMemberRepository.findByMessAndUser(messId, userId);
    if (!member || !member.isActive) throw new ForbiddenException('You are not an active member of this mess!');

    return this.repository.create({
      messMemberId: member.id,
      mealSlotId: dto.mealSlotId || null,
      date: new Date(dto.date),
      complaint: dto.complaint,
      status: FeedbackStatus.OPEN,
    });
  }

  async listFeedback(messId: string, userId: string, userRole: UserRole): Promise<Feedback[]> {
    if (userRole === UserRole.MANAGER || userRole === UserRole.ADMIN) {
      return this.repository.findByMess(messId);
    }
    const member = await this.messMemberRepository.findByMessAndUser(messId, userId);
    if (!member) throw new ForbiddenException('Not a member of this mess!');
    return this.repository.findByMember(member.id);
  }

  async resolveFeedback(messId: string, feedbackId: string, dto: ResolveFeedbackDto, userId: string, userRole: UserRole): Promise<Feedback> {
    if (userRole !== UserRole.MANAGER && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only managers can resolve feedback!');
    }
    const feedback = await this.findByIdOrFail(feedbackId);
    return this.repository.update(feedbackId, {
      status: FeedbackStatus.RESOLVED,
      resolutionNotes: dto.resolutionNotes || null,
      resolvedAt: new Date(),
    }) as Promise<Feedback>;
  }
}
