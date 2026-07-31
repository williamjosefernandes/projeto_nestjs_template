import { TypePermission } from '@prisma/client';

/**
 * Catálogo de permissões — cada `code` aqui é uma string usada literalmente
 * pelo frontend (`projeto_vite_template`) via `usePermission`/`PermissionGate`
 * (bloqueio de blocos) e `useVisibleMenu` (filtro da sidebar, que compara
 * `item.requiredPermission` contra `useAuthStore.permissions`).
 *
 * IMPORTANTE — todos os códigos abaixo são `TypePermission.API`, mesmo os que
 * representam item de menu ou bloco/widget de tela. Isso é proposital, não um
 * erro: `AuthorizationService.calculatePermissions` separa o resultado em três
 * arrays (`permissions`/`menus`/`components`) conforme `TypePermission`
 * (API/MENU/COMPONENT), mas o frontend hoje só lê `permissions[]` — tanto para
 * decidir o que aparece na sidebar (`useVisibleMenu`) quanto para os blocos
 * (`usePermission`/`PermissionGate`). Os primitivos `useMenu`/`MenuGuard` e
 * `useComponent`/`ComponentGuard` (que leriam `menus[]`/`components[]`) existem
 * no frontend mas não têm nenhum consumidor real ainda — usar `MENU`/`COMPONENT`
 * aqui faria esses códigos "sumirem" de `permissions[]` e quebraria a sidebar e
 * os widgets. Se `menus[]`/`components[]` ganharem um consumidor real no
 * futuro, popule-os com códigos adicionais — não reclassifique os existentes.
 *
 * Fonte da verdade dos códigos: `src/lib/menu-config.ts` (menu),
 * `src/modules/dashboard/dashboard.permissions.ts` (widgets do Dashboard) e
 * `src/users/users.controller.ts` (CRUD de usuários, também validado no
 * próprio backend via `@Permissions(...)` + `PermissionGuard`).
 */
