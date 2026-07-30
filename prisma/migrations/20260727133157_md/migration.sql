-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'PROFESSIONAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "CompanyRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'MEMBER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'REMOVED');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('PT_BR', 'EN_US', 'ES_ES');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateEnum
CREATE TYPE "SocialProvider" AS ENUM ('GITHUB', 'LINKEDIN');

-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('user', 'support');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'EMAIL_CHANGE');

-- CreateEnum
CREATE TYPE "UserTrackStatus" AS ENUM ('STARTED', 'COMPLETED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255),
    "avatar" VARCHAR(1000),
    "role" "Role" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(6),
    "lastLoginAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,
    "deletedAt" TIMESTAMP(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "theme" "Theme" NOT NULL DEFAULT 'SYSTEM',
    "language" "Language" NOT NULL DEFAULT 'PT_BR',
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "emailFrequency" VARCHAR(20) NOT NULL DEFAULT 'DAILY',
    "dailyGoalMinutes" INTEGER NOT NULL DEFAULT 60,
    "preferences" JSONB,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_accounts" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "provider" "SocialProvider" NOT NULL,
    "providerUserId" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255),
    "displayName" VARCHAR(255),
    "avatarUrl" VARCHAR(1000),
    "profileUrl" VARCHAR(1000),
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(6),
    "connectedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSync" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "social_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "tokenType" "TokenType" NOT NULL DEFAULT 'EMAIL_VERIFICATION',
    "expiresAt" TIMESTAMP(6) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "token" VARCHAR(500) NOT NULL,
    "expiresAt" TIMESTAMP(6) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" VARCHAR(45),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" UUID NOT NULL,
    "usernameId" UUID,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,
    "deletedAt" TIMESTAMP(6),

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_members" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "CompanyRole" NOT NULL DEFAULT 'MEMBER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "version" BIGINT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "company_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professionals" (
    "id" UUID NOT NULL,
    "usernameId" UUID,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,
    "deletedAt" TIMESTAMP(6),

    CONSTRAINT "professionals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usernames" (
    "id" UUID NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "reserved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "usernames_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "id" UUID NOT NULL,
    "code" VARCHAR(2) NOT NULL,
    "iso3" VARCHAR(3),
    "name" VARCHAR(255) NOT NULL,
    "nativeName" VARCHAR(255),
    "phoneCode" VARCHAR(10),
    "flagEmoji" VARCHAR(10),
    "flagSvgUrl" VARCHAR(1000),
    "currencyCode" VARCHAR(3),
    "currencyName" VARCHAR(255),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "states" (
    "id" UUID NOT NULL,
    "countryId" UUID NOT NULL,
    "ufCode" INTEGER NOT NULL,
    "uf" VARCHAR(2) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "region" VARCHAR(50),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "flagUrl" VARCHAR(500),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" UUID NOT NULL,
    "stateId" UUID NOT NULL,
    "countryId" UUID NOT NULL,
    "codeIbge" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "capital" BOOLEAN NOT NULL DEFAULT false,
    "siafiId" INTEGER,
    "ddd" INTEGER,
    "timeZone" VARCHAR(50),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets_helpdesk" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "category" VARCHAR(100),
    "attachments" JSONB,
    "assignedTo" VARCHAR(255),
    "resolvedAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,
    "deletedAt" TIMESTAMP(6),

    CONSTRAINT "tickets_helpdesk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_messages" (
    "id" UUID NOT NULL,
    "ticketId" UUID NOT NULL,
    "userId" UUID,
    "senderType" "SenderType" NOT NULL,
    "senderName" VARCHAR(255),
    "content" TEXT NOT NULL,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" UUID NOT NULL,
    "question" VARCHAR(500) NOT NULL,
    "answer" TEXT NOT NULL,
    "category" VARCHAR(100),
    "views" INTEGER NOT NULL DEFAULT 0,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "notHelpful" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_user_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_user_status" ON "users"("status");

-- CreateIndex
CREATE INDEX "idx_user_deleted_at" ON "users"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "settings_userId_key" ON "settings"("userId");

-- CreateIndex
CREATE INDEX "idx_settings_user_id" ON "settings"("userId");

-- CreateIndex
CREATE INDEX "idx_social_account_user_id" ON "social_accounts"("userId");

-- CreateIndex
CREATE INDEX "idx_social_account_provider" ON "social_accounts"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "social_accounts_provider_providerUserId_key" ON "social_accounts"("provider", "providerUserId");

-- CreateIndex
CREATE INDEX "idx_verification_token_code" ON "verification_tokens"("code");

-- CreateIndex
CREATE INDEX "idx_verification_token_user_id" ON "verification_tokens"("userId");

-- CreateIndex
CREATE INDEX "idx_verification_token_expires_at" ON "verification_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "idx_refresh_token_token" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "idx_refresh_token_user_id" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "idx_refresh_token_expires_at" ON "refresh_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "companies_usernameId_key" ON "companies"("usernameId");

-- CreateIndex
CREATE INDEX "idx_company_username_id" ON "companies"("usernameId");

-- CreateIndex
CREATE INDEX "idx_company_deleted_at" ON "companies"("deletedAt");

-- CreateIndex
CREATE INDEX "idx_company_member_company_id" ON "company_members"("companyId");

-- CreateIndex
CREATE INDEX "idx_company_member_user_id" ON "company_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "company_members_companyId_userId_key" ON "company_members"("companyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "professionals_usernameId_key" ON "professionals"("usernameId");

-- CreateIndex
CREATE INDEX "idx_professional_username_id" ON "professionals"("usernameId");

-- CreateIndex
CREATE INDEX "idx_professional_deleted_at" ON "professionals"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "usernames_value_key" ON "usernames"("value");

-- CreateIndex
CREATE INDEX "idx_username_value" ON "usernames"("value");

-- CreateIndex
CREATE UNIQUE INDEX "countries_code_key" ON "countries"("code");

-- CreateIndex
CREATE INDEX "idx_country_code" ON "countries"("code");

-- CreateIndex
CREATE INDEX "idx_country_name" ON "countries"("name");

-- CreateIndex
CREATE INDEX "idx_country_active" ON "countries"("active");

-- CreateIndex
CREATE UNIQUE INDEX "states_ufCode_key" ON "states"("ufCode");

-- CreateIndex
CREATE INDEX "idx_state_country_id" ON "states"("countryId");

-- CreateIndex
CREATE INDEX "idx_state_uf" ON "states"("uf");

-- CreateIndex
CREATE INDEX "idx_state_name" ON "states"("name");

-- CreateIndex
CREATE INDEX "idx_state_active" ON "states"("active");

-- CreateIndex
CREATE UNIQUE INDEX "cities_codeIbge_key" ON "cities"("codeIbge");

-- CreateIndex
CREATE INDEX "idx_city_state_id" ON "cities"("stateId");

-- CreateIndex
CREATE INDEX "idx_city_country_id" ON "cities"("countryId");

-- CreateIndex
CREATE INDEX "idx_city_name" ON "cities"("name");

-- CreateIndex
CREATE INDEX "idx_city_active" ON "cities"("active");

-- CreateIndex
CREATE UNIQUE INDEX "cities_stateId_name_key" ON "cities"("stateId", "name");

-- CreateIndex
CREATE INDEX "idx_ticket_user_id" ON "tickets_helpdesk"("userId");

-- CreateIndex
CREATE INDEX "idx_ticket_status" ON "tickets_helpdesk"("status");

-- CreateIndex
CREATE INDEX "idx_ticket_priority" ON "tickets_helpdesk"("priority");

-- CreateIndex
CREATE INDEX "idx_ticket_created_at" ON "tickets_helpdesk"("createdAt");

-- CreateIndex
CREATE INDEX "idx_ticket_deleted_at" ON "tickets_helpdesk"("deletedAt");

-- CreateIndex
CREATE INDEX "idx_ticket_message_ticket_id" ON "ticket_messages"("ticketId");

-- CreateIndex
CREATE INDEX "idx_ticket_message_user_id" ON "ticket_messages"("userId");

-- CreateIndex
CREATE INDEX "idx_ticket_message_created_at" ON "ticket_messages"("createdAt");

-- CreateIndex
CREATE INDEX "idx_faq_category" ON "faqs"("category");

-- CreateIndex
CREATE INDEX "idx_faq_active" ON "faqs"("isActive");

-- CreateIndex
CREATE INDEX "idx_faq_order" ON "faqs"("order");

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_accounts" ADD CONSTRAINT "social_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "states" ADD CONSTRAINT "states_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets_helpdesk" ADD CONSTRAINT "tickets_helpdesk_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets_helpdesk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
