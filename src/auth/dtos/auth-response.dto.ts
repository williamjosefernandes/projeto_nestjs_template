import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty({ required: false })
  lastName?: string;

  @ApiProperty({ required: false })
  avatar?: string;

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty()
  status: string;
}

export class AccountResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: string;

  @ApiProperty({ required: false })
  avatar?: string;
}

export class MembershipResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  status: string;
}

export class ProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: number;

  @ApiProperty()
  user: UserResponseDto;

  @ApiProperty({ required: false })
  currentAccount?: AccountResponseDto;

  @ApiProperty({ required: false })
  currentMembership?: MembershipResponseDto;

  @ApiProperty({ required: false })
  profile?: ProfileResponseDto;

  @ApiProperty({ type: [String], required: false })
  permissions?: string[];

  @ApiProperty({ type: [String], required: false })
  menus?: string[];

  @ApiProperty({ type: [String], required: false })
  components?: string[];
}

export class RefreshTokenResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: number;
}
