# Massa de teste — RBAC (permissões, menus, contas, usuários)

Este documento descreve os dados gerados por `npx prisma db seed` (ou `npm run migrations`, que roda `prisma migrate reset --force` + seed). Objetivo: alinhar as permissões do backend exatamente com o que `projeto_vite_template` consome (sidebar via `menu-config.ts`, widgets do Dashboard via `dashboard.permissions.ts`, CRUD de usuários via `UsersController`), e oferecer cenários prontos para testar login, troca de conta, RBAC e a tela `/configuracoes/usuarios`.

Todos os usuários abaixo usam a senha **`password123`**.

## 1. Por que todas as permissões são `TypePermission.API`

O frontend só lê o array `permissions[]` de `CurrentAccountDto` — tanto para filtrar a sidebar (`useVisibleMenu`, que compara `item.requiredPermission` contra `permissions[]`) quanto para os blocos/widgets (`usePermission`/`PermissionGate`). Os arrays `menus[]`/`components[]` (preenchidos a partir de `TypePermission.MENU`/`COMPONENT`) existem no contrato da API e têm primitivos prontos no frontend (`useMenu`/`MenuGuard`, `useComponent`/`ComponentGuard`), mas **nenhum tem consumidor real hoje** — por isso `prisma/data/permissions.ts` classifica tudo como `API`. Se um desses primitivos ganhar uso real no futuro, adicione códigos novos com o tipo correspondente; não reclassifique os existentes (quebraria a sidebar/os widgets imediatamente).

## 2. Catálogo de permissões (34 códigos, todos `API`)

| Grupo | Códigos |
|---|---|
| Navegação | `nav.dashboard`, `nav.visao-geral`, `nav.relatorios`, `nav.atividades`, `nav.calendario` |
| Dashboard | `dashboard.indicadores.visualizar`, `dashboard.desempenho.visualizar`, `dashboard.atividades.visualizar`, `dashboard.agenda.visualizar`, `dashboard.notificacoes.visualizar`, `dashboard.top_produtos.visualizar`, `dashboard.financeiro.visualizar`, `dashboard.indicadores.receita`, `dashboard.indicadores.novos_clientes`, `dashboard.indicadores.aulas_agendadas`, `dashboard.indicadores.conversoes` |
| Cadastros | `cadastros.alunos`, `cadastros.instrutores`, `cadastros.veiculos` |
| Financeiro | `financeiro.receitas`, `financeiro.despesas`, `financeiro.faturas` |
| Comunicação | `comunicacao.mensagens`, `comunicacao.notificacoes` |
| Operações | `operacoes.aulas`, `operacoes.frota` |
| Marketing | `marketing.campanhas`, `marketing.promocoes` |
| Configurações | `configuracoes.geral`, `configuracoes.usuarios` |
| Usuários | `users.read`, `users.create`, `users.update`, `users.delete` (também exigidos pelo próprio backend via `@Permissions()` em `UsersController`) |

## 3. Perfis e matriz de acesso

Perfis são criados automaticamente em **toda conta** (`profiles.seed.ts`). A matriz abaixo é o resultado final (base de `profile-permissions.ts` já ajustada pelos overrides de `permission-overrides.ts`):

| Perfil | Navegação visível | Dashboard | Cadastros/Financeiro/Comunicação/Operações/Marketing | Configurações | Usuários (API) |
|---|---|---|---|---|---|
| **Owner** | tudo | tudo | tudo | tudo | `read/create/update/delete` |
| **Administrador** | tudo | tudo | tudo | `geral` + `usuarios` | `read/create/update` (sem `delete`) |
| **Gerente** | dashboard, relatórios, atividades | indicadores, desempenho, atividades, agenda, financeiro, receita, novos clientes | `cadastros.alunos`/`instrutores`, `financeiro.receitas`/`despesas` | `usuarios` | `read` (**`update` negado por override** — vê a tela, não consegue editar) |
| **Usuário** | dashboard **+ relatórios (via override)** | indicadores, agenda, notificações | — | — | — |
| **Visualizador** | tudo | tudo | tudo, **exceto `marketing.promocoes` (override DENY)** | `geral` (sem `usuarios`) | — |
| **Financeiro** | dashboard | indicadores, financeiro, receita | `financeiro.*` **+ `cadastros.alunos` (override ALLOW)** | — | — |
| **Suporte** | dashboard, atividades | atividades, notificações | `comunicacao.*`, `operacoes.aulas` | — | — |

