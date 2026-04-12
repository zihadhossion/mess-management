import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './feedback.entity';
import { FeedbackRepository } from './feedback.repository';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { MessMembersModule } from '../mess-members/mess-members.module';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback]), MessMembersModule],
  controllers: [FeedbackController],
  providers: [FeedbackService, FeedbackRepository],
  exports: [FeedbackService],
})
export class FeedbackModule {}
