import { TypePermission } from '@prisma/client';

export const permissions = [
  // Dashboard
  {
    module: 'Dashboard',
    code: 'menu.dashboard',
    name: 'Menu Dashboard',
    description: 'Permite acessar o menu dashboard.',
    type: TypePermission.MENU,
  },
  {
    module: 'Dashboard',
    code: 'dashboard.finances.chart',
    name: 'Gráfico de Finanças',
    description: 'Visualizar gráfico de finanças na dashboard.',
    type: TypePermission.COMPONENT,
  },
  {
    module: 'Dashboard',
    code: 'dashboard.metrics.view',
    name: 'Métricas da Dashboard',
    description: 'Carrega os indicadores da dashboard.',
    type: TypePermission.API,
  },

  // Users
  {
    module: 'Users',
    code: 'menu.users',
    name: 'Menu Usuários',
    description: 'Acessar tela de usuários.',
    type: TypePermission.MENU,
  },
  {
    module: 'Users',
    code: 'users.read',
    name: 'Visualizar Usuários',
    description: 'Permite listar usuários via API.',
    type: TypePermission.API,
  },
  {
    module: 'Users',
    code: 'users.create',
    name: 'Criar Usuários',
    description: 'Permite criar usuários.',
    type: TypePermission.API,
  },
  {
    module: 'Users',
    code: 'users.update',
    name: 'Editar Usuários',
    description: 'Permite editar usuários.',
    type: TypePermission.API,
  },
  {
    module: 'Users',
    code: 'users.delete',
    name: 'Excluir Usuários',
    description: 'Permite excluir usuários.',
    type: TypePermission.API,
  },

  // Profiles
  {
    module: 'Profiles',
    code: 'menu.profiles',
    name: 'Menu Perfis',
    description: 'Acessar tela de perfis.',
    type: TypePermission.MENU,
  },
  {
    module: 'Profiles',
    code: 'profiles.read',
    name: 'Visualizar Perfis',
    description: 'Permite visualizar perfis.',
    type: TypePermission.API,
  },
  {
    module: 'Profiles',
    code: 'profiles.create',
    name: 'Criar Perfis',
    description: 'Permite criar perfis.',
    type: TypePermission.API,
  },
  {
    module: 'Profiles',
    code: 'profiles.update',
    name: 'Editar Perfis',
    description: 'Permite editar perfis.',
    type: TypePermission.API,
  },
  {
    module: 'Profiles',
    code: 'profiles.delete',
    name: 'Excluir Perfis',
    description: 'Permite excluir perfis.',
    type: TypePermission.API,
  },

  // Company
  {
    module: 'Company',
    code: 'menu.company',
    name: 'Menu Empresa',
    description: 'Acessar configurações da empresa.',
    type: TypePermission.MENU,
  },
  {
    module: 'Company',
    code: 'company.read',
    name: 'Visualizar Empresa',
    description: 'Permite visualizar dados da empresa.',
    type: TypePermission.API,
  },
  {
    module: 'Company',
    code: 'company.update',
    name: 'Editar Empresa',
    description: 'Permite editar dados da empresa.',
    type: TypePermission.API,
  },

  // Settings
  {
    module: 'Settings',
    code: 'menu.settings',
    name: 'Menu Configurações',
    description: 'Acessar tela de configurações.',
    type: TypePermission.MENU,
  },
  {
    module: 'Settings',
    code: 'settings.read',
    name: 'Visualizar Configurações',
    description: 'Permite visualizar configurações.',
    type: TypePermission.API,
  },
  {
    module: 'Settings',
    code: 'settings.update',
    name: 'Editar Configurações',
    description: 'Permite alterar configurações.',
    type: TypePermission.API,
  },
];