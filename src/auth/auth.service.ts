import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { addMinutes, addDays } from 'date-fns';

import { PrismaService } from '../database/prisma.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { AuthorizationService } from '../core/security/services/authorization.service';

import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { ResetPasswordDto } from './dtos/password-reset.dto';
import { LoginResponseDto } from './dtos/auth-response.dto';
import { SessionResponseDto } from './dtos/session.dto';
import {
  FirebaseAuthService,
  FirebaseIdentity,
} from '../firebase/firebase-auth.service';
import { AuthProvider } from '@prisma/client';
import { ErrorCode } from '../common/enum/error-code.enum';
import {
  AppException,
  BadRequestAppException,
  UnauthorizedAppException,
  ForbiddenAppException,
  ConflictAppException,
} from '../common/exceptions/app.exception';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly bcryptRounds = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly firebaseAuthService: FirebaseAuthService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async login(
    loginDto: LoginDto,
    meta: { ipAddress?: string; userAgent?: string },
  ): Promise<LoginResponseDto> {
    const isLocal =
      !loginDto.authProvider || loginDto.authProvider === AuthProvider.LOCAL;

    let user: Awaited<ReturnType<UsersService['findByEmail']>>;

    if (isLocal) {
      // Email/senha são obrigatórios no DTO apenas quando authProvider é LOCAL.
      user = await this.usersService.findByEmail(loginDto.email);
      if (!user) {
        throw new UnauthorizedAppException(ErrorCode.INVALID_CREDENTIALS);
      }
      if (user.status !== 'ACTIVE') {
        throw new ForbiddenAppException(ErrorCode.ACCOUNT_INACTIVE);
      }

      if (!loginDto.password) {
        throw new BadRequestAppException(ErrorCode.PASSWORD_NOT_PROVIDED);
      }
      if (!user.password) {
        throw new UnauthorizedAppException(ErrorCode.INVALID_CREDENTIALS);
      }
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedAppException(ErrorCode.INVALID_CREDENTIALS);
      }
      if (!user.emailVerifiedAt) {
        throw new ForbiddenAppException(ErrorCode.UNVERIFIED_EMAIL);
      }
    } else {
      // Provedores federados não exigem email/senha no corpo da requisição: a
      // identidade vem inteiramente do token verificado pelo Firebase.
      if (!loginDto.firebaseToken) {
        throw new BadRequestAppException(ErrorCode.FIREBASE_TOKEN_NOT_PROVIDED);
      }
      const identity = await this.firebaseAuthService.verifyIdToken(
        loginDto.firebaseToken,
      );
      if (!identity) {
        throw new UnauthorizedAppException(ErrorCode.INVALID_FIREBASE_TOKEN);
      }

      user = await this.findOrProvisionFirebaseUser(
        identity,
        loginDto.authProvider,
      );
      if (user.status !== 'ACTIVE') {
        throw new ForbiddenAppException(ErrorCode.ACCOUNT_INACTIVE);
      }
    }

    // Load Memberships (só de contas ativas — ver loadContext, mesmo filtro).
    const memberships = await this.prisma.membership.findMany({
      where: { userId: user.id, status: 'ACTIVE', account: { active: true } },
    });

    let currentMembershipId = memberships.length > 0 ? memberships[0].id : null;

    // Build context
    const context = await this.loadContext(user, currentMembershipId);

    // Create session
    const sessionId = uuidv4();
    const refreshTokenExpiresAt = addDays(new Date(), 30);
    const refreshToken = this.generateRefreshToken(user.id, sessionId);

    await this.prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        currentMembershipId: currentMembershipId,
        refreshToken: refreshToken,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    // Update last login
    await this.usersService.update(user.id, { lastLoginAt: new Date() });

    // Generate JWT Access Token
    const { accessToken, expiresIn } = this.generateAccessToken(
      user.id,
      sessionId,
      currentMembershipId,
    );

    return {
      auth: { accessToken, refreshToken, expiresIn },
      user: context.user,
      currentAccount: context.currentAccount,
      accounts: context.accounts,
    };
  }

  async logout(sessionId: string): Promise<void> {
    if (!sessionId) return;
    await this.prisma.session.updateMany({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  async logoutAll(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async refreshToken(
    refreshToken: string,
    _meta: { ipAddress?: string; userAgent?: string },
  ) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const session = await this.prisma.session.findUnique({
        where: { id: payload.sessionId },
      });

      if (!session) {
        throw new UnauthorizedAppException(ErrorCode.SESSION_NOT_FOUND);
      }
      if (session.revokedAt) {
        throw new UnauthorizedAppException(ErrorCode.SESSION_REVOKED);
      }
      if (session.expiresAt < new Date()) {
        throw new UnauthorizedAppException(ErrorCode.REFRESH_TOKEN_EXPIRED);
      }

      if (session.refreshToken !== refreshToken) {
        throw new UnauthorizedAppException(ErrorCode.INVALID_REFRESH_TOKEN);
      }

      const user = await this.usersService.findById(session.userId);
      if (!user) throw new UnauthorizedAppException(ErrorCode.USER_NOT_FOUND);

      // Rotation
      const newRefreshToken = this.generateRefreshToken(user.id, session.id);

      await this.prisma.session.update({
        where: { id: session.id },
        data: {
          refreshToken: newRefreshToken,
          updatedAt: new Date(),
        },
      });

      const { accessToken, expiresIn } = this.generateAccessToken(
        user.id,
        session.id,
        session.currentMembershipId,
      );
      const context = await this.loadContext(user, session.currentMembershipId);

      return {
        auth: {
          accessToken,
          refreshToken: newRefreshToken,
          expiresIn,
        },
        user: context.user,
        currentAccount: context.currentAccount,
        accounts: context.accounts,
      };
    } catch (error) {
      if (error instanceof AppException) throw error;
      throw new UnauthorizedAppException(ErrorCode.INVALID_REFRESH_TOKEN);
    }
  }

  async getMe(userId: string, sessionId: string) {
    const user = await this.usersService.findById(userId);
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });
    const currentMembershipId = session ? session.currentMembershipId : null;

    const context = await this.loadContext(user, currentMembershipId);
    return context;
  }

  async switchAccount(
    userId: string,
    sessionId: string,
    newMembershipId: string,
  ) {
    const membership = await this.prisma.membership.findFirst({
      where: { id: newMembershipId, userId, status: 'ACTIVE' },
      include: { account: true },
    });

    if (!membership) {
      throw new ForbiddenAppException(ErrorCode.ACCOUNT_ACCESS_DENIED);
    }
    if (!membership.account.active) {
      throw new ForbiddenAppException(ErrorCode.ACCOUNT_INACTIVE);
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { currentMembershipId: newMembershipId },
    });

    const user = await this.usersService.findById(userId);
    const context = await this.loadContext(user, newMembershipId);
    const { accessToken, expiresIn } = this.generateAccessToken(
      userId,
      sessionId,
      newMembershipId,
    );

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    return {
      auth: {
        accessToken,
        refreshToken: session?.refreshToken || '',
        expiresIn,
      },
      user: context.user,
      currentAccount: context.currentAccount,
      accounts: context.accounts,
    };
  }

  async register(registerDto: RegisterDto) {
    const existing = await this.usersService.findByEmail(registerDto.email);
    if (existing) {
      throw new ConflictAppException(ErrorCode.EMAIL_ALREADY_IN_USE);
    }

    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      this.bcryptRounds,
    );

    // User + OnboardingDraft nascem juntos: o wizard de /cadastro já pode
    // persistir progresso (PATCH /v1/onboarding/draft/*) assim que o e-mail
    // for confirmado, sem uma chamada extra de "inicializar rascunho".
    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          username: registerDto.email,
          email: registerDto.email,
          password: hashedPassword,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName || '',
          authProvider: AuthProvider.LOCAL,
        },
      });

      await tx.onboardingDraft.create({
        data: {
          userId: created.id,
          accountType: registerDto.accountType,
          step: 'account-type',
        },
      });

      return created;
    });

    const verificationCode = this.generateEmailVerificationCode();
    await this.prisma.token.create({
      data: {
        userId: user.id,
        token: verificationCode,
        type: 'EMAIL_VERIFICATION',
        expiresAt: addMinutes(new Date(), 10),
      },
    });

    // Fire email async (could use EventEmitter)
    await this.emailService.sendVerificationCode(
      user.firstName,
      user.email,
      verificationCode,
    );

    return { userId: user.id };
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user)
      throw new BadRequestAppException(ErrorCode.INVALID_VERIFICATION_CODE);

    const token = await this.prisma.token.findFirst({
      where: {
        userId: user.id,
        token: code,
        type: 'EMAIL_VERIFICATION',
        usedAt: null,
      },
    });

    if (!token) {
      throw new BadRequestAppException(ErrorCode.INVALID_VERIFICATION_CODE);
    }
    if (token.expiresAt < new Date()) {
      throw new BadRequestAppException(ErrorCode.VERIFICATION_CODE_EXPIRED);
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
      },
    });

    await this.prisma.token.delete({ where: { id: token.id } });
  }

  async resendVerification(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.emailVerifiedAt) return;

    await this.prisma.token.deleteMany({
      where: { userId: user.id, type: 'EMAIL_VERIFICATION' },
    });

    const verificationCode = this.generateEmailVerificationCode();
    await this.prisma.token.create({
      data: {
        userId: user.id,
        token: verificationCode,
        type: 'EMAIL_VERIFICATION',
        expiresAt: addMinutes(new Date(), 10),
      },
    });

    await this.emailService.sendVerificationCode(
      user.firstName,
      user.email,
      verificationCode,
    );
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return; // Prevent user enumeration

    const resetToken = uuidv4();
    await this.prisma.token.create({
      data: {
        userId: user.id,
        type: 'PASSWORD_RESET',
        token: await bcrypt.hash(resetToken, 10),
        expiresAt: addMinutes(new Date(), 30),
      },
    });

    const resetLink = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${resetToken}`;
    await this.emailService.resetPassword({
      url: resetLink,
      name: user.firstName,
      email: user.email,
    });
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokens = await this.prisma.token.findMany({
      where: { usedAt: null, type: 'PASSWORD_RESET' },
    });

    let foundToken = null;
    for (const t of tokens) {
      if (await bcrypt.compare(dto.token, t.token)) {
        foundToken = t;
        break;
      }
    }

    if (!foundToken) {
      throw new BadRequestAppException(ErrorCode.INVALID_RESET_TOKEN);
    }
    if (foundToken.expiresAt < new Date()) {
      throw new BadRequestAppException(ErrorCode.RESET_TOKEN_EXPIRED);
    }

    const hashedPassword = await bcrypt.hash(
      dto.newPassword,
      this.bcryptRounds,
    );

    const user = await this.usersService.findById(foundToken.userId);
    if (!user) throw new BadRequestAppException(ErrorCode.INVALID_RESET_TOKEN);

    await this.prisma.user.update({
      where: { id: foundToken.userId },
      data: {
        password: hashedPassword,
        // Definir a senha por um token válido prova posse do e-mail — ativa a
        // conta quando ela ainda está PENDING_EMAIL (fluxo de convite de admin,
        // que reaproveita este mesmo endpoint — ver UsersService.createUserAdmin).
        // Não reativa contas BLOCKED/SUSPENDED por um admin (só PENDING_EMAIL).
        ...(user.status === 'PENDING_EMAIL'
          ? { status: 'ACTIVE', emailVerifiedAt: user.emailVerifiedAt ?? new Date() }
          : {}),
      },
    });

    await this.prisma.token.delete({
      where: { id: foundToken.id },
    });

    // Logout all active sessions for security
    await this.logoutAll(foundToken.userId);
  }

  async getSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<SessionResponseDto[]> {
    const sessions = await this.prisma.session.findMany({
      where: { userId, revokedAt: null },
      orderBy: { updatedAt: 'desc' },
    });

    return sessions.map((s) => ({
      id: s.id,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent, // browser/os can be parsed here
      loggedInAt: s.createdAt,
      lastAccessAt: s.updatedAt,
      isCurrentSession: s.id === currentSessionId,
    }));
  }

  async revokeSession(userId: string, sessionId: string) {
    await this.prisma.session.updateMany({
      where: { id: sessionId, userId },
      data: { revokedAt: new Date() },
    });
  }

  // Helper Methods

  /**
   * Resolve o usuário local de um login federado, reconhecendo uma conta já
   * existente antes de criar uma nova — nessa ordem de confiança:
   *   1. mesmo UID do Firebase de um login anterior (idêntico, sem ambiguidade);
   *   2. e-mail já verificado pelo provedor batendo com o e-mail de alguma conta
   *      (ex.: cadastro LOCAL com e-mail/senha, depois login via Google com o
   *      mesmo e-mail);
   *   3. telefone do token batendo com o telefone salvo em alguma conta (ex.:
   *      cadastro LOCAL que informou o telefone no perfil, depois login via
   *      Firebase Phone Auth com o mesmo número).
   * Só provisiona uma conta nova se nenhuma dessas buscas encontrar nada.
   */
  private async findOrProvisionFirebaseUser(
    identity: FirebaseIdentity,
    declaredProvider: AuthProvider,
  ) {
    const byUid = await this.usersService.findByUsername(identity.uid);
    if (byUid) return byUid;

    if (identity.email && identity.emailVerified) {
      const byEmail = await this.usersService.findByEmail(identity.email);
      if (byEmail) return byEmail;
    }

    if (identity.phoneNumber) {
      const byPhone = await this.usersService.findByPhone(identity.phoneNumber);
      if (byPhone) return byPhone;
    }

    // Nenhuma conta reconhecida. Se o e-mail já pertence a outra conta (com
    // e-mail ainda não verificado pelo provedor, caso contrário já teria sido
    // encontrado acima), não dá para criar — o valor é único no banco.
    if (identity.email) {
      const conflicting = await this.usersService.findByEmail(identity.email);
      if (conflicting) {
        throw new ConflictAppException(ErrorCode.EMAIL_ALREADY_IN_USE);
      }
    }

    const username = identity.email || identity.phoneNumber || identity.uid;
    return this.provisionUserFromFirebaseIdentity(
      identity,
      username,
      declaredProvider,
    );
  }

  /** Cria o usuário local na primeira vez que ele faz login por um provedor federado. */
  private async provisionUserFromFirebaseIdentity(
    identity: FirebaseIdentity,
    username: string,
    declaredProvider: AuthProvider,
  ) {
    const displayName = (identity.displayName || '').trim();
    const [firstName, ...rest] = displayName
      ? displayName.split(/\s+/)
      : ['Usuário'];

    return this.usersService.create({
      firstName,
      lastName: rest.join(' ') || null,
      username,
      email: identity.email,
      password: null,
      phone: identity.phoneNumber,
      avatar: identity.photoURL,
      status: 'ACTIVE',
      authProvider: this.resolveAuthProvider(
        identity.signInProvider,
        declaredProvider,
      ),
      emailVerifiedAt:
        identity.email && identity.emailVerified ? new Date() : null,
    } as any);
  }

  /** O provedor do token verificado é a fonte confiável; o valor enviado pelo cliente é só um fallback. */
  private resolveAuthProvider(
    signInProvider: string | null,
    declared: AuthProvider,
  ): AuthProvider {
    const bySignInProvider: Record<string, AuthProvider> = {
      'google.com': AuthProvider.GOOGLE,
      'apple.com': AuthProvider.APPLE,
      'facebook.com': AuthProvider.FACEBOOK,
      'github.com': AuthProvider.GITHUB,
      phone: AuthProvider.PHONE,
      anonymous: AuthProvider.ANONYMOUS,
    };
    return (signInProvider && bySignInProvider[signInProvider]) || declared;
  }

  /** Não-privado de propósito: `OnboardingService.complete()` reaproveita (mesmo padrão de contexto de `switchAccount`). */
  async loadContext(
    user: any,
    membershipId: string | null,
  ): Promise<any> {
    const userDto = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      emailVerified: !!user.emailVerifiedAt,
      status: user.status,
      authProvider: user.authProvider,
    };

    // Contas inativas nunca entram em `accounts[]`/`currentAccount` — evita
    // que login/refresh/switch-account escopem uma sessão a uma conta
    // desativada (só endpoints com `MembershipGuard` checavam isso antes).
    const allMemberships = await this.prisma.membership.findMany({
      where: { userId: user.id, status: 'ACTIVE', account: { active: true } },
      include: {
        account: true,
        profile: true,
      },
    });

    const accounts = allMemberships.map((m) => ({
      // `id` é o id do Membership (não da Account) — é o valor que
      // `POST /auth/switch-account` espera em `SwitchAccountDto.membershipId`.
      id: m.id,
      name: m.account.name,
      type: m.account.type,
      logo: (m.account as any).logo || m.account.avatar,
      profile: m.profile.name.toUpperCase(),
    }));

    if (!membershipId) {
      return { user: userDto, accounts };
    }

    const membership = allMemberships.find((m) => m.id === membershipId);
    if (!membership) return { user: userDto, accounts };

    // Fonte única do cálculo de permissões/menus/componentes (com cache) —
    // antes reimplementado aqui em paralelo a `AuthorizationService.calculatePermissions`.
    const { permissions, menus, components } =
      await this.authorizationService.calculatePermissions(membership.id);

    return {
      user: userDto,
      currentAccount: {
        id: membership.account.id,
        type: membership.account.type,
        name: membership.account.name,
        logo: (membership.account as any).logo || membership.account.avatar,
        membership: {
          id: membership.id,
          isOwner: membership.profile.name.toUpperCase() === 'OWNER',
          status: membership.status,
        },
        profile: {
          id: membership.profile.id,
          code: membership.profile.name.toUpperCase(),
          name: membership.profile.name,
        },
        permissions,
        menus,
        components,
      },
      accounts,
    };
  }

  /** Não-privado de propósito: `OnboardingService.complete()` reaproveita para emitir tokens escopados à conta recém-criada. */
  generateAccessToken(
    userId: string,
    sessionId: string,
    membershipId: string | null,
  ) {
    const payload = { sub: userId, sessionId, membershipId };
    const expiresInSec = 900; // 15 mins
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
      expiresIn: expiresInSec,
    };
  }

  private generateRefreshToken(userId: string, sessionId: string) {
    const payload = { sub: userId, sessionId };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '30d',
    });
  }

  private generateEmailVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
