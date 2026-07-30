# Especificação Técnica: Auth Module e AuthController

## 1. Visão Geral
Esta documentação define a arquitetura, regras de negócio e especificações técnicas da camada de autenticação (Auth Module) do sistema. O objetivo é fornecer uma API RESTful moderna, escalável e segura, aderente aos princípios da Clean Architecture, DDD e boas práticas de mercado, servindo de base para a implementação no NestJS com Prisma ORM e PostgreSQL.

**Tecnologias Envolvidas:**
- NestJS
- Prisma ORM (PostgreSQL)
- JWT (JSON Web Token) & Refresh Token
- Bcrypt (Hashing)
- Swagger / OpenAPI

**Características Principais:**
- Multi Account & Multi Tenant
- Controle de Sessões Ativas (Gestão de Dispositivos)
- Controle de Acesso Baseado em Papéis (RBAC - Profile, Permission, PermissionOverride)
- Auditoria (AuditLog) e Eventos de Domínio
- Versionamento Semântico (`/api/v1/auth`)

---

## 2. Padrões da API

### 2.1 Padrão de Resposta Global
Todas as respostas da API seguem um formato envelopado padronizado.

**Sucesso (Exemplo `200 OK` / `201 Created`):**
```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": { ... },
  "meta": {
    "timestamp": "2026-07-30T20:00:36Z",
    "version": "1.0.0"
  }
}
```

**Erro (Exemplo `400 Bad Request` / `401 Unauthorized`):**
```json
{
  "success": false,
  "message": "Descrição amigável do erro principal.",
  "errors": [
    {
      "field": "email",
      "message": "O e-mail informado tem um formato inválido."
    }
  ],
  "timestamp": "2026-07-30T20:00:36Z",
  "path": "/api/v1/auth/login"
}
```

---

## 3. Segurança e Políticas

1. **Rate Limiting:** Implementado via `@nestjs/throttler` (ex: 5 tentativas por minuto para `/login`, `/forgot-password`).
2. **Helmet:** Headers de segurança habilitados contra ataques de injeção e clickjacking.
3. **Senhas:** Armazenadas utilizando hash Bcrypt (salt rounds recomendados: 10 a 12).
4. **JWT:** Assinatura forte utilizando RS256 ou HS256. Access Token com expiração curta (ex: 15min) e Refresh Token criptografado salvo em banco (expiração longa, ex: 7 dias).
5. **Proteção CSRF:** Em caso de uso via cookies de sessão (opcional, dependendo do frontend).
6. **Controle de IP (Opcional):** Restrição de geolocalização ou registro de IP nas sessões de autenticação.

---

## 4. Resolução de Permissões (RBAC)

As permissões do sistema são granulares e não ficam em código (hardcoded). O cálculo final das permissões de um usuário segue a seguinte cascata:

1. **Profile:** O papel base do usuário (ex: Admin, Editor, Viewer).
2. **ProfilePermission:** Associação de N permissões padrão atreladas ao Profile.
3. **Permission:** O domínio da permissão em si (ex: `users:create`, `reports:view`).
4. **PermissionOverride:** Permissões customizadas para o usuário específico no contexto da Account/Membership, que **substituem** (adicionam ou revogam) as permissões do Profile padrão.

**Resultado Final (Flattened):**
`Context Permissions = (ProfilePermissions) +/- (PermissionOverrides)`

Baseado nesse cálculo, os **Menus** e **Components** retornados para exibição no frontend serão filtrados ativamente na resposta do Login, Me e Switch Account.

---

## 5. Especificação dos Endpoints

Todos os endpoints residem no `AuthController` com prefixo `/api/v1/auth`.

### 5.1 Login
- **Método HTTP:** `POST`
- **URL:** `/api/v1/auth/login`
- **Objetivo:** Autenticar um usuário e retornar contexto completo de sua sessão.
- **Autenticação:** Nenhuma (Público)

