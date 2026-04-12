import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { MemberRole } from '../../../common/enums/member-role.enum';

export class AddMemberByEmailDto {
  @ApiProperty({ example: 'member@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ enum: MemberRole, default: MemberRole.MEMBER })
  @IsEnum(MemberRole)
  @IsOptional()
  memberRole?: MemberRole;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isGuest?: boolean;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsDateString()
  @IsOptional()
  guestValidUntil?: string;
}

export class CreateMemberAccountDto {
  @ApiProperty({ example: 'New Member' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'newmember@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isGuest?: boolean;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsDateString()
  @IsOptional()
  guestValidUntil?: string;
}
