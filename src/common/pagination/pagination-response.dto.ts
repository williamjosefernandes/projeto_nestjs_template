import { ApiResponseDto } from '../dto/api-response.dto';
import { PageMetaDto } from './pagination-info-response.dto';

/**
 * Listagem paginada: `ApiResponseDto` cujo `data` contém os metadados de
 * paginação e o `content` (nunca `items`/`pagination` soltos na raiz).
 */
export type PaginatedResponse<T> = ApiResponseDto<PageMetaDto & { content: T[] }>;

/** Monta uma resposta de listagem paginada a partir dos itens, da paginação e do requestId da requisição atual. */
export function createPaginatedResponse<T>(
  content: T[],
  page: { page: number; size: number; totalElements: number },
  message: string,
  requestId: string,
): PaginatedResponse<T> {
  return {
    success: true,
    timestamp: new Date().toISOString(),
    message,
    requestId,
    data: { ...PageMetaDto.create(page), content },
  };
}
