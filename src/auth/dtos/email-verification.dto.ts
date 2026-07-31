import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

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
