import { UserStatus } from '@prisma/client';

/**
 * Todos os usuários abaixo usam a senha `password123` (hash único calculado
 * em `users.seed.ts` — o campo `password` aqui não é lido pela seed, existe
 * só para leitura humana). `status`/`emailVerified` são opcionais — quando
 * omitidos, o usuário fica `ACTIVE` com e-mail verificado (comportamento
 * anterior, inalterado). Roteiro completo de cada cenário em `prisma/SEED.md`.
 */
export const systemUsers: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  status?: UserStatus;
  emailVerified?: boolean;
}[] = [
  {
    firstName: 'Admin',
    lastName: 'MadeCoders',
    email: 'williamjosefernandes@gmail.com',
    password: 'password123',
  },

  // Users for Acme Corp
  {
    firstName: 'Alice',
    lastName: 'Acme',
    email: 'alice@acmecorp.com',
    password: 'password123',
  },
  {
    firstName: 'Bob',
    lastName: 'Acme',
    email: 'bob@acmecorp.com',
    password: 'password123',
  },

  // Users for Global Tech
  {
    firstName: 'Charlie',
    lastName: 'Global',
    email: 'charlie@globaltech.com',
    password: 'password123',
  },

  // Users for Stark Industries
  {
    firstName: 'Tony',
    lastName: 'Stark',
    email: 'tony@stark.com',
    password: 'password123',
  },

  // Customers
  {
    firstName: 'João',
    lastName: 'Silva',
    email: 'joao@email.com',
    password: 'password123',
  },
  {
    firstName: 'Maria',
    lastName: 'Souza',
    email: 'maria@email.com',
    password: 'password123',
  },

  // ── Cenários extras de RBAC/sessão (ver prisma/SEED.md) ──

  // Multi-conta: Administrador na Acme, Visualizador na Global Tech, e um
  // vínculo SUSPENSO na Stark (não deve aparecer em accounts[] no login).
  {
    firstName: 'Diana',
    lastName: 'Prince',
    email: 'diana@acmecorp.com',
    password: 'password123',
  },
  // Perfil Visualizador puro.
  {
    firstName: 'Victor',
    lastName: 'Reader',
    email: 'victor@acmecorp.com',
    password: 'password123',
  },
  // Perfil Financeiro (fatia vertical estreita).
  {
    firstName: 'Fernanda',
    lastName: 'Finance',
    email: 'fernanda@acmecorp.com',
    password: 'password123',
  },
  // Perfil Suporte (outra fatia vertical estreita).
  {
    firstName: 'Saulo',
    lastName: 'Support',
    email: 'saulo@acmecorp.com',
    password: 'password123',
  },
  // Usuário BLOQUEADO — login deve falhar com ACCOUNT_INACTIVE.
  {
    firstName: 'Bloqueado',
    lastName: 'Teste',
    email: 'bloqueado@acmecorp.com',
    password: 'password123',
    status: UserStatus.BLOCKED,
  },
  // Usuário SUSPENSO — login deve falhar com ACCOUNT_INACTIVE.
  {
    firstName: 'Suspenso',
    lastName: 'Teste',
    email: 'suspenso@acmecorp.com',
    password: 'password123',
    status: UserStatus.SUSPENDED,
  },
  // Cadastro incompleto (equivalente a quem se registrou e não confirmou o
  // e-mail) — login deve falhar com ACCOUNT_INACTIVE (status != ACTIVE).
  {
    firstName: 'Pendente',
    lastName: 'Verificacao',
    email: 'pendente@acmecorp.com',
    password: 'password123',
    status: UserStatus.PENDING_EMAIL,
    emailVerified: false,
  },
  // ACTIVE mas sem `emailVerifiedAt` — combinação que só existe via seed (o
  // fluxo real sempre marca os dois campos juntos em `verifyEmail`). Único
  // jeito de exercitar o branch UNVERIFIED_EMAIL de `auth.service.ts::login`.
  {
    firstName: 'NaoVerificado',
    lastName: 'Teste',
    email: 'naoverificado@acmecorp.com',
    password: 'password123',
    status: UserStatus.ACTIVE,
    emailVerified: false,
  },
  // Usuário ACTIVE normal, mas com vínculo INVITED na Acme (ver memberships.ts)
  // — login funciona, mas a Acme não aparece em accounts[].
  {
    firstName: 'Convidado',
    lastName: 'Teste',
    email: 'convidado@acmecorp.com',
    password: 'password123',
  },
  // Usuário ACTIVE normal, mas com vínculo REMOVED na Acme (soft delete) —
  // login funciona, mas a Acme não aparece em accounts[].
  {
    firstName: 'Removido',
    lastName: 'Teste',
    email: 'removido@acmecorp.com',
    password: 'password123',
  },
  // Owner de uma conta INATIVA (Wayne Enterprises, active: false) — login e
  // switch-account funcionam, mas qualquer endpoint com MembershipGuard
  // (ex.: administração de usuários) falha com ACCOUNT_INACTIVE.
  {
    firstName: 'Bruce',
    lastName: 'Wayne',
    email: 'bruce@wayne.com',
    password: 'password123',
  },
  // Duas identidades bem diferentes: Financeiro na Acme (só Dashboard +
  // Financeiro) e Suporte na Global Tech (só Dashboard + Atividades +
  // Comunicação + Operações) — sidebar e widgets do Dashboard mudam por
  // completo ao trocar de conta. Ver "Cenário dedicado" em prisma/SEED.md.
  {
    firstName: 'Clark',
    lastName: 'Kent',
    email: 'clark@acmecorp.com',
    password: 'password123',
  },
  // Owner da Acme, além da Alice (Administradora) — permite testar pela UI a
  // proteção CANNOT_DELETE_OWNER/CANNOT_BLOCK_OWNER: logada como Alice, tentar
  // excluir a Olivia ou mudar o status dela para Suspenso/Removido deve falhar.
  {
    firstName: 'Olivia',
    lastName: 'Owner',
    email: 'olivia@acmecorp.com',
    password: 'password123',
  },
];