**Request DTO (`LoginDto`):**
```json
{
  "email": "user@company.com",
  "password": "Password@123!"
}
```

**Regras de Negócio & Fluxo:**
1. Validar sintaxe (class-validator).
2. Buscar `User` pelo `email`. Retornar `401` se não achar.
3. Comparar o hash da senha (Bcrypt). Retornar `401` se inválido.
4. Checar se a conta está ativa (`isActive: true`). Retornar `403` se inativo.
5. Checar se o e-mail foi verificado (`emailVerified: true`). Retornar `403` se não.
6. Buscar as `Memberships` do usuário.
7. Determinar a `Membership` padrão (ou a primeira, caso não haja preferência).
8. Através da Membership escolhida, carregar `Profile`, `Permissions` e `PermissionOverride`.
9. Criar um registro na entidade `Session` (gravando IP, User-Agent, Device, OS).
10. Gerar `AccessToken` e `RefreshToken`.
11. Atualizar o `lastLoginAt` do usuário.
12. Gravar em `AuditLog` (Ação: `USER_LOGIN_SUCCESS`).
13. Retornar payload com contexto completo.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login realizado com sucesso.",
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "d7a8s9d7...",
    "expiresIn": 900,
    "user": { "id": "...", "email": "user@company.com", "firstName": "John" },
    "currentAccount": { "id": "...", "name": "Company LLC" },
    "currentMembership": { "id": "...", "role": "ADMIN" },
    "profile": { "id": "...", "name": "Administrator" },
    "permissions": ["users:read", "users:write", "settings:view"],
    "menus": ["dashboard", "users", "settings"],
    "components": ["button-create-user"]
  }
}
```

**Possíveis Erros:**
- `400 Bad Request`: Validação do payload falhou.
- `401 Unauthorized`: Credenciais incorretas (sem dar dicas se o erro foi no email ou senha).
- `403 Forbidden`: E-mail não confirmado ou conta bloqueada.

---

### 5.2 Logout
- **Método HTTP:** `POST`
- **URL:** `/api/v1/auth/logout`
- **Objetivo:** Encerrar a sessão atual do usuário.
- **Autenticação:** Requer Bearer Token (AccessToken).

**Regras de Negócio & Fluxo:**
1. Extrair ID da Sessão do token atual (via `JwtAuthGuard`).
2. Remover ou inativar o registro de `Session` e o respectivo `RefreshToken` no banco de dados.
3. Registrar no `AuditLog` (Ação: `USER_LOGOUT`).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso.",
  "data": null
}
```

---

### 5.3 Logout All
- **Método HTTP:** `POST`
- **URL:** `/api/v1/auth/logout-all`
- **Objetivo:** Deslogar de todos os dispositivos encerrando todas as sessões do usuário.
- **Autenticação:** Requer Bearer Token.

**Regras de Negócio & Fluxo:**
1. Buscar todas as instâncias de `Session` vinculadas ao `userId`.
2. Remover/Inativar todas as sessões e seus `RefreshTokens`.
3. Registrar no `AuditLog` (Ação: `USER_LOGOUT_ALL`).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Todas as sessões foram encerradas.",
  "data": null
}
```

---

### 5.4 Refresh Token
- **Método HTTP:** `POST`
- **URL:** `/api/v1/auth/refresh-token`
- **Objetivo:** Emitir um novo Access Token antes do atual expirar.
- **Autenticação:** Nenhuma (Usa Refresh Token do corpo ou cookie).

**Request DTO (`RefreshTokenDto`):**
```json
{
  "refreshToken": "d7a8s9d7..."
}
```

**Regras de Negócio & Fluxo:**
1. Buscar o token na entidade `Session` ou `RefreshToken`.
2. Validar expiração e status de revogação. Retornar `401` se inválido/expirado.
3. Identificar o `User` e a `Membership` atrelada à sessão.
4. Gerar novo `AccessToken`.
5. Opcional (Rotation): Invalidar o token atual e gerar um novo `RefreshToken` para evitar reaproveitamento (Security Best Practice).
6. Atualizar a data de `lastAccessAt` na `Session`.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token atualizado com sucesso.",
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "n3wT0k3n...",
    "expiresIn": 900
  }
}
```

