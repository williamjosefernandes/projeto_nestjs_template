import { TypePermission } from '@prisma/client';

export const permissions = [
  // Dashboard - Blocos Gerais
  { group: 'Dashboard', code: 'menu.dashboard', name: 'Menu Dashboard', description: 'Acessar menu dashboard.', type: TypePermission.MENU },
  { group: 'Dashboard', code: 'dashboard.indicadores.visualizar', name: 'Indicadores', description: 'Visualizar indicadores da dashboard', type: TypePermission.COMPONENT },
  { group: 'Dashboard', code: 'dashboard.desempenho.visualizar', name: 'Desempenho', description: 'Visualizar desempenho', type: TypePermission.COMPONENT },
  { group: 'Dashboard', code: 'dashboard.atividades.visualizar', name: 'Atividades Recentes', description: 'Visualizar atividades recentes', type: TypePermission.COMPONENT },
  { group: 'Dashboard', code: 'dashboard.agenda.visualizar', name: 'Agenda de Hoje', description: 'Visualizar agenda', type: TypePermission.COMPONENT },
  { group: 'Dashboard', code: 'dashboard.notificacoes.visualizar', name: 'Notificações', description: 'Visualizar notificações', type: TypePermission.COMPONENT },
  { group: 'Dashboard', code: 'dashboard.top_produtos.visualizar', name: 'Top Produtos', description: 'Visualizar top produtos', type: TypePermission.COMPONENT },
  { group: 'Dashboard', code: 'dashboard.financeiro.visualizar', name: 'Resumo Financeiro', description: 'Visualizar resumo financeiro', type: TypePermission.COMPONENT },

  // Dashboard - StatCards Individuais
  { group: 'Dashboard', code: 'dashboard.indicadores.receita', name: 'Indicador Receita', description: 'Visualizar indicador de receita', type: TypePermission.COMPONENT },
  { group: 'Dashboard', code: 'dashboard.indicadores.novos_clientes', name: 'Indicador Clientes', description: 'Visualizar indicador novos clientes', type: TypePermission.COMPONENT },
  { group: 'Dashboard', code: 'dashboard.indicadores.aulas_agendadas', name: 'Indicador Aulas', description: 'Visualizar indicador aulas agendadas', type: TypePermission.COMPONENT },
  { group: 'Dashboard', code: 'dashboard.indicadores.conversoes', name: 'Indicador Conversões', description: 'Visualizar indicador de conversões', type: TypePermission.COMPONENT },

  // Users
  {
    group: 'Users',
    code: 'menu.users',
    name: 'Menu Usuários',
    description: 'Acessar tela de usuários.',
    type: TypePermission.MENU,
  },
  {
    group: 'Users',
    code: 'users.read',
    name: 'Visualizar Usuários',
    description: 'Permite listar usuários via API.',
    type: TypePermission.API,
  },
  {
    group: 'Users',
    code: 'users.create',
    name: 'Criar Usuários',
    description: 'Permite criar usuários.',
    type: TypePermission.API,
  },
  {
    group: 'Users',
    code: 'users.update',
    name: 'Editar Usuários',
    description: 'Permite editar usuários.',
    type: TypePermission.API,
  },
  {
    group: 'Users',
    code: 'users.delete',
    name: 'Excluir Usuários',
    description: 'Permite excluir usuários.',
    type: TypePermission.API,
  },

  // Profiles
  {
    group: 'Profiles',
    code: 'menu.profiles',
    name: 'Menu Perfis',
    description: 'Acessar tela de perfis.',
    type: TypePermission.MENU,
  },
  {
    group: 'Profiles',
    code: 'profiles.read',
    name: 'Visualizar Perfis',
    description: 'Permite visualizar perfis.',
    type: TypePermission.API,
  },
  {
    group: 'Profiles',
    code: 'profiles.create',
    name: 'Criar Perfis',
    description: 'Permite criar perfis.',
    type: TypePermission.API,
  },
  {
    group: 'Profiles',
    code: 'profiles.update',
    name: 'Editar Perfis',
    description: 'Permite editar perfis.',
    type: TypePermission.API,
  },
  {
    group: 'Profiles',
    code: 'profiles.delete',
    name: 'Excluir Perfis',
    description: 'Permite excluir perfis.',
    type: TypePermission.API,
  },

  // Company
  {
    group: 'Company',
    code: 'menu.company',
    name: 'Menu Empresa',
    description: 'Acessar configurações da empresa.',
    type: TypePermission.MENU,
  },
  {
    group: 'Company',
    code: 'company.read',
    name: 'Visualizar Empresa',
    description: 'Permite visualizar dados da empresa.',
    type: TypePermission.API,
  },
  {
    group: 'Company',
    code: 'company.update',
    name: 'Editar Empresa',
    description: 'Permite editar dados da empresa.',
    type: TypePermission.API,
  },

  // Settings
  {
    group: 'Settings',
    code: 'menu.settings',
    name: 'Menu Configurações',
    description: 'Acessar tela de configurações.',
    type: TypePermission.MENU,
  },
  {
    group: 'Settings',
    code: 'settings.read',
    name: 'Visualizar Configurações',
    description: 'Permite visualizar configurações.',
    type: TypePermission.API,
  },
  {
    group: 'Settings',
    code: 'settings.update',
    name: 'Editar Configurações',
    description: 'Permite alterar configurações.',
    type: TypePermission.API,
  },
];