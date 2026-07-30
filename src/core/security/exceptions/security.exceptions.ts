import { UnauthorizedException, ForbiddenException } from '@nestjs/common';

export class InvalidTokenException extends UnauthorizedException {
  constructor() { super('Token JWT inválido ou malformado.'); }
}

export class TokenExpiredException extends UnauthorizedException {
  constructor() { super('Token JWT expirado.'); }
}

export class SessionExpiredException extends UnauthorizedException {
  constructor() { super('Sessão expirada.'); }
}

export class SessionRevokedException extends UnauthorizedException {
  constructor() { super('Sessão revogada.'); }
}

export class AccountInactiveException extends ForbiddenException {
  constructor() { super('Conta inativa ou bloqueada.'); }
}

export class UserBlockedException extends ForbiddenException {
  constructor() { super('Usuário bloqueado.'); }
}

export class MembershipInvalidException extends ForbiddenException {
  constructor() { super('Usuário não possui acesso a esta conta.'); }
}

export class ProfileInvalidException extends ForbiddenException {
  constructor() { super('Perfil inválido para acessar este recurso.'); }
}

export class PermissionDeniedException extends ForbiddenException {
  constructor() { super('Permissão negada.'); }
}
