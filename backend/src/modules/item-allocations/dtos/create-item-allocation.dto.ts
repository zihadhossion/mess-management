import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateItemAllocationDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  itemTypeId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  messMemberId: string;

  @ApiProperty({ example: '2026-04-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  @Min(0)
  quantity: number;
}

export class UpdateItemAllocationDto {
  @ApiPropertyOptional({ example: 3.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;
}
