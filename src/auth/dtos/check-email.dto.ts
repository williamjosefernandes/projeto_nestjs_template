import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CheckEmailDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class CheckEmailResponseDto {
  @ApiProperty()
  exists: boolean;

  @ApiProperty({ required: false })
  emailVerified?: boolean;

  @ApiProperty({ required: false, type: [String] })
  loginMethods?: string[];
}
