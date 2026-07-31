# MadeCoders Backend

API backend do MadeCoders, construída com [NestJS](https://nestjs.com/) e [Prisma](https://www.prisma.io/) sobre PostgreSQL.

[![Swagger UI](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=Swagger&logoColor=white)](http://localhost:3000/api/docs)

---

## Gestão de Branches

Fluxo utilizado: **Git Flow**

![git-flow](https://i.imgur.com/Wk7LfaW.png)

---

## Configuração local

1. Copie `.env.example` para `.env` e preencha as variáveis (JWT, SMTP, Firebase — veja os comentários no próprio arquivo).

2. Suba o banco de dados local:
   ```
   npm run containers
   ```

3. Instale as dependências:
   ```
   npm install
   ```

4. Rode as migrations e o seed:
   ```
   npm run migrations
   npx prisma db seed
   ```

5. Suba a aplicação em modo desenvolvimento:
   ```
   npm run start:dev
   ```

6. Acesse a documentação interativa da API em [http://localhost:3000/api/docs](http://localhost:3000/api/docs).

## Scripts úteis

| Script | Descrição |
| --- | --- |
| `npm run start:dev` | Sobe a aplicação com watch mode. |
| `npm run start:dev-full` | Sobe o banco, roda migrations, abre o Prisma Studio e a aplicação juntos. |
| `npm run build` | Compila o projeto para `dist/`. |
| `npm run lint` | Roda o ESLint com auto-fix. |
| `npm test` | Roda os testes unitários. |
| `npm run migrate:auto` | Gera e aplica uma nova migration a partir de mudanças no `schema.prisma`. |