Efeito visual esperado na sidebar: grupos inteiros (Cadastros, Financeiro, Comunicação, Operações, Marketing) somem quando o perfil não tem nenhum item liberado neles — ex.: **Suporte** não vê os grupos Cadastros/Financeiro/Marketing; **Financeiro** não vê Comunicação/Operações/Marketing (e vê Cadastros só pelo item "Alunos", via override).

## 4. Contas

| Slug | Tipo | Status |
|---|---|---|
| `madecoders` | SYSTEM | ativa |
| `acme-corp` | COMPANY | ativa |
| `global-tech` | COMPANY | ativa |
| `stark-industries` | COMPANY | ativa |
| `wayne-enterprises` | COMPANY | **inativa** (`active: false`) |
| `joao-silva` | CUSTOMER | ativa |
| `maria-souza` | CUSTOMER | ativa |

## 5. Usuários e cenários de teste

| E-mail | Conta(s) / Perfil | Cenário a validar |
|---|---|---|
| `williamjosefernandes@gmail.com` | `madecoders` / Owner | Acesso total — sidebar completa, todos os widgets, CRUD de usuários completo (inclusive excluir). |
| `alice@acmecorp.com` | `acme-corp` / Administrador | Acesso amplo; botão "Excluir" some da tabela de usuários (sem `users.delete`), mas criar/editar/alterar status funcionam. |
| `bob@acmecorp.com` | `acme-corp` / Gerente | Vê `/configuracoes/usuarios`, mas a ação "Editar" some da linha (override nega `users.update`) — só "Alterar status"/nada mais, conforme permissão restante. |
| `charlie@globaltech.com` | `global-tech` / Administrador | Mesma validação de Alice, em outra conta — confirma que RBAC é por conta, não global. |
| `tony@stark.com` | `stark-industries` / Administrador | Idem. |
| `joao@email.com` | `joao-silva` / Usuário | Conta pessoal (CUSTOMER) — sidebar mínima (só Dashboard + Relatórios via override), sem nenhum admin. |
| `maria@email.com` | `maria-souza` / Usuário | Idem. |
| `diana@acmecorp.com` | `acme-corp` (Administrador, padrão) + `global-tech` (Visualizador) + `stark-industries` (Financeiro, **suspenso**) | Login mostra só 2 contas em "Minhas contas" (Acme + Global Tech) — Stark não aparece (vínculo `SUSPENDED`). Trocar de conta recalcula a sidebar/RBAC na hora (Admin na Acme, só-leitura na Global Tech). |
| `victor@acmecorp.com` | `acme-corp` / Visualizador | Sidebar quase completa, zero ações administrativas; item "Promoções" some do grupo Marketing (override DENY), mas "Campanhas" continua visível. |
| `fernanda@acmecorp.com` | `acme-corp` / Financeiro | Só vê Dashboard + Financeiro na sidebar, **mais "Alunos"** (override ALLOW pontual) — bom caso para confirmar que overrides funcionam mesmo fora do grupo "nativo" do perfil. |
| `saulo@acmecorp.com` | `acme-corp` / Suporte | Só vê Dashboard + Atividades; grupos Cadastros/Financeiro/Marketing/Configurações somem inteiros da sidebar. |
| `bloqueado@acmecorp.com` | `acme-corp` / Usuário, **status `BLOCKED`** | Login deve falhar com `ACCOUNT_INACTIVE` ("Esta conta está inativa..."). |
| `suspenso@acmecorp.com` | `acme-corp` / Usuário, **status `SUSPENDED`** | Idem — `ACCOUNT_INACTIVE`. |
| `pendente@acmecorp.com` | `acme-corp` / Usuário, **status `PENDING_EMAIL`**, e-mail não verificado | Login falha com `ACCOUNT_INACTIVE` (o backend checa `status !== ACTIVE` antes de checar e-mail verificado). Representa alguém que se cadastrou e não confirmou o código. |
| `naoverificado@acmecorp.com` | `acme-corp` / Usuário, **`ACTIVE` sem e-mail verificado** | Único jeito de ver o backend devolver `UNVERIFIED_EMAIL` de verdade — essa combinação não é alcançável pelo fluxo real (`register`/`verify-email` sempre marcam os dois campos juntos), só existe via seed. Login deve falhar com "Confirme seu e-mail antes de entrar." |
| `convidado@acmecorp.com` | `acme-corp` / Usuário, **vínculo `INVITED`** | Login funciona, mas a Acme **não aparece** em "Minhas contas" (só memberships `ACTIVE` entram em `accounts[]`). Simula um convite ainda não aceito. Como Owner/Admin, use "Alterar status" em `/configuracoes/usuarios` para mudar o vínculo dele para `ACTIVE` — a partir daí a Acme passa a aparecer no próximo login dele (endpoint corrigido na seção 7.1). |
| `removido@acmecorp.com` | `acme-corp` / Usuário, **vínculo `REMOVED`** | Login funciona, Acme não aparece em "Minhas contas" — simula o resultado de um `DELETE /users/:id` (soft delete) feito por um admin. Bom para testar o filtro `status=REMOVED` na tela `/configuracoes/usuarios` (como Admin/Owner). |
| `bruce@wayne.com` | `wayne-enterprises` (**conta inativa**) / Owner | Login funciona, mas `accounts: []` — a Wayne (inativa) não é listada (corrigido na seção 7.1). Não há `currentAccount`. Se alguém tentar forçar um `switch-account` com o `membershipId` dele (obtido fora da UI, ex. direto no banco), a chamada falha com `ACCOUNT_INACTIVE` já no próprio `switch-account` (antes só falhava depois, num endpoint com `MembershipGuard`). |
| `clark@acmecorp.com` | `acme-corp` (Financeiro, padrão) + `global-tech` (Suporte) | **Cenário dedicado de validação de RBAC entre contas** — ver seção 9. |
| `olivia@acmecorp.com` | `acme-corp` / **Owner** (segundo Owner, além do Owner "global" da `williamjosefernandes@gmail.com` em `madecoders`) | Logada como `alice@acmecorp.com` (Administradora), tentar "Remover" ou "Alterar status → Suspenso/Removido" na Olivia deve falhar com `CANNOT_DELETE_OWNER`/`CANNOT_BLOCK_OWNER` (proteção corrigida na seção 7.1). |

