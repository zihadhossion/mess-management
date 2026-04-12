import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  fullName?: string;
}

export class ChangePasswordDto {
  @ApiPropertyOptional({ example: 'OldPassword@123' })
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @ApiPropertyOptional({ example: 'NewPassword@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  @IsOptional()
  newPassword?: string;
}
