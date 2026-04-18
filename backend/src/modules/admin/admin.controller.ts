import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
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

  @Get('stats/user-growth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Get user registration trend' })
  @ApiQuery({ name: 'period', required: false, enum: ['7d', '30d', '3m', '1y'] })
  async getUserGrowth(@Query('period') period = '30d') {
    return { data: await this.adminService.getUserGrowth(period) };
  }

  @Get('stats/mess-trend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Get mess creation trend' })
  @ApiQuery({ name: 'period', required: false, enum: ['7d', '30d', '3m', '1y'] })
  async getMessTrend(@Query('period') period = '30d') {
    return { data: await this.adminService.getMessTrend(period) };
  }

  @Get('recent-activity')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Get recent platform activity' })
  async getRecentActivity() {
    return { data: await this.adminService.getRecentActivity() };
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

  @Get('currencies')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Get supported currencies' })
  async getCurrencies() {
    return { data: await this.adminService.getCurrencies() };
  }

  @Put('currencies')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Update supported currencies' })
  async updateCurrencies(@Body() body: { currencies: string[] }) {
    return { data: await this.adminService.updateCurrencies(body.currencies) };
  }

  @Get('email-templates')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] List email templates' })
  async getEmailTemplates() {
    return { data: await this.adminService.getEmailTemplates() };
  }

  @Put('email-templates/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Update an email template' })
  async updateEmailTemplate(
    @Param('id') id: string,
    @Body() body: { subject: string; body: string },
  ) {
    return { data: await this.adminService.updateEmailTemplate(id, body) };
  }

  @Get('reports')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Generate a report' })
  @ApiQuery({ name: 'type', required: true })
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  async generateReport(@Query() params: { type: string; from: string; to: string; [k: string]: string }) {
    return { data: await this.adminService.generateReport(params) };
  }

  @Post('users/:id/merge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Merge duplicate account (sourceId) into target user (:id)' })
  async mergeAccounts(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { duplicateId: string },
  ) {
    return this.adminService.mergeAccounts(body.duplicateId, id);
  }
}
