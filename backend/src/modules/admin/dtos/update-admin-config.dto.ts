import { IsBoolean, IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAdminConfigDto {
  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxMembersPerMess?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultMealRate?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  allowSelfRegistration?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  requireEmailVerification?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;
}
