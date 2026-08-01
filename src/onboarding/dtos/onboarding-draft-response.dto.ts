import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';

/**
 * `GET /v1/onboarding/draft` — usado pelo wizard do frontend pra retomar de
 * onde parou. `payload` acumula só os steps já salvos (`personalData`,
 * `companyData`, `address`, `personalization`) — validados individualmente
 * em cada `PATCH`, não redeclarados aqui como Swagger tipado (é JSON livre
 * de estado de processo, não contrato de domínio — ver `schema.prisma`).
 */
export class OnboardingDraftResponseDto {
  @ApiProperty({ enum: [AccountType.CUSTOMER, AccountType.COMPANY] })
  accountType!: AccountType;

  @ApiProperty({ example: 'address' })
  step!: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  payload!: Record<string, unknown>;
}
