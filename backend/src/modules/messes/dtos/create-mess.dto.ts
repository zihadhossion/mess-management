import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Currency } from '../../../common/enums/currency.enum';

export class CreateMessDto {
  @ApiProperty({ example: 'Sunrise PG' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '123 Main St, Dhaka' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ example: 'A cozy mess for students' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: Currency, default: Currency.BDT })
  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;
}
