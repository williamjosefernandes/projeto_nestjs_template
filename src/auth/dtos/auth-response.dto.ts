import { ApiProperty } from '@nestjs/swagger';
import { AuthProvider } from '@prisma/client';

export class AuthTokensDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty()
  expiresIn!: number;
}

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Pode ser nulo para contas provisionadas via login por telefone ou anônimo.',
  })
  email?: string | null;

  @ApiProperty()
  firstName!: string;

  @ApiProperty({ required: false })
  lastName?: string;

  @ApiProperty({ required: false })
  avatar?: string;

  @ApiProperty()
  emailVerified!: boolean;

  @ApiProperty()
  status!: string;

  @ApiProperty({ enum: AuthProvider })
  authProvider!: AuthProvider;
}

export class CurrentMembershipDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  isOwner!: boolean;

  @ApiProperty()
  status!: string;
}

export class CurrentProfileDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;
}

export class CurrentAccountDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false })
  logo?: string;

  @ApiProperty()
  membership!: CurrentMembershipDto;

  @ApiProperty()
  profile!: CurrentProfileDto;

  @ApiProperty({ type: [String] })
  permissions!: string[];

  @ApiProperty({ type: [String] })
  menus!: string[];

  @ApiProperty({ type: [String] })
  components!: string[];
}

export class AccountListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty({ required: false })
  logo?: string;

  @ApiProperty()
  profile!: string;
}

/**
 * Recurso retornado pelo login — mesclado na raiz de `ApiSuccessResponse<LoginResponseDto>`
 * (ver `src/common/dto/api-response.dto.ts`), junto com `success`/`timestamp`/`message`/`requestId`.
 */
export class LoginResponseDto {
  @ApiProperty()
  auth!: AuthTokensDto;

  @ApiProperty()
  user!: UserResponseDto;

  @ApiProperty({ required: false })
  currentAccount?: CurrentAccountDto;

  @ApiProperty({ type: [AccountListItemDto], required: false })
  accounts?: AccountListItemDto[];
}
