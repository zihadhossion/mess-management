import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Mess } from '../messes/mess.entity';
import { MessMember } from '../mess-members/mess-member.entity';
import { JoinRequest } from '../join-requests/join-request.entity';
import { MessDeletionRequest } from '../mess-deletion-requests/mess-deletion-request.entity';
import { AdminConfig } from './admin-config.entity';
import { EmailTemplate } from './email-template.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Mess,
      MessMember,
      JoinRequest,
      MessDeletionRequest,
      AdminConfig,
      EmailTemplate,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
