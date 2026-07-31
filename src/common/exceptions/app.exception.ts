import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../enum/error-code.enum';

export interface AppExceptionBody {
  code: ErrorCode;
  details?: unknown;
}

/**
 * Base de todas as exceções de negócio da aplicação. `code` é a única fonte
 * de verdade do erro — a mensagem localizada é resolvida pelo
 * `AllExceptionsFilter` via i18n a partir dele, nunca escrita no call site.
 * Use `details` para dados dinâmicos que não pertencem à mensagem (ex.:
 * lista de papéis exigidos, causa original de um erro de infraestrutura).
 */
export class AppException extends HttpException {
  readonly code: ErrorCode;

  constructor(status: HttpStatus, code: ErrorCode, details?: unknown) {
    super({ code, details }, status);
    this.code = code;
  }
}

export class BadRequestAppException extends AppException {
  constructor(code: ErrorCode, details?: unknown) {
    super(HttpStatus.BAD_REQUEST, code, details);
  }
}

export class UnauthorizedAppException extends AppException {
  constructor(code: ErrorCode, details?: unknown) {
    super(HttpStatus.UNAUTHORIZED, code, details);
  }
}

export class ForbiddenAppException extends AppException {
  constructor(code: ErrorCode, details?: unknown) {
    super(HttpStatus.FORBIDDEN, code, details);
  }
}

export class NotFoundAppException extends AppException {
  constructor(code: ErrorCode, details?: unknown) {
    super(HttpStatus.NOT_FOUND, code, details);
  }
}

export class ConflictAppException extends AppException {
  constructor(code: ErrorCode, details?: unknown) {
    super(HttpStatus.CONFLICT, code, details);
  }
}

export class InternalServerErrorAppException extends AppException {
  constructor(code: ErrorCode, details?: unknown) {
    super(HttpStatus.INTERNAL_SERVER_ERROR, code, details);
  }
}
