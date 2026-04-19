import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessMember } from './mess-member.entity';
import { MessMemberRepository } from './mess-member.repository';
import { MessMemberService } from './mess-member.service';
import { MessMemberController } from './mess-member.controller';
import { UsersModule } from '../users/users.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [TypeOrmModule.forFeature([MessMember]), UsersModule, AdminModule],
  controllers: [MessMemberController],
  providers: [MessMemberService, MessMemberRepository],
  exports: [MessMemberService, MessMemberRepository],
})
export class MessMembersModule {}
