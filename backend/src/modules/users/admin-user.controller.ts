import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { UserService } from './user.service';
import { LoginHistoryService } from './login-history.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Admin - Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUserController {
  constructor(
    private readonly userService: UserService,
    private readonly loginHistoryService: LoginHistoryService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Admin] Create a new user' })
  @ApiResponse({ status: 201, description: 'User created.' })
  async createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Activate a user' })
  @ApiResponse({ status: 200, description: 'User activated.' })
  async activateUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.adminUpdateUser(id, {
      isActive: true,
      isSuspended: false,
    } as any);
  }

  @Post(':id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Suspend a user' })
  @ApiResponse({ status: 200, description: 'User suspended.' })
  async suspendUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.adminUpdateUser(id, { isSuspended: true } as any);
  }

  @Post(':id/ban')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Ban a user' })
  @ApiResponse({ status: 200, description: 'User banned.' })
  async banUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.adminUpdateUser(id, {
      isBanned: true,
      isActive: false,
    } as any);
  }

  @Post(':id/verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Force-verify email for a user' })
  @ApiResponse({ status: 200, description: 'Email verified.' })
  async verifyEmail(@Param('id', ParseUUIDPipe) id: string) {
    await this.userService.markEmailVerified(id);
    return { message: 'Email verified successfully.' };
  }

  @Get(':id/login-history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Get login history for a user' })
  @ApiResponse({ status: 200, description: 'Login history.' })
  async getLoginHistory(@Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.loginHistoryService.getByUserId(id) };
  }

}

