import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { AdminService } from './admin.service';
import { UpdateAdminConfigDto } from './dtos/update-admin-config.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Get platform statistics' })
  @ApiResponse({ status: 200, description: 'Platform statistics retrieved.' })
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('config')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Get platform configuration' })
  @ApiResponse({ status: 200, description: 'Platform configuration retrieved.' })
  async getConfig() {
    return this.adminService.getConfig();
  }

  @Put('config')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Update platform configuration' })
  @ApiResponse({ status: 200, description: 'Platform configuration updated.' })
  async updateConfig(@Body() dto: UpdateAdminConfigDto) {
    return this.adminService.updateConfig(dto);
  }
}
