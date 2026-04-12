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
import { BaseController } from '../../core/base/base.controller';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { MealSlotService } from './meal-slot.service';
import { MealSlot } from './meal-slot.entity';
import {
  CreateMealSlotDto,
  UpdateMealSlotDto,
} from './dtos/create-meal-slot.dto';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Meal Slots')
@Controller('messes/:messId/meal-slots')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MealSlotController extends BaseController<
  MealSlot,
  CreateMealSlotDto,
  UpdateMealSlotDto
> {
  constructor(private readonly mealSlotService: MealSlotService) {
    super(mealSlotService);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List meal slots for a mess' })
  @ApiQuery({ name: 'date', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of meal slots.' })
  async listSlots(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Query('date') date?: string,
  ) {
    return this.mealSlotService.listForMess(messId, date);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Manager] Create a meal slot' })
  @ApiResponse({ status: 201, description: 'Meal slot created.' })
  async createSlot(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Body() dto: CreateMealSlotDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.mealSlotService.createSlot(messId, dto, user.id, user.role);
  }

  @Patch(':slotId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Update a draft meal slot' })
  @ApiResponse({ status: 200, description: 'Meal slot updated.' })
  async updateSlot(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('slotId', ParseUUIDPipe) slotId: string,
    @Body() dto: UpdateMealSlotDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.mealSlotService.updateSlot(
      messId,
      slotId,
      dto,
      user.id,
      user.role,
    );
  }

  @Post(':slotId/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[Manager] Publish a meal slot (auto-books active members)',
  })
  @ApiResponse({
    status: 200,
    description: 'Meal slot published and members booked.',
  })
  async publishSlot(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('slotId', ParseUUIDPipe) slotId: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.mealSlotService.publishSlot(messId, slotId, user.id, user.role);
  }

  @Delete(':slotId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Delete a draft meal slot' })
  @ApiResponse({ status: 200, description: 'Meal slot deleted.' })
  async removeSlot(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('slotId', ParseUUIDPipe) slotId: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.mealSlotService.deleteSlot(messId, slotId, user.id, user.role);
  }
}
