import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { addMinutes, addDays } from 'date-fns';

import { PrismaService } from '../database/prisma.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { ResetPasswordDto } from './dtos/password-reset.dto';
import { LoginResponseDto } from './dtos/auth-response.dto';
import { SessionResponseDto } from './dtos/session.dto';
import { FirebaseAuthService } from '../firebase/firebase-auth.service';
import { AuthProvider } from '@prisma/client';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { generateRequestId } from '../common/utils/request-id.util';

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
  ) {}

  async login(
    loginDto: LoginDto,
    meta: { ipAddress?: string; userAgent?: string },
  ): Promise<ApiResponseDto<LoginResponseDto>> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException(`Conta inativa ou suspensa.`);
    }

    const isLocal = !loginDto.authProvider || loginDto.authProvider === AuthProvider.LOCAL;

    if (isLocal) {
      if (!loginDto.password) {
        throw new BadRequestException('Senha não informada');
      }
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas');
      }
      if (!user.emailVerifiedAt) {
        throw new ForbiddenException('E-mail não verificado');
      }
    } else {
      if (!loginDto.firebaseToken) {
        throw new BadRequestException('Token do Firebase não fornecido');
      }
      const uid = await this.firebaseAuthService.verifyIdToken(loginDto.firebaseToken);
      if (!uid) {
        throw new UnauthorizedException('Token do Firebase inválido');
      }
    }

    // Load Memberships
    const memberships = await this.prisma.membership.findMany({
      where: { userId: user.id, status: 'ACTIVE' },
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
    const { accessToken, expiresIn } = this.generateAccessToken(user.id, sessionId, currentMembershipId);

    return {
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Login realizado com sucesso.',
      requestId: generateRequestId(),
      data: {
        auth: { accessToken, refreshToken, expiresIn },
        user: context.user,
        currentAccount: context.currentAccount,
        accounts: context.accounts,
      },
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

  async refreshToken(refreshToken: string, meta: { ipAddress?: string; userAgent?: string }) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const session = await this.prisma.session.findUnique({
        where: { id: payload.sessionId },
      });

      if (!session || session.revokedAt || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token revogado ou expirado');
      }

      if (session.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      const user = await this.usersService.findById(session.userId);
      if (!user) throw new UnauthorizedException('Usuário não encontrado');

      // Rotation
      const newRefreshToken = this.generateRefreshToken(user.id, session.id);
      
      await this.prisma.session.update({
        where: { id: session.id },
        data: {
          refreshToken: newRefreshToken,
          updatedAt: new Date(),
        },
      });

      const { accessToken, expiresIn } = this.generateAccessToken(user.id, session.id, session.currentMembershipId);
      const context = await this.loadContext(user, session.currentMembershipId);

      return {
        success: true,
        timestamp: new Date().toISOString(),
        message: 'Token atualizado com sucesso.',
        auth: {
          accessToken,
          refreshToken: newRefreshToken,
          expiresIn,
        },
        user: context.user,
        currentAccount: context.currentAccount,
        accounts: context.accounts,
      } as any;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getMe(userId: string, sessionId: string) {
    const user = await this.usersService.findById(userId);
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    const currentMembershipId = session ? session.currentMembershipId : null;

    const context = await this.loadContext(user, currentMembershipId);
    return context;
  }

  async switchAccount(userId: string, sessionId: string, newMembershipId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: { id: newMembershipId, userId, status: 'ACTIVE' },
    });

    if (!membership) {
      throw new ForbiddenException('Acesso negado para esta conta');
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { currentMembershipId: newMembershipId },
    });

    const user = await this.usersService.findById(userId);
    const context = await this.loadContext(user, newMembershipId);
    const { accessToken, expiresIn } = this.generateAccessToken(userId, sessionId, newMembershipId);

    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });

    return {
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Conta alterada com sucesso.',
      auth: {
        accessToken,
        refreshToken: session?.refreshToken || '',
        expiresIn,
      },
      user: context.user,
      currentAccount: context.currentAccount,
      accounts: context.accounts,
    } as any;
  }

  async register(registerDto: RegisterDto) {
    const existing = await this.usersService.findByEmail(registerDto.email);
    if (existing) {
      throw new ConflictException('E-mail já está em uso.');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, this.bcryptRounds);
    const user = await this.usersService.create({
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName || '',
      authProvider: AuthProvider.LOCAL,
    } as any);

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
    await this.emailService.sendVerificationCode(user.firstName, user.email, verificationCode);

    return { userId: user.id };
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('Código inválido');

    const token = await this.prisma.token.findFirst({
      where: {
        userId: user.id,
        token: code,
        type: 'EMAIL_VERIFICATION',
        usedAt: null,
      },
    });

    if (!token || token.expiresAt < new Date()) {
      throw new BadRequestException('Código inválido ou expirado');
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

    await this.emailService.sendVerificationCode(user.firstName, user.email, verificationCode);
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

    if (!foundToken || foundToken.expiresAt < new Date()) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, this.bcryptRounds);
    
    await this.prisma.user.update({
      where: { id: foundToken.userId },
      data: { password: hashedPassword },
    });

    await this.prisma.token.delete({
      where: { id: foundToken.id },
    });

    // Logout all active sessions for security
    await this.logoutAll(foundToken.userId);
  }

  async getSessions(userId: string, currentSessionId: string): Promise<SessionResponseDto[]> {
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

  private async loadContext(user: any, membershipId: string | null): Promise<any> {
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

    const allMemberships = await this.prisma.membership.findMany({
      where: { userId: user.id, status: 'ACTIVE' },
      include: {
        account: true,
        profile: true,
      },
    });

    const accounts = allMemberships.map((m) => ({
      id: m.account.id,
      name: m.account.name,
      type: m.account.type,
      logo: (m.account as any).logo || m.account.avatar,
      profile: m.profile.name.toUpperCase(),
    }));

    if (!membershipId) {
      return { user: userDto, accounts };
    }

    const membership = allMemberships.find(m => m.id === membershipId);
    if (!membership) return { user: userDto, accounts };

    const fullProfile = await this.prisma.profile.findUnique({
      where: { id: membership.profileId },
      include: {
        permissions: { include: { permission: true } },
        overrides: { include: { permission: true } },
      },
    });

    const permMap = new Map<string, string>();
    
    if (fullProfile) {
      fullProfile.permissions.forEach((p: any) => {
        permMap.set(p.permission.code, p.permission.type);
      });

      fullProfile.overrides.forEach((o: any) => {
        if (o.effect === 'ALLOW') {
          permMap.set(o.permission.code, o.permission.type);
        } else {
          permMap.delete(o.permission.code);
        }
      });
    }

    const permissions: string[] = [];
    const menus: string[] = [];
    const components: string[] = [];

    Array.from(permMap.entries()).forEach(([code, type]) => {
      permissions.push(code);
      if (type === 'MENU') menus.push(code);
      if (type === 'COMPONENT') components.push(code);
    });

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

  private generateAccessToken(userId: string, sessionId: string, membershipId: string | null) {
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