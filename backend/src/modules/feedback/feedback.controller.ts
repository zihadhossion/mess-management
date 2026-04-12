import { Controller, Get, Post, Patch, Body, Param, ParseUUIDPipe, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseController } from '../../core/base/base.controller';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { FeedbackService } from './feedback.service';
import { Feedback } from './feedback.entity';
import { CreateFeedbackDto, ResolveFeedbackDto } from './dtos/create-feedback.dto';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Feedback')
@Controller('messes/:messId/feedback')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeedbackController extends BaseController<Feedback, CreateFeedbackDto, ResolveFeedbackDto> {
  constructor(private readonly feedbackService: FeedbackService) {
    super(feedbackService);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Member] Submit feedback' })
  @ApiResponse({ status: 201 })
  async submit(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Body() dto: CreateFeedbackDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.feedbackService.submitFeedback(messId, dto, user.id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List feedback (manager sees all, member sees own)' })
  @ApiResponse({ status: 200 })
  async list(
    @Param('messId', ParseUUIDPipe) messId: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.feedbackService.listFeedback(messId, user.id, user.role);
  }

  @Post(':id/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Resolve feedback' })
  @ApiResponse({ status: 200 })
  async resolve(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResolveFeedbackDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.feedbackService.resolveFeedback(messId, id, dto, user.id, user.role);
  }
}