## 6. Roteiro sugerido de testes manuais (frontend)

1. **Login básico + sidebar por perfil** — logar com `alice@acmecorp.com`, `victor@acmecorp.com`, `fernanda@acmecorp.com` e `saulo@acmecorp.com` (todos na Acme) e comparar a sidebar entre eles — cada um deve ver um recorte diferente de grupos/itens.
2. **Widgets do Dashboard** — comparar o Dashboard de `bob@acmecorp.com` (Gerente) e `saulo@acmecorp.com` (Suporte): Gerente vê StatCards de receita/novos clientes + resumo financeiro; Suporte não vê nenhum StatCard nem o financeiro, só atividades/notificações.
3. **Multi-conta** — logar com `diana@acmecorp.com` ou `clark@acmecorp.com` (cenário dedicado, seção 9), confirmar as contas certas no `AccountSwitcherMenu` e trocar de conta pela UI — precisa da correção da seção 7.1 para funcionar (antes dela, trocar de conta sempre dava erro).
4. **CRUD de usuários com lacunas de permissão** — logar como `bob@acmecorp.com` (Gerente), abrir `/configuracoes/usuarios`: a lista carrega (`users.read`), o botão "Novo usuário" não aparece (sem `users.create`), a ação "Editar" não aparece na linha (override nega `users.update`), "Remover" não aparece (sem `users.delete`).
5. **Erros de login** — tentar logar com `bloqueado@acmecorp.com`, `suspenso@acmecorp.com`, `pendente@acmecorp.com` e `naoverificado@acmecorp.com`: cada um deve mostrar um toast de erro coerente (ver tabela da seção 5).
6. **Cadastro real ponta a ponta** — usar `/cadastro` para criar um usuário novo (fora desta massa de teste), confirmar o código por e-mail (ou olhando a tabela `tokens` no banco) e verificar que cai autenticado no Dashboard ao final — exercita a integração feita em `docs/09-integracao-usuarios-admin-e-cadastro.md` do frontend.
7. **Conta inativa** — logar com `bruce@wayne.com` e confirmar que "Minhas contas" vem vazio (a Wayne, inativa, não aparece) — não deve haver conta ativa nem sidebar de produto utilizável.
8. **Aceitar convite pela tela de administração** — como Admin/Owner na Acme, abrir `/configuracoes/usuarios`, filtrar por status "Convidado", usar "Alterar status" em `convidado@acmecorp.com` para `Ativo`; logar como `convidado@acmecorp.com` depois e confirmar que a Acme já aparece em "Minhas contas".
9. **Proteção do Owner** — logar como `alice@acmecorp.com` (Administradora da Acme), abrir `/configuracoes/usuarios`, tentar "Remover" a `olivia@acmecorp.com` (Owner) → deve falhar com `CANNOT_DELETE_OWNER`; tentar "Alterar status → Suspenso" ou "→ Removido" nela → deve falhar com `CANNOT_BLOCK_OWNER`/`CANNOT_DELETE_OWNER` (proteção corrigida na seção 7.1 — antes, a comparação `profile.name === 'OWNER'` nunca era verdadeira e a proteção não funcionava).

