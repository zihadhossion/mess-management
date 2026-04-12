import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPrefsDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  bookingConfirmation?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  invoiceGenerated?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  joinRequestStatus?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  messApprovalStatus?: boolean;
}
