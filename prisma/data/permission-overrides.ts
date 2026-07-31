import { PermissionEffect } from '@prisma/client';

/**
 * Overrides por perfil — aplicados por cima da matriz base de
 * `profile-permissions.ts` (`AuthorizationService.calculatePermissions`:
 * `DENY` remove o código do resultado final mesmo que o perfil o conceda por
 * padrão; `ALLOW` adiciona o código mesmo que o perfil não o conceda).
 * Cobre os dois efeitos, em perfis diferentes, para servir de exemplo real
 * de teste (ver `prisma/SEED.md`).
 */
export const permissionOverrides = [
  // DENY — Gerente tem 'users.update' na lista base (profile-permissions.ts),
  // mas o override revoga: consegue ver a tela de usuários, não consegue editar.
  {
    profileName: 'Gerente',
    permissionCode: 'users.update',
    effect: PermissionEffect.DENY,
  },

  // ALLOW — Usuário não tem 'nav.relatorios' na lista base; o override
  // concede esse item extra de menu só para este perfil.
  {
    profileName: 'Usuário',
    permissionCode: 'nav.relatorios',
    effect: PermissionEffect.ALLOW,
  },

  // DENY — Visualizador vê o grupo "Marketing" inteiro, exceto Promoções
  // especificamente (o grupo continua visível por causa de 'marketing.campanhas').
  {
    profileName: 'Visualizador',
    permissionCode: 'marketing.promocoes',
    effect: PermissionEffect.DENY,
  },

  // ALLOW — Financeiro (fatia vertical estreita) ganha acesso extra e pontual
  // a 'cadastros.alunos', fora do seu escopo padrão.
  {
    profileName: 'Financeiro',
    permissionCode: 'cadastros.alunos',
    effect: PermissionEffect.ALLOW,
  },
];
