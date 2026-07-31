import { IsEmail, IsNotEmpty, MinLength, IsEnum, IsOptional, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthProvider } from '@prisma/client';

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty()
  @ValidateIf((o) => o.authProvider === AuthProvider.LOCAL)
  @MinLength(6)
  @IsNotEmpty()
  password?: string;

  @ApiPropertyOptional({ enum: AuthProvider, default: AuthProvider.LOCAL })
  @IsEnum(AuthProvider)
  @IsOptional()
  authProvider?: AuthProvider = AuthProvider.LOCAL;

  @ApiPropertyOptional()
  @ValidateIf((o) => o.authProvider !== AuthProvider.LOCAL)
  @IsNotEmpty()
  firebaseToken?: string;
}