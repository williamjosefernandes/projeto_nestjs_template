import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    // Role check logic depends on how user permissions are stored in the request
    // For now we assume user.permissions or user.role might exist if needed.
    // If not, we allow for now, but this should check against context permissions
    const userRoles: string[] = user.permissions || [user.role].filter(Boolean);
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));
    
    if (!hasRole) {
      throw new ForbiddenException(`Require one of the following roles/permissions: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}