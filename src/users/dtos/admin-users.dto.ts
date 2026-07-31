import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MaxLength,
  Matches,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MembershipStatus } from '@prisma/client';

export class CreateUserAdminDto {
  @ApiProperty({ example: 'Maria' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  firstName!: string;

  @ApiPropertyOptional({ example: 'Souza' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiProperty({ example: 'maria@empresa.com' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '+5511999999998' })
  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Telefone deve seguir o padrão E.164',
  })
  phone?: string;

  @ApiProperty({ example: 'uuid-do-profile' })
  @IsNotEmpty()
  @IsString()
  profileId!: string;
}

export class UpdateUserAdminDto {
  @ApiPropertyOptional({ example: 'Maria' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Souza' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ example: '+5511999999998' })
  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Telefone deve seguir o padrão E.164',
  })
  phone?: string;
}

export class UpdateUserStatusDto {
  @ApiProperty({
    enum: MembershipStatus,
    example: MembershipStatus.SUSPENDED,
    description:
      'Status do vínculo do usuário com esta conta (não é o status global do usuário — para um usuário bloqueado só nesta conta, use SUSPENDED).',
  })
  @IsNotEmpty()
  @IsEnum(MembershipStatus)
  status!: MembershipStatus;
}
