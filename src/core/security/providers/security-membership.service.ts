import { Injectable } from '@nestjs/common';
import { ISecurityMembershipService } from '../interfaces/security-providers.interface';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class SecurityMembershipService implements ISecurityMembershipService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveMembership(userId: string, accountId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId,
        accountId,
        status: 'ACTIVE',
      },
      include: {
        account: true,
        profile: true,
      },
    });

    if (!membership) return null;

    return {
      id: membership.id,
      accountId: membership.accountId,
      userId: membership.userId,
      isActive: membership.status === 'ACTIVE',
      account: {
        id: membership.account.id,
        name: membership.account.name,
        isActive: membership.account.active,
      },
      profile: {
        id: membership.profile.id,
        name: membership.profile.name,
        isActive: true,
      },
    };
  }

  async getProfilePermissions(membershipId: string): Promise<{ code: string; type: string }[]> {
    const membership = await this.prisma.membership.findUnique({
      where: { id: membershipId },
      include: {
        profile: {
          include: {
            permissions: {
              include: { permission: true }
            }
          }
        }
      }
    });

    if (!membership || !membership.profile) return [];

    return membership.profile.permissions.map(pp => ({
      code: pp.permission.code,
      type: pp.permission.type as string
    }));
  }

  async getPermissionOverrides(membershipId: string): Promise<{ code: string; type: string; isDenied: boolean }[]> {
    const membership = await this.prisma.membership.findUnique({
      where: { id: membershipId },
      include: {
        profile: {
          include: {
            overrides: {
              include: { permission: true }
            }
          }
        }
      }
    });

    if (!membership || !membership.profile) return [];

    return membership.profile.overrides.map(po => ({
      code: po.permission.code,
      type: po.permission.type as string,
      isDenied: po.effect === 'DENY'
    }));
  }
}
