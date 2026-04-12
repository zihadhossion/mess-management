import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDeletionRequestDto {
  @ApiProperty({ example: 'We are shutting down the mess.' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class ProcessDeletionRequestDto {
  @ApiPropertyOptional({ example: 'Bills settled, approved.' })
  @IsString()
  @IsOptional()
  adminNotes?: string;
}
