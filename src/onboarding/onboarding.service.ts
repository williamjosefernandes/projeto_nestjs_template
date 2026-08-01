import { Injectable } from '@nestjs/common';
import { AccountType, OnboardingDraft, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../database/prisma.service';
import { AuthService } from '../auth/auth.service';
import { ErrorCode } from '../common/enum/error-code.enum';
import {
  BadRequestAppException,
  ConflictAppException,
  NotFoundAppException,
} from '../common/exceptions/app.exception';
import { provisionDefaultProfiles } from '../core/security/provisioning/default-profiles.provisioner';
import { CreatePersonalDataDto } from './dtos/create-personal-data.dto';
import { CreateCompanyDataDto } from './dtos/create-company-data.dto';
import { CreateAddressDto } from './dtos/create-address.dto';
import { CreatePersonalizationDto } from './dtos/create-personalization.dto';
import { CompleteOnboardingDto } from './dtos/complete-onboarding.dto';

/** Versão atual dos Termos/Política aceitos na conclusão do onboarding — bump manual quando o texto mudar. */
const TERMS_VERSION = '2026-01';
const PRIVACY_VERSION = '2026-01';

interface OnboardingPayload {
  personalData?: CreatePersonalDataDto;
  companyData?: CreateCompanyDataDto;
  address?: CreateAddressDto;
  personalization?: CreatePersonalizationDto;
}

function slugify(value: string): string {
  const base = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos (diacriticos combinantes) apos normalize('NFD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
  return base || 'conta';
}

@Injectable()
export class OnboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async getDraft(userId: string): Promise<OnboardingDraft | null> {
    return this.prisma.onboardingDraft.findUnique({ where: { userId } });
  }

  async savePersonalData(userId: string, dto: CreatePersonalDataDto) {
    const draft = await this.getDraftOrThrow(userId);
    this.assertAccountType(draft, AccountType.CUSTOMER);
    return this.mergePayload(draft, 'personal-data', { personalData: dto });
  }

  async saveCompanyData(userId: string, dto: CreateCompanyDataDto) {
    const draft = await this.getDraftOrThrow(userId);
    this.assertAccountType(draft, AccountType.COMPANY);
    return this.mergePayload(draft, 'company-data', { companyData: dto });
  }

  async saveAddress(userId: string, dto: CreateAddressDto) {
    const draft = await this.getDraftOrThrow(userId);
    return this.mergePayload(draft, 'address', { address: dto });
  }

  async savePersonalization(userId: string, dto: CreatePersonalizationDto) {
    const draft = await this.getDraftOrThrow(userId);
    this.assertAccountType(draft, AccountType.COMPANY);
    return this.mergePayload(draft, 'personalization', { personalization: dto });
  }

  async discardDraft(userId: string): Promise<void> {
    await this.prisma.onboardingDraft.deleteMany({ where: { userId } });
  }

  /**
   * Transação única: Account + Perfis padrão + Membership (Owner) +
   * Customer|Company + Address + consentimento + AuditLog + apaga o draft +
   * escopa a sessão atual à conta nova. Se qualquer passo falhar (ex.: CPF/
   * CNPJ duplicado), nada é persistido — sem isso sobraria uma Account órfã.
   */
  async complete(userId: string, sessionId: string, dto: CompleteOnboardingDto) {
    const draft = await this.getDraftOrThrow(userId);
    const payload = draft.payload as OnboardingPayload;
    this.assertRequiredSteps(draft.accountType, payload);

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const { membershipId } = await this.prisma.$transaction(async (tx) => {
      const accountName =
        draft.accountType === AccountType.COMPANY
          ? payload.personalization!.accountName
          : [user.firstName, user.lastName].filter(Boolean).join(' ');

      const slug = await this.generateUniqueSlug(tx, accountName);

      const account = await tx.account.create({
        data: {
          type: draft.accountType,
          name: accountName,
          slug,
          active: true,
          ...(draft.accountType === AccountType.COMPANY
            ? {
                language: payload.personalization!.language,
                timezone: payload.personalization!.timezone,
                logo: payload.personalization!.logoUrl,
              }
            : {}),
        },
      });

      const { ownerProfileId } = await provisionDefaultProfiles(tx, account.id);

      const membership = await tx.membership.create({
        data: { accountId: account.id, userId, profileId: ownerProfileId, status: 'ACTIVE' },
      });

      if (draft.accountType === AccountType.CUSTOMER) {
        const personalData = payload.personalData!;
        const document = personalData.document.replace(/\D/g, '');
        await this.assertDocumentAvailable(tx, 'customer', document);
        await tx.customer.create({
          data: {
            accountId: account.id,
            document,
            birthDate: new Date(personalData.birthDate),
            gender: personalData.gender,
          },
        });
        await this.assertPhoneAvailable(tx, userId, personalData.phone);
        await tx.user.update({ where: { id: userId }, data: { phone: personalData.phone } });
      } else {
        const companyData = payload.companyData!;
        const document = companyData.document.replace(/\D/g, '');
        await this.assertDocumentAvailable(tx, 'company', document);
        await tx.company.create({
          data: {
            accountId: account.id,
            corporateName: companyData.corporateName,
            tradeName: companyData.tradeName,
            document,
            email: companyData.email,
            phone: companyData.phone,
            whatsapp: companyData.whatsapp,
            website: companyData.website,
          },
        });
      }

      const address = payload.address!;
      await tx.address.create({
        data: {
          accountId: account.id,
          countryId: address.countryId,
          zipCode: address.zipCode,
          street: address.street,
          number: address.number,
          complement: address.complement,
          district: address.district,
          city: address.city,
          state: address.state,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          termsAcceptedAt: new Date(),
          termsVersion: TERMS_VERSION,
          privacyAcceptedAt: new Date(),
          privacyVersion: PRIVACY_VERSION,
        },
      });

      await tx.auditLog.create({
        data: {
          accountId: account.id,
          entity: 'Account',
          entityId: account.id,
          action: 'ONBOARDING_COMPLETED',
          metadata: { accountType: draft.accountType } as Prisma.InputJsonValue,
        },
      });

      await tx.onboardingDraft.delete({ where: { id: draft.id } });

      await tx.session.update({
        where: { id: sessionId },
        data: { currentMembershipId: membership.id },
      });

      return { membershipId: membership.id };
    });

    // Fora da transaction (assinatura de JWT não escreve no banco) — mesmo
    // padrão de `AuthService.switchAccount`: reemite tokens já escopados à
    // conta nova, para o frontend não precisar de um segundo round-trip.
    const context = await this.authService.loadContext(user, membershipId);
    const { accessToken, expiresIn } = this.authService.generateAccessToken(userId, sessionId, membershipId);
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });

    return {
      auth: { accessToken, refreshToken: session?.refreshToken ?? '', expiresIn },
      user: context.user,
      currentAccount: context.currentAccount,
      accounts: context.accounts,
    };
  }

  private async getDraftOrThrow(userId: string): Promise<OnboardingDraft> {
    const draft = await this.prisma.onboardingDraft.findUnique({ where: { userId } });
    if (!draft) throw new NotFoundAppException(ErrorCode.NOT_FOUND);
    return draft;
  }

  private assertAccountType(draft: OnboardingDraft, expected: AccountType): void {
    if (draft.accountType !== expected) {
      throw new ConflictAppException(ErrorCode.CONFLICT, {
        message: `Este step é só para contas ${expected}; o rascunho atual é ${draft.accountType}.`,
      });
    }
  }

  private assertRequiredSteps(accountType: AccountType, payload: OnboardingPayload): void {
    const missing: string[] = [];
    if (accountType === AccountType.CUSTOMER) {
      if (!payload.personalData) missing.push('personalData');
    } else {
      if (!payload.companyData) missing.push('companyData');
      if (!payload.personalization) missing.push('personalization');
    }
    if (!payload.address) missing.push('address');

    if (missing.length > 0) {
      throw new BadRequestAppException(ErrorCode.VALIDATION_ERROR, { missingSteps: missing });
    }
  }

  private async mergePayload(
    draft: OnboardingDraft,
    step: string,
    patch: Partial<OnboardingPayload>,
  ): Promise<OnboardingDraft> {
    const payload = { ...(draft.payload as object), ...patch };
    return this.prisma.onboardingDraft.update({
      where: { id: draft.id },
      data: { step, payload: payload as Prisma.InputJsonValue },
    });
  }

  /** Mesmo padrão de `AuthService.register()` para e-mail duplicado: checa antes do `create` para devolver um 409 de negócio em vez do 500 genérico da constraint única do Prisma (P2002). */
  private async assertDocumentAvailable(
    tx: Prisma.TransactionClient,
    entity: 'customer' | 'company',
    document: string,
  ): Promise<void> {
    const existing =
      entity === 'customer'
        ? await tx.customer.findUnique({ where: { document }, select: { id: true } })
        : await tx.company.findUnique({ where: { document }, select: { id: true } });

    if (existing) {
      throw new ConflictAppException(ErrorCode.DOCUMENT_ALREADY_IN_USE);
    }
  }

  /** `User.phone` também é `@unique` — mesmo racional de `assertDocumentAvailable`. */
  private async assertPhoneAvailable(tx: Prisma.TransactionClient, userId: string, phone: string): Promise<void> {
    const existing = await tx.user.findUnique({ where: { phone }, select: { id: true } });
    if (existing && existing.id !== userId) {
      throw new ConflictAppException(ErrorCode.PHONE_ALREADY_IN_USE);
    }
  }

  /** Colisão de slug é rara (nomes de conta repetidos), mas possível — tenta um sufixo curto antes de desistir. */
  private async generateUniqueSlug(tx: Prisma.TransactionClient, name: string): Promise<string> {
    const base = slugify(name);
    let candidate = base;

    for (let attempt = 0; attempt < 20; attempt++) {
      const existing = await tx.account.findUnique({ where: { slug: candidate }, select: { id: true } });
      if (!existing) return candidate;
      candidate = `${base}-${uuidv4().slice(0, 6)}`;
    }

    throw new ConflictAppException(ErrorCode.CONFLICT, {
      message: 'Não foi possível gerar um identificador único para a conta. Tente novamente.',
    });
  }
}
