import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { MemberRole } from '../../../common/enums/member-role.enum';

export class UpdateMessMemberDto {
  @ApiPropertyOptional({ enum: MemberRole })
  @IsEnum(MemberRole)
  @IsOptional()
  memberRole?: MemberRole;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  participatesInMeals?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isGuest?: boolean;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsDateString()
  @IsOptional()
  guestValidUntil?: string;
}
