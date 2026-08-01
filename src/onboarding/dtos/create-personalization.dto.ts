import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Language } from '@prisma/client';

/** `PATCH /v1/onboarding/draft/personalization` — Step "Personalização" (Company). */
export class CreatePersonalizationDto {
  @ApiProperty({ example: 'Acme Corp', description: 'Nome de exibição da conta no portal.' })
  @IsNotEmpty()
  @MaxLength(255)
  accountName!: string;

  @ApiPropertyOptional({
    description:
      'URL do logo. Sem upload real de arquivo nesta versão (mesma limitação do avatar de usuário) — aceita uma URL já hospedada.',
  })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ enum: Language, example: Language.PT_BR })
  @IsEnum(Language)
  language!: Language;

  @ApiProperty({ example: 'America/Sao_Paulo', description: 'IANA timezone.' })
  @IsNotEmpty()
  @MaxLength(100)
  timezone!: string;
}
