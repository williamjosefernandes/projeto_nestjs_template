import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppException, AppExceptionBody } from '../exceptions/app.exception';
import { ErrorCode } from '../enum/error-code.enum';
import { getErrorMessage } from '../messages/messages.util';
import { generateRequestId } from '../utils/request-id.util';

interface ResolvedError {
  code: ErrorCode;
  details?: unknown;
}

@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request & { requestId?: string }>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const { code, details } = this.resolveError(exception, status);
    const message = getErrorMessage(code);
    const rawMessage =
      exception instanceof Error ? exception.message : String(exception);

    this.logger.error(
      `HTTP ${status} [${code}] ${rawMessage}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: { code, message, ...(details !== undefined ? { details } : {}) },
      requestId: request.requestId ?? generateRequestId(),
    });
  }

  /**
   * Toda exceção da aplicação deve ser um `AppException` (só carrega o
   * `code`). Os demais ramos são fallback defensivo para exceções de
   * terceiros (Passport, Prisma, etc.) — a mensagem exibida ao usuário é
   * sempre resolvida via `errors.json` a partir do `code`, nunca do texto
   * bruto da exceção (que só é logado, nunca devolvido na resposta).
   */
  private resolveError(exception: unknown, status: number): ResolvedError {
    if (exception instanceof AppException) {
      const body = exception.getResponse() as AppExceptionBody;
      return { code: body.code, details: body.details };
    }

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      const rawMessage =
        typeof body === 'object' && body !== null && 'message' in body
          ? (body as any).message
          : body;

      // ValidationPipe (class-validator) reporta uma lista de mensagens, uma por violação.
      if (Array.isArray(rawMessage)) {
        return { code: ErrorCode.VALIDATION_ERROR, details: rawMessage };
      }

      return { code: this.fallbackCodeForStatus(status) };
    }

    return { code: ErrorCode.INTERNAL_SERVER_ERROR };
  }

  private fallbackCodeForStatus(status: number): ErrorCode {
    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHENTICATED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.PERMISSION_DENIED;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCode.CONFLICT;
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.BAD_REQUEST;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ErrorCode.RATE_LIMITED;
      default:
        return ErrorCode.INTERNAL_SERVER_ERROR;
    }
  }
}
