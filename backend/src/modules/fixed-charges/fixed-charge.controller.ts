import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseController } from '../../core/base/base.controller';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { FixedChargeService } from './fixed-charge.service';
import { FixedCharge } from './fixed-charge.entity';
import { CreateFixedChargeDto, UpdateFixedChargeDto } from './dtos/create-fixed-charge.dto';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Fixed Charges')
@Controller('messes/:messId/fixed-charges')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FixedChargeController extends BaseController<FixedCharge, CreateFixedChargeDto, UpdateFixedChargeDto> {
  constructor(private readonly fixedChargeService: FixedChargeService) {
    super(fixedChargeService);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List fixed charges for a mess' })
  @ApiResponse({ status: 200, description: 'List of fixed charges.' })
  async list(@Param('messId', ParseUUIDPipe) messId: string) {
    return this.fixedChargeService.listByMess(messId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Manager] Create fixed charge' })
  @ApiResponse({ status: 201, description: 'Fixed charge created.' })
  async createCharge(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Body() dto: CreateFixedChargeDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.fixedChargeService.createCharge(messId, dto, user.id, user.role);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Update fixed charge' })
  @ApiResponse({ status: 200, description: 'Fixed charge updated.' })
  async updateCharge(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFixedChargeDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.fixedChargeService.updateCharge(messId, id, dto, user.id, user.role);
  }

  @Post(':id/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Toggle active/inactive' })
  @ApiResponse({ status: 200, description: 'Fixed charge toggled.' })
  async toggleCharge(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.fixedChargeService.toggleActive(messId, id, user.id, user.role);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Delete fixed charge' })
  @ApiResponse({ status: 200, description: 'Fixed charge deleted.' })
  async removeCharge(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.fixedChargeService.removeCharge(messId, id, user.id, user.role);
  }
}
