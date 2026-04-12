import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { JoinRequestService } from './join-request.service';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Join Requests')
@Controller('messes/:messId/join-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JoinRequestController {
  constructor(private readonly joinRequestService: JoinRequestService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Member] Submit a join request for a mess' })
  @ApiResponse({ status: 201, description: 'Join request submitted.' })
  async submitRequest(
    @Param('messId', ParseUUIDPipe) messId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.joinRequestService.submitRequest(messId, user.id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] List join requests for a mess' })
  @ApiResponse({ status: 200, description: 'List of join requests.' })
  async listRequests(
    @Param('messId', ParseUUIDPipe) messId: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.joinRequestService.listForMess(messId, user.id, user.role);
  }

  @Post(':requestId/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Approve a join request' })
  @ApiResponse({ status: 200, description: 'Join request approved.' })
  async approveRequest(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.joinRequestService.approveRequest(
      messId,
      requestId,
      user.id,
      user.role,
    );
  }

  @Post(':requestId/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Reject a join request' })
  @ApiResponse({ status: 200, description: 'Join request rejected.' })
  async rejectRequest(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.joinRequestService.rejectRequest(
      messId,
      requestId,
      user.id,
      user.role,
    );
  }
}

@ApiTags('Admin')
@Controller('admin/join-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminJoinRequestController {
  constructor(private readonly joinRequestService: JoinRequestService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] List all join requests platform-wide' })
  @ApiResponse({ status: 200, description: 'All join requests.' })
  async listAllRequests(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.joinRequestService.listAllAdmin(+page, +limit);
  }
}
