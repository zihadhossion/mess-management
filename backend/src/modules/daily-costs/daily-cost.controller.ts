import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { DailyCostService } from './daily-cost.service';
import {
  CreateDailyCostDto,
  UpdateDailyCostDto,
} from './dtos/create-daily-cost.dto';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Daily Costs')
@Controller('messes/:messId/daily-costs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DailyCostController {
  constructor(private readonly dailyCostService: DailyCostService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List daily costs by month' })
  @ApiQuery({ name: 'month', required: true, type: Number })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Daily costs.' })
  async list(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.dailyCostService.listByMonth(messId, +month, +year);
  }

  @Get('summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get monthly cost summary' })
  @ApiQuery({ name: 'month', required: true, type: Number })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Monthly summary.' })
  async summary(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.dailyCostService.getMonthlySummary(messId, +month, +year);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Manager] Create a daily cost entry' })
  @ApiResponse({ status: 201, description: 'Daily cost created.' })
  async createCost(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Body() dto: CreateDailyCostDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.dailyCostService.createCost(messId, dto, user.id, user.role);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Update a daily cost entry' })
  @ApiResponse({ status: 200, description: 'Daily cost updated.' })
  async updateCost(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDailyCostDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.dailyCostService.updateCost(
      messId,
      id,
      dto,
      user.id,
      user.role,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Delete a daily cost entry' })
  @ApiResponse({ status: 200, description: 'Daily cost deleted.' })
  async removeCost(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.dailyCostService.removeCost(messId, id, user.id, user.role);
  }
}
