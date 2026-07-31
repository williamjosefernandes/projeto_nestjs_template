import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces/request-context.interface';
import {
  SessionRevokedException,
  InvalidTokenException,
} from '../exceptions/security.exceptions';
import { ISecuritySessionService } from '../interfaces/security-providers.interface';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    @Inject('I_SECURITY_SESSION_SERVICE')
    private readonly sessionService: ISecuritySessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user || !user.sessionId) {
      throw new InvalidTokenException();
    }

    const session = await this.sessionService.validateAndGetSession(
      user.sessionId,
    );

    if (!session || !session.isActive) {
      throw new SessionRevokedException();
    }

    request.session = session;
    return true;
  }
}
