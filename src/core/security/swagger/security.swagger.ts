import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';

export function ApiSecurityDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Acesso Não Autorizado. Token inválido, expirado ou sessão inexistente.' }),
    ApiForbiddenResponse({ description: 'Acesso Negado. Sem permissão, profile incompatível ou conta inativa.' })
  );
}
