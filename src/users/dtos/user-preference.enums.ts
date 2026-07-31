/**
 * Espelham os enums do Prisma (`Theme`, `Language`, `TimeFormat`) para que o
 * contrato da API não dependa diretamente do client do ORM. Os valores são
 * mantidos idênticos de propósito — a conversão é feita no limite do
 * `UsersService` ao persistir.
 */
export enum UserTheme {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  SYSTEM = 'SYSTEM',
}

export enum UserLanguage {
  PT_BR = 'PT_BR',
  EN_US = 'EN_US',
  ES_ES = 'ES_ES',
}

export enum UserTimeFormat {
  H12 = 'H12',
  H24 = 'H24',
}
