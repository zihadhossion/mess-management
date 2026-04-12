import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { DailyCostCategory } from '../../../common/enums/daily-cost-category.enum';

export class CreateDailyCostDto {
  @ApiProperty({ example: '2026-04-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Rice 10kg' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({ example: 'kg' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({ example: 500.0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({
    enum: DailyCostCategory,
    default: DailyCostCategory.INGREDIENT,
  })
  @IsEnum(DailyCostCategory)
  @IsOptional()
  category?: DailyCostCategory;
}

export class UpdateDailyCostDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ enum: DailyCostCategory })
  @IsEnum(DailyCostCategory)
  @IsOptional()
  category?: DailyCostCategory;
}
