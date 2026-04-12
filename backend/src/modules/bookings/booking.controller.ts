import {
  Controller,
  Get,
  Post,
  Patch,
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
import { BookingService } from './booking.service';
import { Booking } from './booking.entity';
import {
  UpdateBookingDto,
  BulkCancelDto,
  BulkBookDto,
} from './dtos/create-booking.dto';

@ApiTags('Bookings')
@Controller('messes/:messId/bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController extends BaseController<
  Booking,
  UpdateBookingDto,
  UpdateBookingDto
> {
  constructor(private readonly bookingService: BookingService) {
    super(bookingService);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Member] List my bookings in a mess' })
  @ApiResponse({ status: 200, description: 'List of bookings.' })
  async listMine(
    @Param('messId', ParseUUIDPipe) messId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.bookingService.listMemberBookings(messId, user.id);
  }

  @Post(':bookingId/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Member] Cancel a booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled.' })
  async cancel(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.bookingService.cancelBooking(messId, bookingId, user.id);
  }

  @Post(':bookingId/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Member] Restore a cancelled booking' })
  @ApiResponse({ status: 200, description: 'Booking restored.' })
  async restore(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.bookingService.restoreBooking(messId, bookingId, user.id);
  }

  @Patch(':bookingId/portions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Member] Update booking portions' })
  @ApiResponse({ status: 200, description: 'Booking portions updated.' })
  async updatePortions(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @Body() dto: UpdateBookingDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.bookingService.updatePortions(
      messId,
      bookingId,
      dto.portions!,
      user.id,
    );
  }

  @Post('bulk-cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Member] Bulk cancel bookings' })
  @ApiResponse({ status: 200, description: 'Bookings cancelled.' })
  async bulkCancel(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Body() dto: BulkCancelDto,
    @CurrentUser() user: { id: string },
  ) {
    await this.bookingService.bulkCancel(messId, dto.bookingIds, user.id);
    return { message: 'Bookings cancelled successfully.' };
  }

  @Post('bulk-book')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Member] Bulk book meal slots' })
  @ApiResponse({ status: 201, description: 'Bookings created.' })
  async bulkBook(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Body() dto: BulkBookDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.bookingService.bulkBook(messId, dto.mealSlotIds, user.id);
  }
}
