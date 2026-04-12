import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateItemTypeDto {
  @ApiProperty({ example: 'Milk' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'liter' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  @Min(0)
  defaultDailyQuantity: number;

  @ApiProperty({ example: 80.0 })
  @IsNumber()
  @Min(0)
  costPerUnit: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateItemTypeDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultDailyQuantity?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  costPerUnit?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
