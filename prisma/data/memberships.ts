import { MembershipStatus } from '@prisma/client';

/**
 * `status` é opcional — quando omitido, o vínculo fica `ACTIVE` (comportamento
 * anterior, inalterado). Só memberships `ACTIVE` aparecem em `accounts[]` no
 * login/refresh/switch-account (`auth.service.ts::loadContext` filtra por
 * `status: 'ACTIVE'`). Roteiro completo de cada cenário em `prisma/SEED.md`.
 */
export const memberships: {
  userEmail: string;
  accountSlug: string;
  profileName: string;
  isDefault: boolean;
  status?: MembershipStatus;
}[] = [
  { userEmail: 'williamjosefernandes@gmail.com', accountSlug: 'madecoders', profileName: 'Owner', isDefault: true },

  // Acme Corp
  { userEmail: 'alice@acmecorp.com', accountSlug: 'acme-corp', profileName: 'Administrador', isDefault: true },
  { userEmail: 'bob@acmecorp.com', accountSlug: 'acme-corp', profileName: 'Gerente', isDefault: true },

  // Global Tech
  { userEmail: 'charlie@globaltech.com', accountSlug: 'global-tech', profileName: 'Administrador', isDefault: true },

  // Stark Industries
  { userEmail: 'tony@stark.com', accountSlug: 'stark-industries', profileName: 'Administrador', isDefault: true },

  // Customers
  { userEmail: 'joao@email.com', accountSlug: 'joao-silva', profileName: 'Usuário', isDefault: true },
  { userEmail: 'maria@email.com', accountSlug: 'maria-souza', profileName: 'Usuário', isDefault: true },

  // ── Cenários extras de RBAC/sessão (ver prisma/SEED.md) ──

  // Diana: multi-conta com perfis diferentes por conta, mais um vínculo
  // SUSPENSO (Stark) que não deve aparecer em accounts[] no login.
  { userEmail: 'diana@acmecorp.com', accountSlug: 'acme-corp', profileName: 'Administrador', isDefault: true },
  { userEmail: 'diana@acmecorp.com', accountSlug: 'global-tech', profileName: 'Visualizador', isDefault: false },
  { userEmail: 'diana@acmecorp.com', accountSlug: 'stark-industries', profileName: 'Financeiro', isDefault: false, status: MembershipStatus.SUSPENDED },

  { userEmail: 'victor@acmecorp.com', accountSlug: 'acme-corp', profileName: 'Visualizador', isDefault: true },
  { userEmail: 'fernanda@acmecorp.com', accountSlug: 'acme-corp', profileName: 'Financeiro', isDefault: true },
  { userEmail: 'saulo@acmecorp.com', accountSlug: 'acme-corp', profileName: 'Suporte', isDefault: true },
  { userEmail: 'bloqueado@acmecorp.com', accountSlug: 'acme-corp', profileName: 'Usuário', isDefault: true },
  { userEmail: 'suspenso@acmecorp.com', accountSlug: 'acme-corp', profileName: 'Usuário', isDefault: true },
  { userEmail: 'pendente@acmecorp.com', accountSlug: 'acme-corp', profileName: 'Usuário', isDefault: true },
  { userEmail: 'naoverificado@acmecorp.com', accountSlug: 'acme-corp', profileName: 'Usuário', isDefault: true },

  // Convidado: usuário ACTIVE, mas vínculo INVITED — login funciona, a Acme
  // não aparece em accounts[] até o convite ser "aceito" (não há fluxo de
  // aceite de convite implementado no backend hoje — ver prisma/SEED.md).
  { userEmail: 'convidado@acmecorp.com', accountSlug: 'acme-corp', profileName: 'Usuário', isDefault: true, status: MembershipStatus.INVITED },

  // Removido: usuário ACTIVE, mas vínculo REMOVED (soft delete via admin) —
  // login funciona, a Acme não aparece em accounts[].
  { userEmail: 'removido@acmecorp.com', accountSlug: 'acme-corp', profileName: 'Usuário', isDefault: true, status: MembershipStatus.REMOVED },

  // Bruce: Owner de uma conta INATIVA (Wayne Enterprises, active: false).
  { userEmail: 'bruce@wayne.com', accountSlug: 'wayne-enterprises', profileName: 'Owner', isDefault: true },

  // Clark: cenário DEDICADO para validar RBAC entre contas — perfis quase
  // sem sobreposição de menus/componentes (ver prisma/SEED.md, seção 9).
  { userEmail: 'clark@acmecorp.com', accountSlug: 'acme-corp', profileName: 'Financeiro', isDefault: true },
  { userEmail: 'clark@acmecorp.com', accountSlug: 'global-tech', profileName: 'Suporte', isDefault: false },

  // Olivia: segundo Owner da Acme — cenário dedicado para testar a proteção
  // CANNOT_DELETE_OWNER/CANNOT_BLOCK_OWNER pela UI (ver prisma/SEED.md §7.1/§6).
  { userEmail: 'olivia@acmecorp.com', accountSlug: 'acme-corp', profileName: 'Owner', isDefault: true },
];
