/**
 * Grupos de permissão — organizam `permissions.ts` na UI de administração
 * (quando existir) e espelham 1:1 os grupos de menu de
 * `projeto_vite_template/src/lib/menu-config.ts`, mais "Dashboard" (widgets
 * granulares da home) e "Usuários" (CRUD administrativo, sem item de menu
 * próprio — vive dentro de "Configurações").
 */
export const permissionGroups = [
  { name: 'Navegação' },
  { name: 'Dashboard' },
  { name: 'Cadastros' },
  { name: 'Financeiro' },
  { name: 'Comunicação' },
  { name: 'Operações' },
  { name: 'Marketing' },
  { name: 'Configurações' },
  { name: 'Usuários' },
];
