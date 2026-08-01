import { ApiProperty } from '@nestjs/swagger';
import { Equals, IsBoolean } from 'class-validator';

/** `POST /v1/onboarding/complete` — Step "Confirmação" (Customer e Company). */
export class CompleteOnboardingDto {
  @ApiProperty({ description: 'Precisa ser `true` — aceite obrigatório dos Termos de Uso.' })
  @IsBoolean()
  @Equals(true, { message: 'É necessário aceitar os Termos de Uso para concluir o cadastro.' })
  termsAccepted!: boolean;

  @ApiProperty({ description: 'Precisa ser `true` — aceite obrigatório da Política de Privacidade.' })
  @IsBoolean()
  @Equals(true, { message: 'É necessário aceitar a Política de Privacidade para concluir o cadastro.' })
  privacyAccepted!: boolean;
}
