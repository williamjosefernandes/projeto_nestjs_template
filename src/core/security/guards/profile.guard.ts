import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PROFILES_KEY } from '../decorators/metadata.decorators';
import { AuthenticatedRequest } from '../interfaces/request-context.interface';
import { ProfileInvalidException } from '../exceptions/security.exceptions';

@Injectable()
export class ProfileGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredProfiles = this.reflector.getAllAndOverride<string[]>(PROFILES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredProfiles || requiredProfiles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const profile = request.profile;

    if (!profile || !profile.isActive || !requiredProfiles.includes(profile.name)) {
      throw new ProfileInvalidException();
    }

    return true;
  }
}