---

### 5.5 Me
- **Método HTTP:** `GET`
- **URL:** `/api/v1/auth/me`
- **Objetivo:** Retornar os dados do usuário autenticado e seu contexto atual.
- **Autenticação:** Requer Bearer Token.

**Regras de Negócio & Fluxo:**
1. Extrair `userId` e `sessionId` do JWT.
2. Buscar dados frescos do `User`, `Account` atual, `Membership` associada.
3. Recalcular e retornar a árvore de acessos (`Profile`, `Permissions`, `Menus`, `Components`).

**Response (200 OK):**
*(Mesmo corpo contido em `data` do endpoint de Login)*

---

### 5.6 Switch Account
- **Método HTTP:** `POST`
- **URL:** `/api/v1/auth/switch-account`
- **Objetivo:** Trocar o contexto do tenant sem necessidade de novo login.
- **Autenticação:** Requer Bearer Token.

**Request DTO (`SwitchAccountDto`):**
```json
{
  "membershipId": "uuid-da-nova-membership"
}
```

**Regras de Negócio & Fluxo:**
1. Checar se a `Membership` pertence ao `User` autenticado e se está ativa. Se não, `403 Forbidden`.
2. Carregar o novo contexto de conta: `Profile`, `Permissions` baseados nessa Membership.
3. Aplicar as exclusões da nova conta (`PermissionOverride`).
4. Atualizar a `Session` atual apontando para a nova `Membership`.
5. Gerar um novo JWT (AccessToken) assinado contemplando a nova Account/Membership no payload.
6. Gravar em `AuditLog` (Ação: `USER_SWITCH_ACCOUNT`).

**Response (200 OK):**
*(Mesmo corpo contido em `data` do endpoint de Login, contendo o novo token e novas permissões)*

---

### 5.7 Register
- **Método HTTP:** `POST`
- **URL:** `/api/v1/auth/register`
- **Objetivo:** Criar um novo usuário.
- **Autenticação:** Nenhuma.

**Request DTO (`RegisterDto`):**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Password@123!"
}
```

**Regras de Negócio & Fluxo:**
1. Validar e-mail único na tabela `User`. Se existir, abortar com `409 Conflict`.
2. Fazer o Hash da senha utilizando Bcrypt.
3. Criar registro na entidade `User` com `emailVerified = false` e `isActive = true`.
4. Gerar um token de verificação e gravar em `VerificationToken`.
5. Enviar e-mail de confirmação.
6. Gravar em `AuditLog` (Ação: `USER_REGISTERED`).

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Usuário registrado com sucesso. Verifique seu e-mail.",
  "data": { "userId": "..." }
}
```

---

### 5.8 Verify Email
- **Método HTTP:** `POST`
- **URL:** `/api/v1/auth/verify-email`
- **Objetivo:** Confirmar o e-mail do usuário recém cadastrado.
- **Autenticação:** Nenhuma.

**Request DTO (`VerifyEmailDto`):**
```json
{
  "email": "john.doe@example.com",
  "code": "123456"
}
```