## 7. Inconsistências de backend encontradas

### 7.1 Corrigidas

1. **`accounts[].id` devolvia o ID da conta, não o do Membership — trocar de conta nunca funcionava.** `auth.service.ts::loadContext` montava `accounts[].id = m.account.id`, mas `POST /auth/switch-account` (`SwitchAccountDto.membershipId`) espera o ID do **Membership** (`m.id`) — são UUIDs diferentes. Como o frontend usa exatamente `accounts[].id` como `membershipId` ao chamar switch-account (`AccountSwitcherMenu`/`switchAccountService`), **qualquer usuário com mais de uma conta nunca conseguia trocar de conta pela UI** — sempre voltava `ACCOUNT_ACCESS_DENIED`. Corrigido em `auth.service.ts` (`id: m.id`) e documentado em `AccountListItemDto.id` (Swagger). Reproduzido e validado com `clark@acmecorp.com` (seção 9) antes e depois da correção.
2. **Convite de admin nunca ativava a conta.** `createUserAdmin` cria o usuário com `status` padrão (`PENDING_EMAIL`) e manda um e-mail de "definir senha" reaproveitando o fluxo de `reset-password`, mas `resetPassword()` só trocava a senha — nunca marcava o usuário como `ACTIVE`/`emailVerifiedAt`. Corrigido: `resetPassword()` agora ativa a conta (`status: ACTIVE` + `emailVerifiedAt`, se ainda nulo) sempre que o usuário do token ainda estiver `PENDING_EMAIL` — não reativa contas `BLOCKED`/`SUSPENDED` por um admin (só o caso de primeira ativação). Válido tanto para o link de "definir senha" do convite quanto para o "esqueci minha senha" normal.
3. **`ACCOUNT_INACTIVE` não era checado por `login`/`switchAccount`.** `loadContext` montava `accounts[]`/`currentAccount` só filtrando `Membership.status = 'ACTIVE'`, sem olhar `Account.active` — só endpoints com `MembershipGuard` checavam isso. Corrigido: `login()` e `loadContext()` agora filtram `account: { active: true }` (contas inativas nunca entram em `accounts[]`, nem são auto-selecionadas como conta atual no primeiro login); `switchAccount()` ganhou uma checagem explícita adicional (`ACCOUNT_INACTIVE`) para o caso de alguém forçar um `membershipId` de conta inativa diretamente. Ver `bruce@wayne.com` (seção 5) para o comportamento atual.
4. **`UpdateUserStatusDto` validava o enum errado.** Documentado/validado como `UserStatus` (`PENDING_EMAIL|ACTIVE|BLOCKED|SUSPENDED`), mas `updateUserStatus()` sempre gravou o valor em `Membership.status` (`MembershipStatus`: `ACTIVE|INVITED|SUSPENDED|REMOVED`) — `PENDING_EMAIL`/`BLOCKED` sempre falhavam em runtime. Corrigido: o DTO agora valida `MembershipStatus` de verdade (é isso que o service sempre gravou). A proteção do Owner foi ajustada junto: `SUSPENDED` faz o papel de "bloquear" o vínculo (`CANNOT_BLOCK_OWNER`), `REMOVED` o de "excluir" (`CANNOT_DELETE_OWNER`, mesmo código usado por `softDeleteUser`). Frontend sincronizado (`src/users/types`, `usuario.schemas.ts`, `AlterarStatusModal`, `UsuariosPage`).
5. **Proteção do Owner (`CANNOT_DELETE_OWNER`/`CANNOT_BLOCK_OWNER`) nunca disparava.** `mem.profile.name === 'OWNER'` comparava contra `'OWNER'` (maiúsculas), mas `Profile.name` é salvo como `'Owner'` (ver seed) — a condição nunca era verdadeira, em `softDeleteUser` **e** em `updateUserStatus`. Corrigido para `mem.profile.name.toUpperCase() === 'OWNER'` (mesma normalização já usada em `loadContext` para `profile.code`). Cenário de teste dedicado: `olivia@acmecorp.com` (seção 5/6).
6. **Rate limit (429) devolvia `error.code: INTERNAL_SERVER_ERROR`.** `AllExceptionsFilter.fallbackCodeForStatus` não tinha um `case` para `429 Too Many Requests` (ex.: `POST /auth/login`, limitado a 5/min), caindo no `default`. Adicionado `ErrorCode.RATE_LIMITED` (+ `errors.json`, + `fallbackCodeForStatus`) — o status HTTP já era `429` corretamente, só o `code` do corpo estava errado. Frontend sincronizado (`ErrorCode`, `error.utils.ts`).

