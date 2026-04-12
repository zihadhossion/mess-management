import { Controller, Get, Post, Body, Param, ParseUUIDPipe, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BaseController } from '../../core/base/base.controller';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { MonthlyBillingService } from './monthly-billing.service';
import { MonthlyBillSummary } from './monthly-bill-summary.entity';
import { FinalizeMonthDto, RecordPaymentDto } from './dtos/billing.dto';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Monthly Billing')
@Controller('messes/:messId/billing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonthlyBillingController extends BaseController<MonthlyBillSummary, FinalizeMonthDto, FinalizeMonthDto> {
  constructor(private readonly billingService: MonthlyBillingService) {
    super(billingService);
  }

  @Get('summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get running month billing summary' })
  @ApiQuery({ name: 'month', required: true, type: Number })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Monthly billing summary.' })
  async getSummary(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.billingService.getSummary(messId, +month, +year);
  }

  @Post('finalize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Manager] Finalize monthly billing and generate invoices' })
  @ApiResponse({ status: 200, description: 'Month finalized and invoices generated.' })
  async finalize(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Body() dto: FinalizeMonthDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.billingService.finalize(messId, dto.month, dto.year, user.id, user.role);
  }

  @Get('invoices')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List invoices for a month' })
  @ApiQuery({ name: 'month', required: true, type: Number })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'List of invoices.' })
  async listInvoices(
    @Param('messId', ParseUUIDPipe) messId: string,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.billingService.listInvoices(messId, +month, +year);
  }

  @Get('invoices/:invoiceId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get invoice details' })
  @ApiResponse({ status: 200, description: 'Invoice detail.' })
  async getInvoice(@Param('invoiceId', ParseUUIDPipe) invoiceId: string) {
    return this.billingService.getInvoice(invoiceId);
  }

  @Post('invoices/:invoiceId/payment')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Manager] Record payment for an invoice' })
  @ApiResponse({ status: 201, description: 'Payment recorded.' })
  async recordPayment(
    @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
    @Body() dto: RecordPaymentDto,
    @CurrentUser() user: { id: string },
  ) {
    await this.billingService.recordPayment(invoiceId, dto, user.id);
    return { message: 'Payment recorded successfully.' };
  }

  @Get('history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get billing history for a mess' })
  @ApiResponse({ status: 200, description: 'Bill history.' })
  async getBillHistory(@Param('messId', ParseUUIDPipe) messId: string) {
    return this.billingService.getBillHistory(messId);
  }
}
