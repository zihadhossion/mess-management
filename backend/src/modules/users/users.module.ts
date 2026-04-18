import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AdminUserController } from './admin-user.controller';
import { LoginHistory } from './login-history.entity';
import { LoginHistoryService } from './login-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, LoginHistory])],
  controllers: [UserController, AdminUserController],
  providers: [UserService, UserRepository, LoginHistoryService],
  exports: [UserService, UserRepository, LoginHistoryService],
})
export class UsersModule {}