Nenhuma pendência de backend restante desta massa de teste — todas as inconsistências encontradas ao validar os cenários foram corrigidas.

## 9. Cenário dedicado — um usuário, duas contas, menus e componentes bem diferentes

`clark@acmecorp.com` (senha `password123`) existe especificamente para validar visualmente que o RBAC recalcula a sidebar e os widgets a cada troca de conta, com o mínimo de sobreposição possível entre as duas contas. Foi validando este cenário via curl que o bug da seção 7.1 (`accounts[].id` errado, trocar de conta sempre falhava) foi encontrado e corrigido — o fluxo abaixo já reflete o comportamento correto (pós-correção):

| | `acme-corp` (perfil **Financeiro**, conta padrão no login) | `global-tech` (perfil **Suporte**, via troca de conta) |
|---|---|---|
| Grupos de menu visíveis | Navegação (só "Dashboard") + **Financeiro** | Navegação ("Dashboard" + "Atividades") + **Comunicação** + **Operações** |
| Grupos que somem | Cadastros\*, Comunicação, Operações, Marketing, Configurações | Cadastros, **Financeiro**, Marketing, Configurações |
| Widgets do Dashboard | Indicadores (só "Receita do mês") + Resumo Financeiro | Atividades Recentes + Notificações — **sem nenhum StatCard, sem financeiro** |
| `/configuracoes/usuarios` | Não aparece no menu (sem `configuracoes.usuarios`) em nenhuma das duas contas | idem |

\* Cadastros aparece na Acme só pelo item "Alunos" (override pontual do perfil Financeiro) — bom para confirmar que um `ALLOW` isolado reaparece corretamente mesmo com o resto do grupo ausente.

**Roteiro de validação:**
1. Logar com `clark@acmecorp.com` → cai na Acme (Financeiro) → sidebar deve mostrar só "Dashboard", "Alunos" (dentro de Cadastros) e o grupo "Financeiro" completo (Receitas/Despesas/Faturas). Dashboard deve mostrar só o StatCard de receita + o card de resumo financeiro — nenhum outro StatCard, nenhuma atividade/agenda/notificação/top produtos.
2. Abrir o `AccountSwitcherMenu` e trocar para "Global Tech" → a sidebar deve se redesenhar por completo: grupo "Financeiro" desaparece, "Cadastros" desaparece, aparecem "Atividades" (Navegação) e o grupo "Comunicação" + "Operações" (só o item "Aulas", não "Frota"). Dashboard deve trocar para mostrar só o card de Atividades Recentes + Notificações — sem nenhum StatCard e sem resumo financeiro.
3. Se algo do passo 1 ainda aparecer no passo 2 (ou vice-versa) fora do que a tabela acima descreve, é sinal de que a sidebar/Dashboard não está recalculando o RBAC corretamente na troca de conta (esperado: `useVisibleMenu`/`usePermission` são reativos a `useAuthStore.permissions`, que muda inteiro a cada `switch-account`).

## 10. Como reaplicar esta massa de teste

```bash
cd projeto_nestjs_template
npm run migrations   # prisma migrate reset --force && prisma migrate deploy (roda o seed automaticamente)
# ou, sem apagar o banco (a seed é idempotente via upsert):
npx prisma db seed
```
