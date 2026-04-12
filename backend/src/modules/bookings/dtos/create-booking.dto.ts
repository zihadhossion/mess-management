import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class UpdateBookingDto {
  @ApiPropertyOptional({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  portions?: number;
}

export class BulkCancelDto {
  @ApiProperty({ example: ['uuid1', 'uuid2'] })
  @IsArray()
  @IsUUID('4', { each: true })
  bookingIds: string[];
}

export class BulkBookDto {
  @ApiProperty({ example: ['slotId1', 'slotId2'] })
  @IsArray()
  @IsUUID('4', { each: true })
  mealSlotIds: string[];
}
