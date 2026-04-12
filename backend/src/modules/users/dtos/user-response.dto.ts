import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums/user-role.enum';

export class UserResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() email: string;
  @ApiProperty() fullName: string;
  @ApiProperty({ enum: UserRole }) role: UserRole;
  @ApiProperty() isEmailVerified: boolean;
  @ApiProperty() isActive: boolean;
  @ApiProperty() isSuspended: boolean;
  @ApiProperty() isBanned: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
