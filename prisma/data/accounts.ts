import { AccountType } from '@prisma/client';

export const systemAccounts = [
  { code: 'SYSTEM', type: AccountType.SYSTEM, name: 'MadeCoders', slug: 'madecoders', active: true },
  
  // Empresas Mock
  { code: 'COMPANY1', type: AccountType.COMPANY, name: 'Acme Corp', slug: 'acme-corp', active: true },
  { code: 'COMPANY2', type: AccountType.COMPANY, name: 'Global Tech', slug: 'global-tech', active: true },
  { code: 'COMPANY3', type: AccountType.COMPANY, name: 'Stark Industries', slug: 'stark-industries', active: true },

  // Clientes Mock
  { code: 'CUST1', type: AccountType.CUSTOMER, name: 'João Silva', slug: 'joao-silva', active: true },
  { code: 'CUST2', type: AccountType.CUSTOMER, name: 'Maria Souza', slug: 'maria-souza', active: true },
];