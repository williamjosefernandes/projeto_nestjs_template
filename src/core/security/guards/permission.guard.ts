import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/metadata.decorators';
import { AuthenticatedRequest } from '../interfaces/request-context.interface';
import { PermissionDeniedException } from '../exceptions/security.exceptions';
import { AuthorizationService } from '../services/authorization.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.membership || !request.membership.id) {
      throw new PermissionDeniedException();
    }

    const userAccess = await this.authService.calculatePermissions(
      request.membership.id,
    );
    request.permissions = userAccess.permissions;
    request.menus = userAccess.menus;
    request.components = userAccess.components;

    const hasPermission = requiredPermissions.every((perm) =>
      userAccess.permissions.includes(perm),
    );

    if (!hasPermission) {
      throw new PermissionDeniedException();
    }

    return true;
  }
}
