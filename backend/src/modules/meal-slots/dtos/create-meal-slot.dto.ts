import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { MealSlotType } from '../../../common/enums/meal-slot-type.enum';

export class CreateMealSlotDto {
  @ApiProperty({ example: '2026-04-15' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ enum: MealSlotType })
  @IsEnum(MealSlotType)
  type: MealSlotType;

  @ApiProperty({ example: '07:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'timeWindowStart must be HH:MM' })
  timeWindowStart: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'timeWindowEnd must be HH:MM' })
  timeWindowEnd: string;

  @ApiPropertyOptional({ example: 'Rice, Dal, Chicken Curry' })
  @IsString()
  @IsOptional()
  menuDescription?: string;
}

export class UpdateMealSlotDto {
  @ApiPropertyOptional({ example: '07:00' })
  @IsString()
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: 'timeWindowStart must be HH:MM' })
  timeWindowStart?: string;

  @ApiPropertyOptional({ example: '09:00' })
  @IsString()
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: 'timeWindowEnd must be HH:MM' })
  timeWindowEnd?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  menuDescription?: string;
}
