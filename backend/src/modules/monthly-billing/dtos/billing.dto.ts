import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';

export class FinalizeMonthDto {
  @ApiProperty({ example: 4, minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(2020)
  year: number;
}

export class RecordPaymentDto {
  @ApiProperty({ example: 1500.0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ example: '2026-04-15' })
  @IsNotEmpty()
  paymentDate: string;

  @ApiPropertyOptional({ example: 'bKash TrxID: ABC123' })
  @IsString()
  @IsOptional()
  referenceNote?: string;
}
