import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateJoinRequestDto {
  @ApiPropertyOptional({ example: 'I would like to join this mess.' })
  @IsString()
  @IsOptional()
  message?: string;
}

export class ProcessJoinRequestDto {
  @ApiPropertyOptional({ example: 'Welcome to the mess!' })
  @IsString()
  @IsOptional()
  notes?: string;
}
