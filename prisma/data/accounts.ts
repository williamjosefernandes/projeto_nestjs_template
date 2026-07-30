import { AccountType } from '@prisma/client';

export const systemAccounts = [
  {
    code: 'SYSTEM',
    type: AccountType.SYSTEM,
    name: 'MadeCoders',
    slug: 'madecoders',
    active: true,
  },
];