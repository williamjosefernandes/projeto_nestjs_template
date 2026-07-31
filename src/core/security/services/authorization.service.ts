import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ISecurityMembershipService } from '../interfaces/security-providers.interface';

@Injectable()
export class AuthorizationService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject('I_SECURITY_MEMBERSHIP_SERVICE') private readonly membershipService: ISecurityMembershipService
  ) {}

  async calculatePermissions(membershipId: string): Promise<{ permissions: string[], menus: string[], components: string[] }> {
    const cacheKey = `permissions:membership:${membershipId}`;
    const cachedPermissions = await this.cacheManager.get<{ permissions: string[], menus: string[], components: string[] }>(cacheKey);
    
    if (cachedPermissions) {
      return cachedPermissions;
    }

    const basePermissions = await this.membershipService.getProfilePermissions(membershipId);
    const overrides = await this.membershipService.getPermissionOverrides(membershipId);

    const permMap = new Map<string, string>();

    basePermissions.forEach(p => {
      permMap.set(p.code, p.type);
    });

    overrides.forEach(override => {
      if (override.isDenied) {
        permMap.delete(override.code);
      } else {
        permMap.set(override.code, override.type);
      }
    });

    const permissions: string[] = [];
    const menus: string[] = [];
    const components: string[] = [];

    Array.from(permMap.entries()).forEach(([code, type]) => {
      if (type === 'API') permissions.push(code);
      else if (type === 'MENU') menus.push(code);
      else if (type === 'COMPONENT') components.push(code);
    });

    const resolvedPermissions = { permissions, menus, components };
    
    await this.cacheManager.set(cacheKey, resolvedPermissions, 3600 * 1000); // 1 hora
    
    return resolvedPermissions;
  }
}
