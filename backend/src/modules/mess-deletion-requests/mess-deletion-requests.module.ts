import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessDeletionRequest } from './mess-deletion-request.entity';
import { MessDeletionRequestRepository } from './mess-deletion-request.repository';
import { MessDeletionRequestService } from './mess-deletion-request.service';
import { MessDeletionRequestController, AdminDeletionRequestController } from './mess-deletion-request.controller';
import { MessesModule } from '../messes/messes.module';

@Module({
  imports: [TypeOrmModule.forFeature([MessDeletionRequest]), MessesModule],
  controllers: [MessDeletionRequestController, AdminDeletionRequestController],
  providers: [MessDeletionRequestService, MessDeletionRequestRepository],
  exports: [MessDeletionRequestService],
})
export class MessDeletionRequestsModule {}
