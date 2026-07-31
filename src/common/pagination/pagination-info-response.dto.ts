import { ApiProperty } from '@nestjs/swagger';

/**
 * Metadados de paginação, mesclados na raiz da resposta junto com `content`
 * (nunca aninhados em um objeto `pagination`).
 */
export class PageMetaDto {
  @ApiProperty({ description: 'Página atual (1-based).', example: 1 })
  page: number;

  @ApiProperty({ description: 'Quantidade de itens por página.', example: 20 })
  size: number;

  @ApiProperty({
    description: 'Quantidade total de itens encontrados na consulta.',
    example: 250,
  })
  totalElements: number;

  @ApiProperty({ description: 'Quantidade total de páginas.', example: 13 })
  totalPages: number;

  @ApiProperty({
    description: 'Indica se a página atual é a primeira.',
    example: true,
  })
  first: boolean;

  @ApiProperty({
    description: 'Indica se a página atual é a última.',
    example: false,
  })
  last: boolean;

  @ApiProperty({
    description: 'Indica se existe uma próxima página.',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Indica se existe uma página anterior.',
    example: false,
  })
  hasPrevious: boolean;

  constructor(meta?: PageMetaDto) {
    if (meta) Object.assign(this, meta);
  }

  /** Calcula os metadados de paginação a partir da página, do tamanho da página e do total de itens. */
  static create(params: {
    page: number;
    size: number;
    totalElements: number;
  }): PageMetaDto {
    const totalPages =
      params.size > 0 ? Math.ceil(params.totalElements / params.size) : 0;
    const first = params.page <= 1;
    const last = params.page >= totalPages;

    return new PageMetaDto({
      page: params.page,
      size: params.size,
      totalElements: params.totalElements,
      totalPages,
      first,
      last,
      hasNext: !last,
      hasPrevious: !first,
    });
  }
}
