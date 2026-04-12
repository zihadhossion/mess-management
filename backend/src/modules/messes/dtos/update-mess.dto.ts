import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Currency } from '../../../common/enums/currency.enum';

export class UpdateMessDto {
  @ApiPropertyOptional({ example: 'Updated Mess Name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'New address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: Currency })
  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  requiresJoinApproval?: boolean;
}

export class ApproveMessDto {
  @ApiPropertyOptional({ example: 'Approved by admin.' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class RejectMessDto {
  @ApiPropertyOptional({ example: 'Missing required information.' })
  @IsString()
  @IsOptional()
  notes?: string;
}
