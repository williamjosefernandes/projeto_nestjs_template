import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class ValidateResetPasswordTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  token: string;
}

export class ValidateResetPasswordTokenResponseDto {
  @ApiProperty()
  valid: boolean;

  @ApiProperty({ required: false })
  expiresAt?: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  token: string;

  @ApiProperty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character' }
  )
  newPassword: string;
}
