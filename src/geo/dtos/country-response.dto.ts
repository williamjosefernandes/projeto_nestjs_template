import { ApiProperty } from '@nestjs/swagger';

export class CountryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ description: 'Código ISO 3166-1 alpha-2 (ex.: "BR").' })
  code!: string;
}
