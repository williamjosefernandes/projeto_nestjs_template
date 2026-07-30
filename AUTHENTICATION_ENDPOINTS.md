# Documentação - Endpoints de Autenticação

## Visão Geral
Todos os endpoints de autenticação seguem um padrão de resposta padronizado com `success`, `timestamp`, `data` e `error`. A API utiliza JWT com tokens de acesso com expiração de 15 minutos e tokens de atualização com 30 dias.

---

## Base URL
```
/api/v1/auth
```

---

## Endpoints Implementados

### 1. Registrar Novo Usuário
**Endpoint:** `POST /api/v1/auth/register`

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "timestamp": "2026-07-27T10:15:32Z",
  "data": {
    "message": "Registration successful. Please check your email to verify your account."
  }
}
```

**Erros:**
- `CONFLICT`: Email já em uso

---

### 2. Verificar Disponibilidade de E-mail
**Endpoint:** `POST /api/v1/auth/check-email`

**Request:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2026-07-27T10:15:32Z",
  "data": {
    "exists": true,
    "emailVerified": true,
    "loginMethods": ["PASSWORD"]
  }
}
```

Se o e-mail não existir:
```json
{
  "success": true,
  "timestamp": "2026-07-27T10:15:32Z",
  "data": {
    "exists": false
  }
}
```

---

### 3. Login
**Endpoint:** `POST /api/v1/auth/login`

**Request:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2026-07-27T10:15:32Z",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
    "expiresIn": 900,
    "refreshExpiresIn": 2592000,
    "tokenType": "Bearer",
    "user": {
      "id": "usr_001",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "photoUrl": null,
      "emailVerified": true,
      "status": "ACTIVE"
    }
  }
}
```

**Erros:**
- `INVALID_EMAIL_OR_PASSWORD`: Credenciais inválidas
- `EMAIL_NOT_VERIFIED`: E-mail não foi verificado
- `ACCOUNT_DISABLED`: Conta desativada
- `ACCOUNT_SUSPENDED`: Conta suspensa
- `ACCOUNT_DELETED`: Conta deletada

---

### 4. Atualizar Access Token
**Endpoint:** `POST /api/v1/auth/refresh-token`

**Request:**
```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2026-07-27T10:15:32Z",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "550e8400-e29b-41d4-a716-446655440001",
    "expiresIn": 900,
    "refreshExpiresIn": 2592000,
    "tokenType": "Bearer"
  }
}
```

**Nota:** O Refresh Token é rotacionado automaticamente. O token anterior é revogado.

**Erros:**
- `INVALID_REFRESH_TOKEN`: Token inválido
- `TOKEN_EXPIRED`: Token expirado
- `TOKEN_REVOKED`: Token revogado

---

### 5. Solicitar Recuperação de Senha
**Endpoint:** `POST /api/v1/auth/forgot-password`

**Request:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2026-07-27T10:15:32Z",
  "data": {
    "message": "If the email exists, we sent instructions for password reset."
  }
}
```

**Nota:** A resposta é sempre a mesma, independentemente de o e-mail existir, por razões de segurança.

---

### 6. Validar Token de Recuperação de Senha
**Endpoint:** `POST /api/v1/auth/validate-reset-password-token`

**Request:**
```json
{
  "token": "abc123def456ghi789"
}
```

**Response (Válido):**
```json
{
  "success": true,
  "timestamp": "2026-07-27T10:15:32Z",
  "data": {
    "valid": true,
    "expiresAt": "2026-07-27T11:20:00Z"
  }
}
```

**Response (Inválido):**
```json
{
  "success": true,
  "timestamp": "2026-07-27T10:15:32Z",
  "data": {
    "valid": false
  }
}
```

---

### 7. Redefinir Senha
**Endpoint:** `POST /api/v1/auth/reset-password`

**Request:**
```json
{
  "token": "abc123def456ghi789",
  "newPassword": "NewSecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2026-07-27T10:15:32Z",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
    "expiresIn": 900,
    "refreshExpiresIn": 2592000,
    "tokenType": "Bearer",
    "user": {
      "id": "usr_001",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "photoUrl": null,
      "emailVerified": true,
      "status": "ACTIVE"
    }
  }
}
```

**Nota:** O login automático elimina uma etapa no onboarding. Todos os Refresh Tokens anteriores são revogados.

**Erros:**
- `TOKEN_INVALID`: Token inválido
- `TOKEN_EXPIRED`: Token expirado
- `PASSWORD_TOO_WEAK`: Senha muito fraca

---

### 8. Verificar E-mail
**Endpoint:** `POST /api/v1/auth/verify-email`

**Request:**
```json
{
  "email": "john.doe@example.com",
  "code": "854239"
}
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2026-07-27T10:15:32Z",
  "data": {
    "verified": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
    "expiresIn": 900,
    "refreshExpiresIn": 2592000,
    "tokenType": "Bearer",
    "user": {
      "id": "usr_001",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "photoUrl": null,
      "emailVerified": true,
      "status": "ACTIVE"
    }
  }
}
```

