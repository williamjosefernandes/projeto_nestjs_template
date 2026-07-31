import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { EmailService } from '../email/email.service';
import { AuthorizationService } from '../core/security/services/authorization.service';
import { Prisma, TokenType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { addHours } from 'date-fns';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { UpdatePreferencesDto } from './dtos/update-preferences.dto';
import {
  CreateUserAdminDto,
  UpdateUserAdminDto,
  UpdateUserStatusDto,
} from './dtos/admin-users.dto';
import { ErrorCode } from '../common/enum/error-code.enum';
import {
  NotFoundAppException,
  BadRequestAppException,
  ForbiddenAppException,
  ConflictAppException,
} from '../common/exceptions/app.exception';
import { UserMeResponseDto } from './dtos/user-responses.dto';
import { ListUsersQueryDto } from './dtos/list-users-query.dto';
import { PageMetaDto } from '../common/pagination/pagination-info-response.dto';
import { SessionResponseDto } from '../auth/dtos/session.dto';

/** Nunca inclui `password` — único `select` usado para os endpoints `me/*`. */
const USER_ME_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  avatar: true,
  status: true,
  authProvider: true,
  emailVerifiedAt: true,
  lastLoginAt: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

type UserMeRow = Prisma.UserGetPayload<{ select: typeof USER_ME_SELECT }>;

function toMeResponse(user: UserMeRow): UserMeResponseDto {
  const { emailVerifiedAt, ...rest } = user;
  return { ...rest, emailVerified: !!emailVerifiedAt };
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  // ============================================================================
  // Basic CRUD for Auth/Internal
  // ============================================================================

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email?: string | null) {
    if (!email) return null;
    return this.prisma.user.findUnique({ where: { email } });
  }

  /** Busca pela chave de login universal (email, telefone ou UID do Firebase — o que identificar o usuário no provider usado). */
  async findByUsername(username?: string | null) {
    if (!username) return null;
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findByPhone(phone?: string | null) {
    if (!phone) return null;
    return this.prisma.user.findUnique({ where: { phone } });
  }

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({ where: { id }, data });
  }

  // ============================================================================
  // Identity - Meu Perfil
  // ============================================================================

  async getMe(userId: string): Promise<UserMeResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: USER_ME_SELECT,
    });
    if (!user) throw new NotFoundAppException(ErrorCode.USER_NOT_FOUND);
    return toMeResponse(user);
  }

  async updateMe(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserMeResponseDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      },
      select: USER_ME_SELECT,
    });
    return toMeResponse(user);
  }

  async updateAvatar(userId: string, _file: any) {
    // Aqui viria a integração com S3/GCS.
    const fakeUrl = `https://cdn.example.com/avatars/${userId}-${Date.now()}.png`;
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: fakeUrl },
    });
    return { avatarUrl: fakeUrl };
  }

  async removeAvatar(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundAppException(ErrorCode.USER_NOT_FOUND);

    if (!user.password)
      throw new BadRequestAppException(ErrorCode.INVALID_CURRENT_PASSWORD);
    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid)
      throw new BadRequestAppException(ErrorCode.INVALID_CURRENT_PASSWORD);

    const newHash = await bcrypt.hash(dto.newPassword, 10);

    // Transaction to update password and revoke other sessions (mocked logic for session revocation)
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { password: newHash },
      });
      // Invalida outras sessões exceto a atual (a ser implementado dependendo de onde fica o refresh token exato da req)
      await tx.session.deleteMany({
        where: { userId },
      });
    });
  }

  async getPreferences(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        theme: true,
        language: true,
        timezone: true,
        timeFormat: true,
      },
    });
    if (!user) throw new NotFoundAppException(ErrorCode.USER_NOT_FOUND);
    return user;
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    return this.prisma.user.update({
      where: { id: userId },
      // Os enums do DTO espelham os do Prisma valor a valor — conversão seguro no limite ORM/API.
      data: { ...dto } as Prisma.UserUpdateInput,
      select: {
        theme: true,
        language: true,
        timezone: true,
        timeFormat: true,
      },
    });
  }

  async getAccounts(userId: string) {
    return this.prisma.membership.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        account: { active: true, deletedAt: null },
      },
      include: { account: true, profile: true },
    });
  }

  /** Delega para `AuthorizationService`, fonte única do cálculo de permissões (com cache). */
  async getPermissions(membershipId: string) {
    return this.authorizationService.calculatePermissions(membershipId);
  }

  async getSessions(
    userId: string,
    currentSessionId?: string,
  ): Promise<SessionResponseDto[]> {
    const sessions = await this.prisma.session.findMany({
      where: { userId, revokedAt: null },
      orderBy: { updatedAt: 'desc' },
    });

    return sessions.map((s) => ({
      id: s.id,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      loggedInAt: s.createdAt,
      lastAccessAt: s.updatedAt,
      isCurrentSession: s.id === currentSessionId,
    }));
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) throw new NotFoundAppException(ErrorCode.SESSION_NOT_FOUND);

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  // ============================================================================
  // Platform / Admin Users
  // ============================================================================

  async getPublicProfile(id: string, currentAccountId: string) {
    // Validar se eles pertencem a mesma conta
    const membership = await this.prisma.membership.findFirst({
      where: { userId: id, accountId: currentAccountId },
      include: { user: true },
    });
    if (!membership)
      throw new NotFoundAppException(ErrorCode.USER_NOT_FOUND_IN_ACCOUNT);

    return {
      id: membership.user.id,
      firstName: membership.user.firstName,
      lastName: membership.user.lastName,
      avatar: membership.user.avatar,
    };
  }

  async listUsers(currentAccountId: string, query: ListUsersQueryDto) {
    const { page, size, search, status } = query;
    const skip = (page - 1) * size;

    const whereClause: Prisma.MembershipWhereInput = {
      accountId: currentAccountId,
      status: { not: 'REMOVED' },
    };

    if (status) whereClause.status = status;
    if (search) {
      whereClause.user = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [total, items] = await Promise.all([
      this.prisma.membership.count({ where: whereClause }),
      this.prisma.membership.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              username: true,
              phone: true,
              avatar: true,
              status: true,
              authProvider: true,
              emailVerifiedAt: true,
              lastLoginAt: true,
              createdAt: true,
            },
          },
          profile: true,
        },
        skip,
        take: size,
      }),
    ]);

    return {
      ...PageMetaDto.create({ page, size, totalElements: total }),
      content: items,
    };
  }

  async createUserAdmin(
    currentAccountId: string,
    dto: CreateUserAdminDto,
  ): Promise<UserMeResponseDto> {
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: USER_ME_SELECT,
    });
    const isNewUser = !user;

    await this.prisma.$transaction(async (tx) => {
      if (!user) {
        user = await tx.user.create({
          data: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            username: dto.email,
            email: dto.email,
            phone: dto.phone,
            // Senha aleatória e sem uso prático — o usuário só consegue acessar a conta
            // depois de definir a própria senha pelo link enviado em sendSetPasswordEmail.
            password: await bcrypt.hash(uuidv4(), 10),
          },
          select: USER_ME_SELECT,
        });
      }

      const existingMem = await tx.membership.findFirst({
        where: { userId: user.id, accountId: currentAccountId },
      });

      if (existingMem)
        throw new ConflictAppException(ErrorCode.USER_ALREADY_IN_ACCOUNT);

      await tx.membership.create({
        data: {
          accountId: currentAccountId,
          userId: user.id,
          profileId: dto.profileId,
          status: 'INVITED',
        },
      });
    });

    if (isNewUser) {
      await this.sendSetPasswordEmail(user);
    }

    return toMeResponse(user);
  }

  /** Reaproveita o mecanismo de reset de senha para que o usuário recém-convidado defina a própria senha. */
  private async sendSetPasswordEmail(user: {
    id: string;
    email: string;
    firstName: string;
  }) {
    const resetToken = uuidv4();
    await this.prisma.token.create({
      data: {
        userId: user.id,
        type: TokenType.PASSWORD_RESET,
        token: await bcrypt.hash(resetToken, 10),
        expiresAt: addHours(new Date(), 24),
      },
    });

    const resetLink = `${this.configService.get<string>('app.frontendUrl')}/reset-password?token=${resetToken}`;
    await this.emailService.resetPassword({
      url: resetLink,
      name: user.firstName,
      email: user.email,
    });
  }

  async updateUserAdmin(
    currentAccountId: string,
    id: string,
    dto: UpdateUserAdminDto,
  ) {
    const mem = await this.prisma.membership.findFirst({
      where: { userId: id, accountId: currentAccountId },
    });
    if (!mem)
      throw new NotFoundAppException(ErrorCode.USER_NOT_FOUND_IN_ACCOUNT);

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      },
      select: USER_ME_SELECT,
    });
    return toMeResponse(user);
  }

  async softDeleteUser(currentAccountId: string, id: string) {
    const mem = await this.prisma.membership.findFirst({
      where: { userId: id, accountId: currentAccountId },
      include: { profile: true },
    });
    if (!mem)
      throw new NotFoundAppException(ErrorCode.USER_NOT_FOUND_IN_ACCOUNT);
    // `Profile.name` é salvo como 'Owner' (ver seed) — comparar em maiúsculas,
    // mesma normalização usada em auth.service.ts::loadContext para `profile.code`.
    // Comparar direto com 'OWNER' nunca batia e deixava essa proteção inoperante.
    if (mem.profile.name.toUpperCase() === 'OWNER')
      throw new ForbiddenAppException(ErrorCode.CANNOT_DELETE_OWNER);

    await this.prisma.membership.update({
      where: { id: mem.id },
      data: { status: 'REMOVED' },
    });
  }

  async updateUserStatus(
    currentAccountId: string,
    id: string,
    dto: UpdateUserStatusDto,
  ) {
    const mem = await this.prisma.membership.findFirst({
      where: { userId: id, accountId: currentAccountId },
      include: { profile: true },
    });
    if (!mem)
      throw new NotFoundAppException(ErrorCode.USER_NOT_FOUND_IN_ACCOUNT);

    const isOwner = mem.profile.name.toUpperCase() === 'OWNER';
    // `MembershipStatus` não tem um valor "BLOCKED" — SUSPENDED é o equivalente
    // a bloquear o vínculo desta conta; REMOVED equivale ao soft delete (ver
    // `softDeleteUser`, que usa o mesmo `CANNOT_DELETE_OWNER` para esse caso).
    if (isOwner && dto.status === 'SUSPENDED') {
      throw new ForbiddenAppException(ErrorCode.CANNOT_BLOCK_OWNER);
    }
    if (isOwner && dto.status === 'REMOVED') {
      throw new ForbiddenAppException(ErrorCode.CANNOT_DELETE_OWNER);
    }

    await this.prisma.membership.update({
      where: { id: mem.id },
      data: { status: dto.status },
    });
  }
}