**Regras de Negócio & Fluxo:**
1. Buscar o `VerificationToken` para o e-mail informado.
2. Checar expiração do código. Retornar `400` se expirado.
3. Checar veracidade do código.
4. Atualizar `User` definindo `emailVerified = true`.
5. Excluir o `VerificationToken`.
6. Gravar em `AuditLog` (Ação: `USER_EMAIL_VERIFIED`).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "E-mail verificado com sucesso. Você já pode fazer login.",
  "data": null
}
```

---

### 5.9 Resend Verification
- **Método HTTP:** `POST`
- **URL:** `/api/v1/auth/resend-verification`
- **Objetivo:** Reenviar o e-mail de confirmação de cadastro.
- **Autenticação:** Nenhuma.

**Request DTO (`ResendVerificationDto`):**
```json
{
  "email": "john.doe@example.com"
}
```

**Regras de Negócio & Fluxo:**
1. Buscar `User`.
2. Se usuário já está verificado, abortar silenciosamente.
3. Excluir/Invalidar códigos antigos.
4. Gerar novo `VerificationToken`.
5. Disparar notificação de e-mail.

---

### 5.10 Forgot Password
- **Método HTTP:** `POST`
- **URL:** `/api/v1/auth/forgot-password`
- **Objetivo:** Solicitar a recuperação de senha.
- **Autenticação:** Nenhuma.

**Request DTO (`ForgotPasswordDto`):**
```json
{
  "email": "john.doe@example.com"
}
```

**Regras de Negócio & Fluxo:**
1. Buscar o usuário.
2. Gerar Token em `PasswordResetToken` (validade curta).
3. Disparar notificação por e-mail com link de reset.
4. Gravar em `AuditLog`.

---

### 5.11 Reset Password
- **Método HTTP:** `POST`
- **URL:** `/api/v1/auth/reset-password`
- **Objetivo:** Definir nova senha através de token válido.
- **Autenticação:** Nenhuma.

**Request DTO (`ResetPasswordDto`):**
```json
{
  "token": "uuid-gerado-no-passo-anterior",
  "password": "NewPassword@123!",
  "confirmPassword": "NewPassword@123!"
}
```

**Regras de Negócio & Fluxo:**
1. Checar se `password` === `confirmPassword`.
2. Validar token e expiração.
3. Alterar a senha com hash Bcrypt.
4. Deletar o `PasswordResetToken`.
5. **Importante:** Invalidar todas as sessões ativas no banco (Logout All).
6. Gravar em `AuditLog`.

---

### 5.12 List Sessions
- **Método HTTP:** `GET`
- **URL:** `/api/v1/auth/sessions`
- **Objetivo:** Listar sessões e dispositivos ativos do usuário.
- **Autenticação:** Requer Bearer Token.

**Regras de Negócio & Fluxo:**
1. Filtrar tabela `Session` pelo `userId` logado.
2. Identificar a sessão da requisição atual com a flag `isCurrentSession: true`.
3. Ordenar com acessos mais recentes no topo.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Sessões recuperadas com sucesso.",
  "data": [
    {
      "id": "uuid-da-sessao",
      "device": "iPhone",
      "os": "iOS 16",
      "browser": "Safari",
      "ipAddress": "192.168.1.1",
      "location": "São Paulo, BR",
      "loggedInAt": "2026-07-30T10:00:00Z",
      "lastAccessAt": "2026-07-30T12:00:00Z",
      "isCurrentSession": true
    }
  ]
}
```

---

### 5.13 Revoke Session
- **Método HTTP:** `DELETE`
- **URL:** `/api/v1/auth/sessions/:id`
- **Objetivo:** Desconectar remotamente um dispositivo.
- **Autenticação:** Requer Bearer Token.

**Regras de Negócio & Fluxo:**
1. Validar pertencimento da sessão ao usuário atual.
2. Remover a `Session` e inativar seu Token.
3. Gravar `AuditLog` (Ação: `USER_SESSION_REVOKED`).

---

## 8. Considerações do Swagger/OpenAPI

Para que o código fonte do NestJS (no respectivo `AuthController`) esteja em compliance com esta especificação, ele deverá utilizar os decoradores do NestJS Swagger:

```typescript
@ApiTags('Authentication')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  // Exemplo de Anotações para Endpoint (Me)
  @ApiOperation({ summary: 'Recupera dados do usuário atual e seus acessos' })
  @ApiOkResponse({ description: 'Dados recuperados com sucesso.' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou expirado.' })
  @ApiBearerAuth()
  @Get('me')
  async me() { ... }
}
```
Fim do documento.
