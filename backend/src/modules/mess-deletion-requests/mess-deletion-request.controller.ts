import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseController } from '../../core/base/base.controller';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { MessDeletionRequestService } from './mess-deletion-request.service';
import { MessDeletionRequest } from './mess-deletion-request.entity';
import {
  CreateDeletionRequestDto,
  ProcessDeletionRequestDto,
} from './dtos/deletion-request.dto';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Mess Deletion Requests')
@Controller('messes/:messId/deletion-request')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessDeletionRequestController extends BaseController<
  MessDeletionRequest,
  CreateDeletionRequestDto,
  ProcessDeletionRequestDto
> {
  constructor(private readonly deletionService: MessDeletionRequestService) {
    super(deletionService);
  }

  @Post()
  @Roles(UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Manager] Submit mess deletion request' })
  @ApiResponse({ status: 201 })
  async createRequest(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Body() dto: CreateDeletionRequestDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.deletionService.createRequest(messId, dto, user.id);
  }
}

@ApiTags('Admin')
@Controller('admin/deletion-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminDeletionRequestController extends BaseController<
  MessDeletionRequest,
  CreateDeletionRequestDto,
  ProcessDeletionRequestDto
> {
  constructor(
    private readonly adminDeletionService: MessDeletionRequestService,
  ) {
    super(adminDeletionService);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] List all deletion requests' })
  @ApiResponse({ status: 200 })
  async listAllRequests(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminDeletionService.listForAdmin(+page, +limit);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Approve deletion request' })
  @ApiResponse({ status: 200 })
  async approveRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ProcessDeletionRequestDto,
  ) {
    return this.adminDeletionService.approveRequest(id, dto);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Reject deletion request' })
  @ApiResponse({ status: 200 })
  async rejectRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ProcessDeletionRequestDto,
  ) {
    return this.adminDeletionService.rejectRequest(id, dto);
  }
}
