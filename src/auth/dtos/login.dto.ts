import { IsEmail, IsNotEmpty, MinLength, IsEnum, IsOptional, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AuthProvider } from '@prisma/client';

export class LoginDto {
  @ApiPropertyOptional({ description: 'Obrigatório apenas quando authProvider é LOCAL.' })
  @ValidateIf((o) => !o.authProvider || o.authProvider === AuthProvider.LOCAL)
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @ApiPropertyOptional({ description: 'Obrigatório apenas quando authProvider é LOCAL.' })
  @ValidateIf((o) => !o.authProvider || o.authProvider === AuthProvider.LOCAL)
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