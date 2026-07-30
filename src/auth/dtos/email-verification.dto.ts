import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { UserResponseDto } from './auth-response.dto';

export class VerifyEmailDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}

export class ResendEmailVerificationDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class VerifyEmailResponseDto {
  @ApiProperty()
  verified: boolean;

  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: number;

  @ApiProperty()
  refreshExpiresIn: number;

  @ApiProperty()
  tokenType: string;

  @ApiProperty()
  user: UserResponseDto;
}
