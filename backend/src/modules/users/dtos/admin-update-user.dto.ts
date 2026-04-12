import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';

export class AdminUpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isSuspended?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isBanned?: boolean;
}

export class AdminResetPasswordDto {
  @ApiPropertyOptional({ example: 'NewPassword@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
