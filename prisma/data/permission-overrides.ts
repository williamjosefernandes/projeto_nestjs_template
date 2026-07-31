import { PermissionEffect } from '@prisma/client';

export const permissionOverrides = [
  {
    profileName: 'Usuário',
    permissionCode: 'dashboard.financeiro.visualizar',
    effect: PermissionEffect.DENY,
  },
  {
    profileName: 'Gerente',
    permissionCode: 'settings.update',
    effect: PermissionEffect.DENY,
  }
];
