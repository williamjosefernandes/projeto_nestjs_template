export const profilePermissions = [
  {
    profile: 'Owner',
    permissions: ['*'],
  },

  {
    profile: 'Administrador',
    permissions: [
      'menu.dashboard',
      'dashboard.finances.chart',
      'dashboard.metrics.view',

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
      'dashboard.metrics.view',
      'dashboard.finances.chart',

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
      'dashboard.metrics.view',
    ],
  },
];