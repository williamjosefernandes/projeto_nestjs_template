import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, Matches } from 'class-validator';
import { Gender } from '@prisma/client';
import { IsCPF } from '../../common/decorators/is-cpf.decorator';
import { IsNotFutureDate } from '../../common/decorators/is-not-future-date.decorator';

/** `PATCH /v1/onboarding/draft/personal-data` — Step "Dados Pessoais" (Customer). */
export class CreatePersonalDataDto {
  @ApiProperty({ example: '123.456.789-09', description: 'CPF, com ou sem máscara.' })
  @IsNotEmpty()
  @IsCPF()
  document!: string;

  @ApiProperty({ example: '1990-05-20' })
  @IsDateString()
  @IsNotFutureDate({ message: 'Data de nascimento não pode estar no futuro.' })
  birthDate!: string;

  @ApiProperty({ example: '+5511999999999', description: 'Formato E.164.' })
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Telefone deve seguir o padrão E.164' })
  phone!: string;

  @ApiProperty({ enum: Gender, example: Gender.NOT_INFORMED })
  @IsEnum(Gender)
  gender!: Gender;
}
