import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces/request-context.interface';
import { MembershipInvalidException, AccountInactiveException } from '../exceptions/security.exceptions';
import { ISecurityMembershipService } from '../interfaces/security-providers.interface';

@Injectable()
export class MembershipGuard implements CanActivate {
  constructor(
    @Inject('I_SECURITY_MEMBERSHIP_SERVICE') private readonly membershipService: ISecurityMembershipService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const accountId = request.headers['x-account-id'] as string;
    
    if (!accountId) {
      throw new MembershipInvalidException();
    }

    const membership = await this.membershipService.getActiveMembership(request.user.id, accountId);
    
    if (!membership || !membership.isActive) {
      throw new MembershipInvalidException();
    }

    if (!membership.account || !membership.account.isActive) {
      throw new AccountInactiveException();
    }

    request.account = membership.account;
    request.profile = membership.profile;
    request.membership = {
      id: membership.id,
      accountId: membership.accountId,
      userId: membership.userId,
      isActive: membership.isActive,
    };

    return true;
  }
}
