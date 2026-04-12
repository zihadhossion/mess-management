import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateFeedbackDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  mealSlotId?: string;

  @ApiProperty({ example: '2026-04-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Food quality was not good today.' })
  @IsString()
  complaint: string;
}

export class ResolveFeedbackDto {
  @ApiPropertyOptional({ example: 'Issue noted and addressed.' })
  @IsString()
  @IsOptional()
  resolutionNotes?: string;
}
