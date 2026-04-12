import { Controller, Get, Post, Patch, Body, Param, ParseUUIDPipe, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseController } from '../../core/base/base.controller';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { ItemAllocationService } from './item-allocation.service';
import { ItemAllocation } from './item-allocation.entity';
import { CreateItemAllocationDto, UpdateItemAllocationDto } from './dtos/create-item-allocation.dto';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Item Allocations')
@Controller('messes/:messId/item-allocations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ItemAllocationController extends BaseController<ItemAllocation, CreateItemAllocationDto, UpdateItemAllocationDto> {
  constructor(private readonly itemAllocationService: ItemAllocationService) {
    super(itemAllocationService);
  }

  @Get('member/:memberId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List allocations for a member today' })
  @ApiResponse({ status: 200, description: 'Item allocations.' })
  async listAllocForMember(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ) {
    return this.itemAllocationService.listForMember(messId, memberId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Manager] Create item allocation' })
  @ApiResponse({ status: 201, description: 'Allocation created.' })
  async createAlloc(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Body() dto: CreateItemAllocationDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.itemAllocationService.createAllocation(messId, dto, user.id, user.role);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Adjust allocation quantity' })
  @ApiResponse({ status: 200, description: 'Allocation adjusted.' })
  async updateAlloc(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateItemAllocationDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.itemAllocationService.updateAllocation(messId, id, dto, user.id, user.role);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Cancel an allocation' })
  @ApiResponse({ status: 200, description: 'Allocation cancelled.' })
  async cancelAlloc(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.itemAllocationService.cancelAllocation(messId, id, user.id, user.role);
  }
}
