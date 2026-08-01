import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsUrl, Matches, MaxLength } from 'class-validator';
import { IsCNPJ } from '../../common/decorators/is-cnpj.decorator';

const PHONE_E164 = /^\+[1-9]\d{1,14}$/;

/** `PATCH /v1/onboarding/draft/company-data` — Step "Empresa" (Company). */
export class CreateCompanyDataDto {
  @ApiProperty({ example: 'Acme Corporation S.A.' })
  @IsNotEmpty()
  @MaxLength(255)
  corporateName!: string;

  @ApiProperty({ example: 'Acme Corp' })
  @IsNotEmpty()
  @MaxLength(255)
  tradeName!: string;

  @ApiProperty({ example: '11.222.333/0001-81', description: 'CNPJ, com ou sem máscara.' })
  @IsCNPJ()
  document!: string;

  @ApiProperty({ example: 'contato@acmecorp.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '+5511999999999', description: 'Formato E.164.' })
  @IsOptional()
  @Matches(PHONE_E164, { message: 'Telefone deve seguir o padrão E.164' })
  phone?: string;

  @ApiPropertyOptional({ example: '+5511988888888', description: 'Formato E.164.' })
  @IsOptional()
  @Matches(PHONE_E164, { message: 'WhatsApp deve seguir o padrão E.164' })
  whatsapp?: string;

  @ApiPropertyOptional({ example: 'https://acmecorp.com' })
  @IsOptional()
  @IsUrl({}, { message: 'Informe uma URL válida.' })
  website?: string;
}
