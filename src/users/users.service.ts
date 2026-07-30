import { Injectable, NotFoundException, ConflictException, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { User, Prisma, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { UpdatePreferencesDto } from './dtos/update-preferences.dto';
import { CreateUserAdminDto, UpdateUserAdminDto, UpdateUserStatusDto } from './dtos/admin-users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // Basic CRUD for Auth/Internal
  // ============================================================================

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
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

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { preference: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      },
      include: { preference: true },
    });
  }

  async updateAvatar(userId: string, file: any) {
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
    if (!user) throw new NotFoundException('User not found');

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) throw new BadRequestException('Invalid current password');

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
    let pref = await this.prisma.userPreference.findUnique({ where: { userId } });
    if (!pref) {
      pref = await this.prisma.userPreference.create({ data: { userId } });
    }
    return pref;
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    if (dto.defaultMembershipId) {
      const membership = await this.prisma.membership.findFirst({
        where: { id: dto.defaultMembershipId, userId },
      });
      if (!membership) {
        throw new BadRequestException('Membership not found or does not belong to user');
      }
    }

    return this.prisma.userPreference.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: { ...dto },
    });
  }

  async getAccounts(userId: string) {
    return this.prisma.membership.findMany({
      where: { userId, status: 'ACTIVE', account: { active: true, deletedAt: null } },
      include: { account: true, profile: true },
    });
  }

  async getPermissions(userId: string, currentAccountId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId, accountId: currentAccountId },
      include: {
        profile: {
          include: {
            permissions: { include: { permission: true } },
            overrides: { include: { permission: true } }
          }
        }
      }
    });

    if (!membership) throw new ForbiddenException('User is not a member of this account');

    // Mapeamento mockado das permissões do profile
    const permissions = membership.profile.permissions.map(p => p.permission.code);
    const overrides = membership.profile.overrides.map(o => ({ code: o.permission.code, effect: o.effect }));

    return { permissions, overrides, menus: [], components: [] };
  }

  async getSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId, revokedAt: null },
      orderBy: { lastAccessAt: 'desc' }, // Assumindo lastAccessAt = updatedAt ou similar
    } as any);
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) throw new NotFoundException('Session not found');

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
    if (!membership) throw new NotFoundException('User not found in this account');

    return {
      id: membership.user.id,
      firstName: membership.user.firstName,
      lastName: membership.user.lastName,
      avatar: membership.user.avatar,
    };
  }

  async listUsers(currentAccountId: string, query: any) {
    const { page = 1, size = 10, search, status } = query;
    const skip = (page - 1) * size;

    const whereClause: Prisma.MembershipWhereInput = {
      accountId: currentAccountId,
      status: { not: 'REMOVED' }
    };

    if (status) whereClause.status = status;
    if (search) {
      whereClause.user = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ]
      };
    }

    const [total, items] = await Promise.all([
      this.prisma.membership.count({ where: whereClause }),
      this.prisma.membership.findMany({
        where: whereClause,
        include: { user: true, profile: true },
        skip: Number(skip),
        take: Number(size),
      })
    ]);

    return { items, meta: { total, page: Number(page), size: Number(size), pages: Math.ceil(total / size) } };
  }

  async createUserAdmin(currentAccountId: string, dto: CreateUserAdminDto) {
    let user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    await this.prisma.$transaction(async (tx) => {
      if (!user) {
        user = await tx.user.create({
          data: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            phone: dto.phone,
            password: 'TEMP_PASSWORD_NEEDS_RESET', // Mock password until reset logic
          }
        });
      }

      const existingMem = await tx.membership.findFirst({
        where: { userId: user.id, accountId: currentAccountId }
      });

      if (existingMem) throw new ConflictException('User is already in this account');

      await tx.membership.create({
        data: {
          accountId: currentAccountId,
          userId: user.id,
          profileId: dto.profileId,
          status: 'INVITED',
        }
      });
      // VerificationToken logic here...
    });

    return user;
  }

  async updateUserAdmin(currentAccountId: string, id: string, dto: UpdateUserAdminDto) {
    const mem = await this.prisma.membership.findFirst({
      where: { userId: id, accountId: currentAccountId }
    });
    if (!mem) throw new NotFoundException('User not found in account');

    return this.prisma.user.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      }
    });
  }

  async softDeleteUser(currentAccountId: string, id: string) {
    const mem = await this.prisma.membership.findFirst({
      where: { userId: id, accountId: currentAccountId },
      include: { profile: true }
    });
    if (!mem) throw new NotFoundException('User not found in account');
    // Basic owner protection logic (simplified)
    if (mem.profile.name === 'OWNER') throw new ForbiddenException('Cannot delete owner');

    await this.prisma.membership.update({
      where: { id: mem.id },
      data: { status: 'REMOVED' }
    });
  }

  async updateUserStatus(currentAccountId: string, id: string, dto: UpdateUserStatusDto) {
    const mem = await this.prisma.membership.findFirst({
      where: { userId: id, accountId: currentAccountId },
      include: { profile: true }
    });
    if (!mem) throw new NotFoundException('User not found in account');
    if (mem.profile.name === 'OWNER' && dto.status === 'BLOCKED') {
      throw new ForbiddenException('Cannot block owner');
    }

    await this.prisma.membership.update({
      where: { id: mem.id },
      data: { status: dto.status as any }
    });
  }
}