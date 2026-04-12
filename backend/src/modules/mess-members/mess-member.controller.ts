import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseController } from '../../core/base/base.controller';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { MessMemberService } from './mess-member.service';
import { MessMember } from './mess-member.entity';
import {
  AddMemberByEmailDto,
  CreateMemberAccountDto,
} from './dtos/create-mess-member.dto';
import { UpdateMessMemberDto } from './dtos/update-mess-member.dto';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Mess Members')
@Controller('messes/:messId/members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessMemberController extends BaseController<
  MessMember,
  AddMemberByEmailDto,
  UpdateMessMemberDto
> {
  constructor(private readonly messMemberService: MessMemberService) {
    super(messMemberService);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all members of a mess' })
  @ApiResponse({ status: 200, description: 'List of members.' })
  async getMembers(@Param('messId', ParseUUIDPipe) messId: string) {
    return this.messMemberService.getMembers(messId);
  }

  @Post('add-by-email')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Manager] Add a member by email' })
  @ApiResponse({ status: 201, description: 'Member added.' })
  async addByEmail(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Body() dto: AddMemberByEmailDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.messMemberService.addMemberByEmail(
      messId,
      dto,
      user.id,
      user.role,
    );
  }

  @Post('create-account')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Manager] Create account and add as member' })
  @ApiResponse({
    status: 201,
    description: 'Account created and member added.',
  })
  async createAccount(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Body() dto: CreateMemberAccountDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.messMemberService.createAndAddMember(
      messId,
      dto,
      user.id,
      user.role,
    );
  }

  @Patch(':memberId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Update member details' })
  @ApiResponse({ status: 200, description: 'Member updated.' })
  async updateMember(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body() dto: UpdateMessMemberDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.messMemberService.updateMember(
      messId,
      memberId,
      dto,
      user.id,
      user.role,
    );
  }

  @Post(':memberId/assign-co-manager')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Assign co-manager role' })
  @ApiResponse({ status: 200, description: 'Co-manager assigned.' })
  async assignCoManager(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.messMemberService.assignCoManager(
      messId,
      memberId,
      user.id,
      user.role,
    );
  }

  @Delete(':memberId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Remove a member' })
  @ApiResponse({ status: 200, description: 'Member removed.' })
  async removeMember(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.messMemberService.removeMember(
      messId,
      memberId,
      user.id,
      user.role,
    );
  }
}
