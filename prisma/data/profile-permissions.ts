/**
 * Matriz base de permissões por perfil (`profile` = `Profile.name`, aplicada
 * a TODA conta que tiver esse perfil — `profile-permissions.seed.ts` faz
 * `deleteMany` + reinsere a cada seed, então esta lista é a fonte única de
 * verdade, não um incremento). `'*'` (só o Owner) concede todas as
 * permissões cadastradas em `permissions.ts`.
 *
 * Efeito final de cada perfil = esta lista, ajustada pelos overrides de
 * `permission-overrides.ts` (ver arquivo — algumas lacunas propositais aqui
 * só existem para os overrides terem algo visível para revogar/conceder).
 * Roteiro de teste completo em `prisma/SEED.md`.
 */
export const profilePermissions = [
  {
    profile: 'Owner',
    permissions: ['*'],
  },

  // Acesso amplo — só não pode excluir usuários (só o Owner pode).
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

  // Acesso intermediário — o override de Gerente (ver permission-overrides.ts)
  // remove 'users.update' desta lista em runtime, para demonstrar um DENY.
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

  // Acesso mínimo — o override de Usuário (ver permission-overrides.ts)
  // concede 'nav.relatorios' além desta lista, para demonstrar um ALLOW.
  {
    profile: 'Usuário',
    permissions: [
      'nav.dashboard',
      'dashboard.indicadores.visualizar',
      'dashboard.agenda.visualizar',
      'dashboard.notificacoes.visualizar',
    ],
  },

  // Enxerga quase tudo, mas nunca administra (sem configuracoes.usuarios/users.*).
  // O override de Visualizador remove 'marketing.promocoes' desta lista.
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

  // Fatia vertical estreita: só Dashboard + Financeiro. O override concede
  // 'cadastros.alunos' além desta lista, para demonstrar um ALLOW pontual.
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

  // Outra fatia vertical estreita: Atividades + Comunicação + Operações —
  // grupos inteiros como Cadastros/Financeiro/Marketing/Configurações somem
  // da sidebar para este perfil (nenhum item liberado neles).
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
