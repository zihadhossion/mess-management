import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';

export class CreateSharedBillCategoryDto {
  @ApiProperty({ example: 'Rent' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Monthly rent for the accommodation' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateSharedBillCategoryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateSharedBillEntryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(2020)
  year: number;

  @ApiProperty({ example: 15000.0 })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  referenceNote?: string;

  @ApiProperty({ example: '2026-04-01' })
  @IsDateString()
  entryDate: string;
}

export class UpdateSharedBillEntryDto {
  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalAmount?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  referenceNote?: string;
}

export class FinalizeSharedBillDto {
  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(2020)
  year: number;
}

export class RecordSharedBillPaymentDto {
  @ApiProperty({ example: 3000.0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ example: '2026-04-15' })
  @IsDateString()
  paymentDate: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  referenceNote?: string;
}
