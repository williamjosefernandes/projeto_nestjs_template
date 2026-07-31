/**
 * Perfis do sistema — criados automaticamente para TODA conta (ver
 * `profiles.seed.ts`, que itera `prisma.account.findMany()`). `code` não é
 * persistido (`profiles.seed.ts` só usa `name`/`description`) — é só
 * documentação; o "código" exposto ao frontend (`CurrentProfileDto.code`) é
 * `profile.name.toUpperCase()`, calculado em `auth.service.ts::loadContext`.
 *
 * Sete perfis, para cobrir cenários de RBAC bem diferentes (ver
 * `profile-permissions.ts` para a matriz completa e `prisma/SEED.md` para o
 * roteiro de testes):
 *  - Owner        → acesso total (`*`).
 *  - Administrador → quase tudo, exceto excluir usuários (lacuna proposital).
 *  - Gerente       → acesso médio; um override remove `users.update` do que
 *                    o perfil concede por padrão (demonstra DENY).
 *  - Usuário       → acesso mínimo; um override concede `nav.relatorios`
 *                    além do padrão do perfil (demonstra ALLOW).
 *  - Visualizador  → enxerga a sidebar quase inteira, mas nenhuma ação
 *                    administrativa (sem `configuracoes.usuarios`/`users.*`).
 *  - Financeiro    → fatia vertical estreita (só Dashboard + Financeiro).
 *  - Suporte       → outra fatia vertical estreita (Atividades + Comunicação
 *                    + Operações), para validar que grupos de menu sem
 *                    nenhum item liberado somem por completo da sidebar.
 */
export const systemProfiles = [
  {
    code: 'OWNER',
    name: 'Owner',
    description: 'Acesso total ao sistema.',
  },
  {
    code: 'ADMIN',
    name: 'Administrador',
    description: 'Administrador da conta — acesso amplo, exceto excluir usuários.',
  },
  {
    code: 'MANAGER',
    name: 'Gerente',
    description: 'Gerencia usuários e operações do dia a dia, com escopo intermediário.',
  },
  {
    code: 'USER',
    name: 'Usuário',
    description: 'Usuário padrão, com acesso mínimo ao portal.',
  },
  {
    code: 'VIEWER',
    name: 'Visualizador',
    description: 'Enxerga a maior parte do portal em modo leitura, sem nenhuma ação administrativa.',
  },
  {
    code: 'FINANCE',
    name: 'Financeiro',
    description: 'Acesso restrito ao Dashboard e ao módulo Financeiro.',
  },
  {
    code: 'SUPPORT',
    name: 'Suporte',
    description: 'Acesso restrito a Atividades, Comunicação e Operações.',
  },
];