export const permissions = [
  // ── Navegação (grupo "navegacao" de menu-config.ts, um code por item) ──
  { group: 'Navegação', code: 'nav.dashboard', name: 'Menu Dashboard', description: 'Exibir o item "Dashboard" na sidebar.', type: TypePermission.API },
  { group: 'Navegação', code: 'nav.visao-geral', name: 'Menu Visão Geral', description: 'Exibir o item "Visão Geral" na sidebar.', type: TypePermission.API },
  { group: 'Navegação', code: 'nav.relatorios', name: 'Menu Relatórios', description: 'Exibir o item "Relatórios" na sidebar.', type: TypePermission.API },
  { group: 'Navegação', code: 'nav.atividades', name: 'Menu Atividades', description: 'Exibir o item "Atividades" na sidebar.', type: TypePermission.API },
  { group: 'Navegação', code: 'nav.calendario', name: 'Menu Calendário', description: 'Exibir o item "Calendário" na sidebar.', type: TypePermission.API },

  // ── Dashboard — seções/widgets (DASHBOARD_PERMISSIONS) ──
  { group: 'Dashboard', code: 'dashboard.indicadores.visualizar', name: 'Indicadores', description: 'Visualizar a seção de indicadores (StatCards) do Dashboard.', type: TypePermission.API },
  { group: 'Dashboard', code: 'dashboard.desempenho.visualizar', name: 'Desempenho', description: 'Visualizar o card de desempenho do Dashboard.', type: TypePermission.API },
  { group: 'Dashboard', code: 'dashboard.atividades.visualizar', name: 'Atividades Recentes', description: 'Visualizar o card de atividades recentes do Dashboard.', type: TypePermission.API },
  { group: 'Dashboard', code: 'dashboard.agenda.visualizar', name: 'Agenda de Hoje', description: 'Visualizar o card de agenda do Dashboard.', type: TypePermission.API },
  { group: 'Dashboard', code: 'dashboard.notificacoes.visualizar', name: 'Notificações', description: 'Visualizar o card de notificações do Dashboard.', type: TypePermission.API },
  { group: 'Dashboard', code: 'dashboard.top_produtos.visualizar', name: 'Top Produtos', description: 'Visualizar a tabela de top produtos do Dashboard.', type: TypePermission.API },
  { group: 'Dashboard', code: 'dashboard.financeiro.visualizar', name: 'Resumo Financeiro', description: 'Visualizar o card de resumo financeiro do Dashboard.', type: TypePermission.API },

  // ── Dashboard — StatCards individuais (STAT_CARD_PERMISSIONS) ──
  { group: 'Dashboard', code: 'dashboard.indicadores.receita', name: 'Indicador: Receita do mês', description: 'Visualizar o StatCard de receita do mês.', type: TypePermission.API },
  { group: 'Dashboard', code: 'dashboard.indicadores.novos_clientes', name: 'Indicador: Novos clientes', description: 'Visualizar o StatCard de novos clientes.', type: TypePermission.API },
  { group: 'Dashboard', code: 'dashboard.indicadores.aulas_agendadas', name: 'Indicador: Aulas agendadas', description: 'Visualizar o StatCard de aulas agendadas.', type: TypePermission.API },
  { group: 'Dashboard', code: 'dashboard.indicadores.conversoes', name: 'Indicador: Conversões', description: 'Visualizar o StatCard de conversões.', type: TypePermission.API },

  // ── Cadastros (grupo "cadastros" de menu-config.ts) ──
  { group: 'Cadastros', code: 'cadastros.alunos', name: 'Menu Alunos', description: 'Exibir o item "Alunos" na sidebar.', type: TypePermission.API },
  { group: 'Cadastros', code: 'cadastros.instrutores', name: 'Menu Instrutores', description: 'Exibir o item "Instrutores" na sidebar.', type: TypePermission.API },
  { group: 'Cadastros', code: 'cadastros.veiculos', name: 'Menu Veículos', description: 'Exibir o item "Veículos" na sidebar.', type: TypePermission.API },

  // ── Financeiro (grupo "financeiro" de menu-config.ts) ──
  { group: 'Financeiro', code: 'financeiro.receitas', name: 'Menu Receitas', description: 'Exibir o item "Receitas" na sidebar.', type: TypePermission.API },
  { group: 'Financeiro', code: 'financeiro.despesas', name: 'Menu Despesas', description: 'Exibir o item "Despesas" na sidebar.', type: TypePermission.API },
  { group: 'Financeiro', code: 'financeiro.faturas', name: 'Menu Faturas', description: 'Exibir o item "Faturas" na sidebar.', type: TypePermission.API },

  // ── Comunicação (grupo "comunicacao" de menu-config.ts) ──
  { group: 'Comunicação', code: 'comunicacao.mensagens', name: 'Menu Mensagens', description: 'Exibir o item "Mensagens" na sidebar.', type: TypePermission.API },
  { group: 'Comunicação', code: 'comunicacao.notificacoes', name: 'Menu Notificações', description: 'Exibir o item "Notificações" (Comunicação) na sidebar.', type: TypePermission.API },

  // ── Operações (grupo "operacoes" de menu-config.ts) ──
  { group: 'Operações', code: 'operacoes.aulas', name: 'Menu Aulas', description: 'Exibir o item "Aulas" na sidebar.', type: TypePermission.API },
  { group: 'Operações', code: 'operacoes.frota', name: 'Menu Frota', description: 'Exibir o item "Frota" na sidebar.', type: TypePermission.API },

  // ── Marketing (grupo "marketing" de menu-config.ts) ──
  { group: 'Marketing', code: 'marketing.campanhas', name: 'Menu Campanhas', description: 'Exibir o item "Campanhas" na sidebar.', type: TypePermission.API },
  { group: 'Marketing', code: 'marketing.promocoes', name: 'Menu Promoções', description: 'Exibir o item "Promoções" na sidebar.', type: TypePermission.API },

  // ── Configurações (grupo "configuracoes" de menu-config.ts) ──
  { group: 'Configurações', code: 'configuracoes.geral', name: 'Menu Configurações Gerais', description: 'Exibir o item "Geral" na sidebar.', type: TypePermission.API },
  { group: 'Configurações', code: 'configuracoes.usuarios', name: 'Menu Usuários (Configurações)', description: 'Exibir o item "Usuários" na sidebar — abre a tela de administração de usuários.', type: TypePermission.API },

  // ── Usuários — CRUD administrativo (também validado por @Permissions() no UsersController) ──
  { group: 'Usuários', code: 'users.read', name: 'Visualizar Usuários', description: 'Listar/visualizar usuários da conta via API.', type: TypePermission.API },
  { group: 'Usuários', code: 'users.create', name: 'Criar Usuários', description: 'Convidar/criar usuários na conta via API.', type: TypePermission.API },
  { group: 'Usuários', code: 'users.update', name: 'Editar Usuários', description: 'Editar dados/status de usuários da conta via API.', type: TypePermission.API },
  { group: 'Usuários', code: 'users.delete', name: 'Excluir Usuários', description: 'Remover (soft delete) usuários da conta via API.', type: TypePermission.API },
];
