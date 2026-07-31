import { ApiProperty } from '@nestjs/swagger';
import { ErrorCode } from '../enum/error-code.enum';

export class ErrorDto {
  @ApiProperty({
    enum: ErrorCode,
    description:
      'Código do erro, estável e independente de idioma. O cliente deve usar este valor (nunca o texto de `message`) para localizar a mensagem no idioma do usuário.',
    example: ErrorCode.INVALID_CREDENTIALS,
  })
  code: ErrorCode;

  @ApiProperty({ description: 'Mensagem legível no idioma do servidor — apenas para debug/log.' })
  message: string;

  @ApiProperty({
    required: false,
    description: 'Detalhes estruturados adicionais sobre o erro (ex.: lista de violações de validação por campo).',
  })
  details?: unknown;
}

export class ApiResponseDto<T = any> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  timestamp: string;

  @ApiProperty({ required: false })
  message?: string;

  @ApiProperty({ required: false })
  data?: T;

  @ApiProperty({ required: false })
  error?: ErrorDto;

  @ApiProperty({ required: false })
  requestId?: string;
}
