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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { MessService } from './mess.service';
import { UserRole } from '../../common/enums/user-role.enum';
import { MessStatus } from '../../common/enums/mess-status.enum';

@ApiTags('Admin - Messes')
@Controller('admin/messes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminMessController {
  constructor(private readonly messService: MessService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] List all messes with manager info and member count' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: MessStatus })
  async getAdminMessList(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: MessStatus,
  ) {
    return this.messService.getAdminMessList(+page, +limit, status);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Get mess detail by ID' })
  @ApiResponse({ status: 200, description: 'Mess details.' })
  @ApiResponse({ status: 404, description: 'Mess not found.' })
  async getMessDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.messService.findByIdOrFail(id, { manager: true });
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Force deactivate a mess' })
  @ApiResponse({ status: 200, description: 'Mess deactivated.' })
  async forceDeactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.messService.deactivateMess(id, user.id, UserRole.ADMIN);
  }

  @Post(':id/reassign-manager')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Reassign mess to a different manager' })
  @ApiResponse({ status: 200, description: 'Manager reassigned.' })
  async reassignManager(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { newManagerId: string },
  ) {
    return this.messService.reassignManager(id, body.newManagerId);
  }
}
