import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiCreatedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiResponseDto } from '../dto/api-response.dto';
import { PageMetaDto } from '../pagination/pagination-info-response.dto';

/** Documenta uma resposta de sucesso `{success, message, messageCode, data, requestId}` com `data` tipado. */
export function ApiStandardResponse<T extends Type<any>>(
  model: T,
  options?: { isArray?: boolean; created?: boolean; description?: string },
) {
  const dataSchema = options?.isArray
    ? { type: 'array', items: { $ref: getSchemaPath(model) } }
    : { $ref: getSchemaPath(model) };
  const ResponseDecorator = options?.created
    ? ApiCreatedResponse
    : ApiOkResponse;

  return applyDecorators(
    ApiExtraModels(ApiResponseDto, model),
    ResponseDecorator({
      description: options?.description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          { properties: { data: dataSchema } },
        ],
      },
    }),
  );
}

/** Documenta uma resposta de listagem paginada — `data` é `PageMetaDto & { content: T[] }`. */
export function ApiPaginatedResponse<T extends Type<any>>(
  model: T,
  description?: string,
) {
  return applyDecorators(
    ApiExtraModels(ApiResponseDto, PageMetaDto, model),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: {
                allOf: [
                  { $ref: getSchemaPath(PageMetaDto) },
                  {
                    properties: {
                      content: {
                        type: 'array',
                        items: { $ref: getSchemaPath(model) },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    }),
  );
}
