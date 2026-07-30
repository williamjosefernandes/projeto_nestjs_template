import { Language, Theme, TimeFormat } from '@prisma/client';

export const userPreferences = [
  {
    userEmail: 'admin@madecoders.com',

    theme: Theme.SYSTEM,

    language: Language.PT_BR,

    timeFormat: TimeFormat.H24,

    timezone: 'America/Sao_Paulo',
  },
];