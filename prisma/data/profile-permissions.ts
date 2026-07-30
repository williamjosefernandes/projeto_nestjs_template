export const profilePermissions = [
  {
    profile: 'Owner',
    permissions: ['*'],
  },

  {
    profile: 'Administrador',
    permissions: [
      'dashboard.view',

      'users.read',
      'users.create',
      'users.update',
      'users.delete',

      'profiles.read',
      'profiles.create',
      'profiles.update',

      'company.read',
      'company.update',

      'settings.read',
      'settings.update',
    ],
  },

  {
    profile: 'Gerente',
    permissions: [
      'dashboard.view',

      'users.read',
      'users.update',

      'company.read',
    ],
  },

  {
    profile: 'Usuário',
    permissions: [
      'dashboard.view',
    ],
  },
];