**Nota:** O login automático melhora a conversão no onboarding.

**Erros:**
- `INVALID_CODE`: Código inválido
- `CODE_EXPIRED`: Código expirado

---

### 9. Reenviar Código de Verificação de E-mail
**Endpoint:** `POST /api/v1/auth/resend-email-verification`

**Request:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2026-07-27T10:15:32Z",
  "data": {
    "message": "Verification email sent."
  }
}
```

**Nota:** Tokens anteriores são deletados. O novo código é válido por 10 minutos.

---

### 10. Logout
**Endpoint:** `POST /api/v1/auth/logout`

**Authorization:** Bearer Token (obrigatório)

**Request:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2026-07-27T10:15:32Z",
  "data": {
    "success": true
  }
}
```

**Nota:** Todos os Refresh Tokens do usuário são revogados.

---

### 11. Obter Usuário Atual
**Endpoint:** `GET /api/v1/auth/me`

**Authorization:** Bearer Token (obrigatório)

**Response:**
```json
{
  "success": true,
  "timestamp": "2026-07-27T10:15:32Z",
  "data": {
    "id": "usr_001",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "photoUrl": null,
    "emailVerified": true,
    "status": "ACTIVE"
  }
}
```

---

## Política de Tokens

| Item | Valor |
|------|-------|
| Access Token | JWT (Bearer) |
| Expiração Access Token | 15 minutos |
| Refresh Token | UUID v7 criptograficamente seguro |
| Expiração Refresh Token | 30 dias |
| Token de recuperação de senha | Uso único, 30 minutos |
| Código de confirmação de e-mail | 6 dígitos numéricos, 10 minutos |
| Rotação de Refresh Token | Obrigatória |
| Revogação após troca de senha | Todos os Refresh Tokens do usuário |

---

## Códigos de Erro Padronizados

### Autenticação
- `INVALID_EMAIL`: E-mail inválido
- `INVALID_PASSWORD`: Senha inválida
- `INVALID_EMAIL_OR_PASSWORD`: Credenciais inválidas
- `EMAIL_NOT_VERIFIED`: E-mail não verificado
- `ACCOUNT_LOCKED`: Conta bloqueada
- `ACCOUNT_DISABLED`: Conta desativada
- `ACCOUNT_DELETED`: Conta deletada
- `PASSWORD_EXPIRED`: Senha expirada

### Token
- `TOKEN_INVALID`: Token inválido
- `TOKEN_EXPIRED`: Token expirado
- `TOKEN_ALREADY_USED`: Token já utilizado
- `TOKEN_REVOKED`: Token revogado
- `INVALID_REFRESH_TOKEN`: Refresh token inválido
- `SESSION_EXPIRED`: Sessão expirada

### Validação
- `INVALID_CODE`: Código inválido
- `CODE_EXPIRED`: Código expirado
- `PASSWORD_TOO_WEAK`: Senha muito fraca
- `PASSWORD_REUSED`: Senha já utilizada
- `TOO_MANY_ATTEMPTS`: Muitas tentativas

---

## Exemplo de Fluxo Completo

### 1. Registrar
```bash
POST /api/v1/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

### 2. Verificar E-mail
```bash
POST /api/v1/auth/verify-email
{
  "email": "john@example.com",
  "code": "123456"
}
# Retorna accessToken e refreshToken (login automático)
```

### 3. Usar Access Token
```bash
GET /api/v1/auth/me
Authorization: Bearer {accessToken}
```

### 4. Atualizar Token
```bash
POST /api/v1/auth/refresh-token
{
  "refreshToken": "{refreshToken}"
}
# Retorna novo accessToken e novo refreshToken (rotacionado)
```

### 5. Logout
```bash
POST /api/v1/auth/logout
Authorization: Bearer {accessToken}
# Todos os Refresh Tokens são revogados
```

---

## Segurança

- ✅ Tokens JWT com assinatura RS256/ES256
- ✅ Refresh Token rotacionado automaticamente
- ✅ Revogação de tokens após logout
- ✅ Revogação de todos os tokens após mudança de senha
- ✅ Códigos de verificação de 6 dígitos com expiração
- ✅ E-mails nunca revelam se existem na base de dados
- ✅ Senhas hasheadas com bcrypt (10 rounds)
- ✅ Validação de força de senha
- ✅ Rate limiting recomendado no frontend/gateway

---

## Variáveis de Ambiente Necessárias

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_USER=your-email@example.com
SMTP_PASS=your-password

# URLs
FRONTEND_URL=http://localhost:5371

# App
PORT=3000
NODE_ENV=development
```

---

## Status

✅ Endpoints implementados
✅ Validação de dados
✅ Tratamento de erros padronizado
✅ JWT com refresh token rotation
✅ Email verification
✅ Password reset
✅ Prisma ORM
✅ Documentação no Swagger
