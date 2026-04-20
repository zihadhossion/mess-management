import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { JoinRequest } from './join-request.entity';
import { JoinRequestRepository } from './join-request.repository';
import { JoinRequestService } from './join-request.service';
import {
  JoinRequestController,
  AdminJoinRequestController,
} from './join-request.controller';
import { MessMembersModule } from '../mess-members/mess-members.module';
import { MessesModule } from '../messes/messes.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JoinRequest]),
    ScheduleModule.forRoot(),
    MessMembersModule,
    MessesModule,
    AdminModule,
  ],
  controllers: [JoinRequestController, AdminJoinRequestController],
  providers: [JoinRequestService, JoinRequestRepository],
  exports: [JoinRequestService],
})
export class JoinRequestsModule {}
