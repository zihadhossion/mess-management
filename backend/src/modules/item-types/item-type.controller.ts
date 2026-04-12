import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseController } from '../../core/base/base.controller';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { ItemTypeService } from './item-type.service';
import { ItemType } from './item-type.entity';
import { CreateItemTypeDto, UpdateItemTypeDto } from './dtos/create-item-type.dto';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Item Types')
@Controller('messes/:messId/item-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ItemTypeController extends BaseController<ItemType, CreateItemTypeDto, UpdateItemTypeDto> {
  constructor(private readonly itemTypeService: ItemTypeService) {
    super(itemTypeService);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List item types for a mess' })
  @ApiResponse({ status: 200, description: 'List of item types.' })
  async listItems(@Param('messId', ParseUUIDPipe) messId: string) {
    return this.itemTypeService.listByMess(messId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Manager] Create item type' })
  @ApiResponse({ status: 201, description: 'Item type created.' })
  async createItem(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Body() dto: CreateItemTypeDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.itemTypeService.createItemType(messId, dto, user.id, user.role);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Update item type' })
  @ApiResponse({ status: 200, description: 'Item type updated.' })
  async updateItem(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateItemTypeDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.itemTypeService.updateItemType(messId, id, dto, user.id, user.role);
  }

  @Post(':id/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Toggle item type active/inactive' })
  @ApiResponse({ status: 200, description: 'Item type toggled.' })
  async toggleItem(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.itemTypeService.toggleActive(messId, id, user.id, user.role);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Delete item type' })
  @ApiResponse({ status: 200, description: 'Item type deleted.' })
  async removeItem(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.itemTypeService.removeItemType(messId, id, user.id, user.role);
  }
}
