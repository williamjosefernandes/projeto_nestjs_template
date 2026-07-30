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

  async calculatePermissions(membershipId: string): Promise<string[]> {
    const cacheKey = `permissions:membership:${membershipId}`;
    const cachedPermissions = await this.cacheManager.get<string[]>(cacheKey);
    
    if (cachedPermissions) {
      return cachedPermissions;
    }

    const basePermissions = await this.membershipService.getProfilePermissions(membershipId);
    const overrides = await this.membershipService.getPermissionOverrides(membershipId);

    const finalPermissions = new Set<string>(basePermissions.map(p => p.code));

    for (const override of overrides) {
      if (override.isDenied) {
        finalPermissions.delete(override.code);
      } else {
        finalPermissions.add(override.code);
      }
    }

    const resolvedPermissions = Array.from(finalPermissions);
    
    await this.cacheManager.set(cacheKey, resolvedPermissions, 3600 * 1000); // 1 hora
    
    return resolvedPermissions;
  }
}
