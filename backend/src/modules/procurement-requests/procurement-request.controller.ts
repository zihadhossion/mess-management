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
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { ProcurementRequestService } from './procurement-request.service';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Admin - Procurement Requests')
@Controller('admin/procurement-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ProcurementRequestController {
  constructor(private readonly service: ProcurementRequestService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] List procurement requests' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'messId', required: false })
  async getAll(
    @Query('status') status?: string,
    @Query('messId') messId?: string,
  ) {
    return this.service.getAll({ status, messId });
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Approve a procurement request' })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.approve(id, user.id);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Reject a procurement request' })
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { notes?: string },
    @CurrentUser() user: { id: string },
  ) {
    return this.service.reject(id, user.id, body.notes);
  }
}
