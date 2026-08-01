import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID, Matches, MaxLength } from 'class-validator';

/** `PATCH /v1/onboarding/draft/address` — Step "Endereço" (Customer e Company). */
export class CreateAddressDto {
  @ApiProperty({ example: '01001-000' })
  @Matches(/^\d{5}-?\d{3}$/, { message: 'CEP inválido.' })
  zipCode!: string;

  @ApiProperty({ example: 'Praça da Sé' })
  @IsNotEmpty()
  @MaxLength(255)
  street!: string;

  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  @MaxLength(20)
  number!: string;

  @ApiPropertyOptional({ example: 'Sala 101' })
  @IsOptional()
  @MaxLength(255)
  complement?: string;

  @ApiProperty({ example: 'Sé' })
  @IsNotEmpty()
  @MaxLength(255)
  district!: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsNotEmpty()
  @MaxLength(255)
  city!: string;

  @ApiProperty({ example: 'SP', description: 'UF (Brasil) ou equivalente regional do país selecionado.' })
  @IsNotEmpty()
  @MaxLength(100)
  state!: string;

  @ApiProperty({ description: 'Id de `GET /v1/geo/countries`.' })
  @IsUUID()
  countryId!: string;
}
