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
import { Roles } from '../../core/decorators/roles.decorator';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { MessService } from './mess.service';
import { Mess } from './mess.entity';
import { CreateMessDto } from './dtos/create-mess.dto';
import {
  UpdateMessDto,
  ApproveMessDto,
  RejectMessDto,
} from './dtos/update-mess.dto';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Messes')
@Controller('messes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessController extends BaseController<
  Mess,
  CreateMessDto,
  UpdateMessDto
> {
  constructor(private readonly messService: MessService) {
    super(messService);
  }

  @Post()
  @Roles(UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '[Manager] Create a new mess (starts as PENDING_APPROVAL)',
  })
  @ApiResponse({
    status: 201,
    description: 'Mess created and pending approval.',
  })
  override async create(
    @Body() dto: CreateMessDto,
    @CurrentUser() user?: { id: string },
  ) {
    return this.messService.createMess(dto, user!.id);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] List all messes' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of messes.' })
  async listMesses(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.messService.findAll({
      skip: (+page - 1) * +limit,
      take: +limit,
    });
  }

  @Get('my')
  @Roles(UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Get current manager messes' })
  @ApiResponse({ status: 200, description: 'Messes belonging to the manager.' })
  async getMyMesses(@CurrentUser() user: { id: string }) {
    return this.messService.getMyMesses(user.id);
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search messes by name or ID (public-facing)' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Search results.' })
  async searchMesses(
    @Query('q') q: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.messService.searchMesses(q || '', +page, +limit);
  }

  @Get('admin/pending')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] List pending mess creation requests' })
  @ApiResponse({ status: 200, description: 'Pending mess requests.' })
  async getPendingRequests(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.messService.getPendingRequests(+page, +limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get mess by ID' })
  @ApiResponse({ status: 200, description: 'Mess details.' })
  @ApiResponse({ status: 404, description: 'Mess not found.' })
  async findOneMess(@Param('id', ParseUUIDPipe) id: string) {
    return this.messService.findByIdOrFail(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager/Admin] Update mess details' })
  @ApiResponse({ status: 200, description: 'Mess updated successfully.' })
  async updateMess(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMessDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.messService.updateMess(id, user.id, dto, user.role);
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Approve mess creation request' })
  @ApiResponse({ status: 200, description: 'Mess approved and now ACTIVE.' })
  async approveMess(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveMessDto,
  ) {
    return this.messService.approveMess(id, dto.notes);
  }

  @Post(':id/reject')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Reject mess creation request' })
  @ApiResponse({ status: 200, description: 'Mess rejected.' })
  async rejectMess(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectMessDto,
  ) {
    return this.messService.rejectMess(id, dto.notes);
  }

  @Post(':id/resubmit')
  @Roles(UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Resubmit rejected mess (max 3 times)' })
  @ApiResponse({ status: 200, description: 'Mess resubmitted.' })
  async resubmitMess(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMessDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.messService.resubmitMess(id, user.id, dto);
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager/Admin] Deactivate a mess' })
  @ApiResponse({ status: 200, description: 'Mess deactivated.' })
  async deactivateMess(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.messService.deactivateMess(id, user.id, user.role);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Soft delete a mess' })
  @ApiResponse({ status: 200, description: 'Mess deleted.' })
  async removeMess(@Param('id', ParseUUIDPipe) id: string) {
    return this.messService.remove(id);
  }
}
