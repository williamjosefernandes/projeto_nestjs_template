import { ErrorCode } from '../../../common/enum/error-code.enum';
import { UnauthorizedAppException, ForbiddenAppException } from '../../../common/exceptions/app.exception';

export class InvalidTokenException extends UnauthorizedAppException {
  constructor() {
    super(ErrorCode.INVALID_TOKEN);
  }
}

export class TokenExpiredException extends UnauthorizedAppException {
  constructor() {
    super(ErrorCode.TOKEN_EXPIRED);
  }
}

export class SessionExpiredException extends UnauthorizedAppException {
  constructor() {
    super(ErrorCode.SESSION_EXPIRED);
  }
}

export class SessionRevokedException extends UnauthorizedAppException {
  constructor() {
    super(ErrorCode.SESSION_REVOKED);
  }
}

export class AccountInactiveException extends ForbiddenAppException {
  constructor() {
    super(ErrorCode.ACCOUNT_INACTIVE);
  }
}

export class UserBlockedException extends ForbiddenAppException {
  constructor() {
    super(ErrorCode.USER_BLOCKED);
  }
}

export class MembershipInvalidException extends ForbiddenAppException {
  constructor() {
    super(ErrorCode.MEMBERSHIP_INVALID);
  }
}

export class ProfileInvalidException extends ForbiddenAppException {
  constructor() {
    super(ErrorCode.PROFILE_INVALID);
  }
}

export class PermissionDeniedException extends ForbiddenAppException {
  constructor() {
    super(ErrorCode.PERMISSION_DENIED);
  }
}
