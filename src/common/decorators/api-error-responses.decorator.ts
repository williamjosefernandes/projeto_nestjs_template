import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ErrorDto } from '../dto/api-response.dto';

const errorSchema = (description: string) => ({
  description,
  schema: { allOf: [{ $ref: getSchemaPath(ErrorDto) }] },
});

/** Documenta os erros comuns da API (formato `ErrorDto`), reutilizado em todos os controllers. */
export function ApiCommonErrorResponses() {
  return applyDecorators(
    ApiExtraModels(ErrorDto),
    ApiBadRequestResponse(
      errorSchema('Requisição inválida ou com erros de validação.'),
    ),
    ApiUnauthorizedResponse(
      errorSchema('Não autenticado ou token inválido/expirado.'),
    ),
    ApiForbiddenResponse(
      errorSchema('Autenticado, mas sem permissão para este recurso.'),
    ),
    ApiNotFoundResponse(errorSchema('Recurso não encontrado.')),
    ApiConflictResponse(errorSchema('Conflito com o estado atual do recurso.')),
  );
}
