import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BaseController } from '../../core/base/base.controller';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { SharedBillService } from './shared-bill.service';
import { SharedBillCategory } from './shared-bill-category.entity';
import {
  CreateSharedBillCategoryDto, UpdateSharedBillCategoryDto,
  CreateSharedBillEntryDto, UpdateSharedBillEntryDto,
  FinalizeSharedBillDto, RecordSharedBillPaymentDto,
} from './dtos/shared-bill.dto';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Shared Bills')
@Controller('messes/:messId/shared-bills')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SharedBillController extends BaseController<SharedBillCategory, CreateSharedBillCategoryDto, UpdateSharedBillCategoryDto> {
  constructor(private readonly sharedBillService: SharedBillService) {
    super(sharedBillService);
  }

  // Categories
  @Get('categories')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List shared bill categories' })
  @ApiResponse({ status: 200 })
  async listCategories(@Param('messId', ParseUUIDPipe) messId: string) {
    return this.sharedBillService.listCategories(messId);
  }

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Manager] Create shared bill category' })
  @ApiResponse({ status: 201 })
  async createCategory(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Body() dto: CreateSharedBillCategoryDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.sharedBillService.createCategory(messId, dto, user.id, user.role);
  }

  @Patch('categories/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Update shared bill category' })
  @ApiResponse({ status: 200 })
  async updateCategory(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSharedBillCategoryDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.sharedBillService.updateCategory(messId, id, dto, user.id, user.role);
  }

  @Post('categories/:id/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Toggle category active/inactive' })
  @ApiResponse({ status: 200 })
  async toggleCategory(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.sharedBillService.toggleCategory(messId, id, user.id, user.role);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Delete shared bill category' })
  @ApiResponse({ status: 200 })
  async deleteCategory(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.sharedBillService.deleteCategory(messId, id, user.id, user.role);
  }

  // Entries
  @Get('entries')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List shared bill entries for a month' })
  @ApiQuery({ name: 'month', required: true, type: Number })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiResponse({ status: 200 })
  async listEntries(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.sharedBillService.listEntries(messId, +month, +year);
  }

  @Post('entries')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Manager] Create shared bill entry' })
  @ApiResponse({ status: 201 })
  async createEntry(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Body() dto: CreateSharedBillEntryDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.sharedBillService.createEntry(messId, dto, user.id, user.role);
  }

  @Patch('entries/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Update shared bill entry' })
  @ApiResponse({ status: 200 })
  async updateEntry(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSharedBillEntryDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.sharedBillService.updateEntry(messId, id, dto, user.id, user.role);
  }

  @Delete('entries/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Delete shared bill entry' })
  @ApiResponse({ status: 200 })
  async deleteEntry(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.sharedBillService.deleteEntry(messId, id, user.id, user.role);
  }

  // Finalization and invoices
  @Post('finalize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Finalize shared bills and generate invoices' })
  @ApiResponse({ status: 200 })
  async finalize(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Body() dto: FinalizeSharedBillDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.sharedBillService.finalize(messId, dto.month, dto.year, user.id, user.role);
  }

  @Get('invoices')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List shared bill invoices for a month' })
  @ApiQuery({ name: 'month', required: true, type: Number })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiResponse({ status: 200 })
  async listInvoices(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.sharedBillService.listInvoices(messId, +month, +year);
  }

  @Get('invoices/:invoiceId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get shared bill invoice detail' })
  @ApiResponse({ status: 200 })
  async getInvoice(@Param('invoiceId', ParseUUIDPipe) invoiceId: string) {
    return this.sharedBillService.getInvoice(invoiceId);
  }

  @Post('invoices/:invoiceId/payment')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Manager] Record shared bill payment' })
  @ApiResponse({ status: 201 })
  async recordPayment(
    @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
    @Body() dto: RecordSharedBillPaymentDto,
    @CurrentUser() user: { id: string },
  ) {
    await this.sharedBillService.recordPayment(invoiceId, dto, user.id);
    return { message: 'Payment recorded successfully.' };
  }
}
