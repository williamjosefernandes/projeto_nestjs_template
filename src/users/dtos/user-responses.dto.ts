import { ApiProperty } from '@nestjs/swagger';

export class StandardSuccessResponseDto<T> {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Operação realizada com sucesso.' })
  message!: string;

  data?: T;

  meta?: any;
}

export class UserMeResponseDto {
  id!: string;
  firstName!: string;
  lastName!: string | null;
  fullName!: string;
  email!: string;
  phone!: string | null;
  avatar!: string | null;
  status!: string;
  emailConfirmed!: boolean;
  lastLoginAt!: Date | null;
  createdAt!: Date;
  preferences!: any;
}

export class PublicUserResponseDto {
  id!: string;
  firstName!: string;
  lastName!: string | null;
  avatar!: string | null;
}

export class UserListDto {
  id!: string;
  firstName!: string;
  lastName!: string | null;
  email!: string;
  phone!: string | null;
  status!: string;
  createdAt!: Date;
}
