import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../enum/error-code.enum';
import { ErrorMessage } from '../enum/error-message.map';

export interface AppExceptionBody {
  code: ErrorCode;
  message: string;
  details?: unknown;
}

/**
 * Base de todas as exceções de negócio da aplicação. `code` é o título do
 * erro (`ErrorCode`); `message` é a descrição que o usuário vê e é sempre
 * resolvida a partir de `ErrorMessage[code]` — nunca escrita no call site,
 * para não haver dois lugares com textos divergentes para o mesmo erro.
 * Use `details` para dados dinâmicos que não pertencem à mensagem (ex.:
 * lista de papéis exigidos, causa original de um erro de infraestrutura).
 */
export class AppException extends HttpException {
  readonly code: ErrorCode;

  constructor(status: HttpStatus, code: ErrorCode, details?: unknown) {
    super({ code, message: ErrorMessage[code], details }, status);
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
