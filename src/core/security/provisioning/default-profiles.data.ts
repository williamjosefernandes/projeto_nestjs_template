import { PermissionEffect } from '@prisma/client';

/**
 * Fonte única de verdade dos 7 perfis padrão criados para TODA conta nova —
 * tanto pelo seed de desenvolvimento (`prisma/seeds/profiles.seed.ts`, que
 * roda para as contas mockadas) quanto em runtime, pelo onboarding real
 * (`default-profiles.provisioner.ts`, chamado por `OnboardingService`).
 * Antes vivia só em `prisma/data/*.ts` (lido apenas pelo script de seed,
 * fora do container Nest) — extraído pra cá porque o onboarding também
 * precisa provisionar perfis para a conta recém-criada, sem duplicar a
 * matriz de permissões em dois lugares.
 *
 * `code` não é persistido — é só documentação; o "código" exposto ao
 * frontend (`CurrentProfileDto.code`) é `profile.name.toUpperCase()`,
 * calculado em `auth.service.ts::loadContext`.
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

/**
 * Matriz base de permissões por perfil (`profile` = `Profile.name`). `'*'`
 * (só o Owner) concede todas as permissões cadastradas em `permissions.ts`.
 * Efeito final de cada perfil = esta lista, ajustada pelos overrides de
 * `permissionOverrides` abaixo.
 */
export const profilePermissions = [
  {
    profile: 'Owner',
    permissions: ['*'],
  },
  {
    profile: 'Administrador',
    permissions: [
      'nav.dashboard',
      'nav.visao-geral',
      'nav.relatorios',
      'nav.atividades',
      'nav.calendario',
      'dashboard.indicadores.visualizar',
      'dashboard.desempenho.visualizar',
      'dashboard.atividades.visualizar',
      'dashboard.agenda.visualizar',
      'dashboard.notificacoes.visualizar',
      'dashboard.top_produtos.visualizar',
      'dashboard.financeiro.visualizar',
      'dashboard.indicadores.receita',
      'dashboard.indicadores.novos_clientes',
      'dashboard.indicadores.aulas_agendadas',
      'dashboard.indicadores.conversoes',
      'cadastros.alunos',
      'cadastros.instrutores',
      'cadastros.veiculos',
      'financeiro.receitas',
      'financeiro.despesas',
      'financeiro.faturas',
      'comunicacao.mensagens',
      'comunicacao.notificacoes',
      'operacoes.aulas',
      'operacoes.frota',
      'marketing.campanhas',
      'marketing.promocoes',
      'configuracoes.geral',
      'configuracoes.usuarios',
      'users.read',
      'users.create',
      'users.update',
      // 'users.delete' de propósito fora — só Owner exclui usuários.
    ],
  },
  {
    profile: 'Gerente',
    permissions: [
      'nav.dashboard',
      'nav.relatorios',
      'nav.atividades',
      'dashboard.indicadores.visualizar',
      'dashboard.desempenho.visualizar',
      'dashboard.atividades.visualizar',
      'dashboard.agenda.visualizar',
      'dashboard.financeiro.visualizar',
      'dashboard.indicadores.receita',
      'dashboard.indicadores.novos_clientes',
      'cadastros.alunos',
      'cadastros.instrutores',
      'financeiro.receitas',
      'financeiro.despesas',
      'configuracoes.usuarios',
      'users.read',
      'users.update', // revogado em runtime pelo override DENY do perfil Gerente.
    ],
  },
  {
    profile: 'Usuário',
    permissions: [
      'nav.dashboard',
      'dashboard.indicadores.visualizar',
      'dashboard.agenda.visualizar',
      'dashboard.notificacoes.visualizar',
    ],
  },
  {
    profile: 'Visualizador',
    permissions: [
      'nav.dashboard',
      'nav.visao-geral',
      'nav.relatorios',
      'nav.atividades',
      'nav.calendario',
      'dashboard.indicadores.visualizar',
      'dashboard.desempenho.visualizar',
      'dashboard.atividades.visualizar',
      'dashboard.agenda.visualizar',
      'dashboard.notificacoes.visualizar',
      'dashboard.top_produtos.visualizar',
      'dashboard.financeiro.visualizar',
      'dashboard.indicadores.receita',
      'dashboard.indicadores.novos_clientes',
      'dashboard.indicadores.aulas_agendadas',
      'dashboard.indicadores.conversoes',
      'cadastros.alunos',
      'cadastros.instrutores',
      'cadastros.veiculos',
      'financeiro.receitas',
      'financeiro.despesas',
      'financeiro.faturas',
      'comunicacao.mensagens',
      'comunicacao.notificacoes',
      'operacoes.aulas',
      'operacoes.frota',
      'marketing.campanhas',
      'marketing.promocoes', // revogado em runtime pelo override DENY do perfil Visualizador.
      'configuracoes.geral',
    ],
  },
  {
    profile: 'Financeiro',
    permissions: [
      'nav.dashboard',
      'dashboard.indicadores.visualizar',
      'dashboard.financeiro.visualizar',
      'dashboard.indicadores.receita',
      'financeiro.receitas',
      'financeiro.despesas',
      'financeiro.faturas',
    ],
  },
  {
    profile: 'Suporte',
    permissions: [
      'nav.dashboard',
      'nav.atividades',
      'dashboard.atividades.visualizar',
      'dashboard.notificacoes.visualizar',
      'comunicacao.mensagens',
      'comunicacao.notificacoes',
      'operacoes.aulas',
    ],
  },
];

/**
 * Overrides por perfil — `AuthorizationService.calculatePermissions`: `DENY`
 * remove o código do resultado final mesmo que o perfil o conceda por
 * padrão; `ALLOW` adiciona o código mesmo que o perfil não o conceda.
 */
export const permissionOverrides = [
  {
    profileName: 'Gerente',
    permissionCode: 'users.update',
    effect: PermissionEffect.DENY,
  },
  {
    profileName: 'Usuário',
    permissionCode: 'nav.relatorios',
    effect: PermissionEffect.ALLOW,
  },
  {
    profileName: 'Visualizador',
    permissionCode: 'marketing.promocoes',
    effect: PermissionEffect.DENY,
  },
  {
    profileName: 'Financeiro',
    permissionCode: 'cadastros.alunos',
    effect: PermissionEffect.ALLOW,
  },
];
