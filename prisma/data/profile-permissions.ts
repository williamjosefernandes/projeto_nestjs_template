export const profilePermissions = [
  {
    profile: 'Owner',
    permissions: ['*'],
  },

  {
    profile: 'Administrador',
    permissions: [
      'menu.dashboard',
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

      'menu.users',
      'users.read',
      'users.create',
      'users.update',
      'users.delete',

      'menu.profiles',
      'profiles.read',
      'profiles.create',
      'profiles.update',

      'menu.company',
      'company.read',
      'company.update',

      'menu.settings',
      'settings.read',
      'settings.update',
    ],
  },

  {
    profile: 'Gerente',
    permissions: [
      'menu.dashboard',
      'dashboard.indicadores.visualizar',
      'dashboard.desempenho.visualizar',
      'dashboard.atividades.visualizar',
      'dashboard.agenda.visualizar',
      'dashboard.financeiro.visualizar',
      'dashboard.indicadores.receita',
      'dashboard.indicadores.novos_clientes',

      'menu.users',
      'users.read',
      'users.update',

      'menu.company',
      'company.read',
    ],
  },

  {
    profile: 'Usuário',
    permissions: [
      'menu.dashboard',
      'dashboard.indicadores.visualizar',
      'dashboard.agenda.visualizar',
      'dashboard.notificacoes.visualizar',

    ],
  },
];