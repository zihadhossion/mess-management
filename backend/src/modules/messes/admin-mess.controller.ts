import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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
import { MessService } from './mess.service';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Admin - Messes')
@Controller('admin/messes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminMessController {
  constructor(private readonly messService: MessService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Get mess detail by ID' })
  @ApiResponse({ status: 200, description: 'Mess details.' })
  @ApiResponse({ status: 404, description: 'Mess not found.' })
  async getMessDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.messService.findByIdOrFail(id);
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
