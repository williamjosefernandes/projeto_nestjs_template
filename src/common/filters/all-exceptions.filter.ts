import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AppException, AppExceptionBody } from '../exceptions/app.exception';
import { ErrorCode } from '../enum/error-code.enum';
import { ErrorMessage } from '../enum/error-message.map';
import { generateRequestId } from '../utils/request-id.util';

interface ResolvedError {
  code: ErrorCode;
  message: string;
  details?: unknown;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const { code, message, details } = this.resolveError(exception, status);
    const rawMessage = exception instanceof Error ? exception.message : String(exception);

    this.logger.error(`HTTP ${status} [${code}] ${rawMessage}`, exception instanceof Error ? exception.stack : undefined);

    response.status(status).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: { code, message, ...(details !== undefined ? { details } : {}) },
      requestId: generateRequestId(),
    });
  }

  /**
   * Toda exceção da aplicação deve ser um `AppException` (código + mensagem
   * já resolvidos via `ErrorMessage`). Os demais ramos são fallback
   * defensivo para exceções de terceiros (Passport, Prisma, etc.) — a
   * mensagem exibida ao usuário vem sempre do mapa, nunca do texto bruto da
   * exceção (que só é logado, nunca devolvido na resposta).
   */
  private resolveError(exception: unknown, status: number): ResolvedError {
    if (exception instanceof AppException) {
      const body = exception.getResponse() as AppExceptionBody;
      return { code: body.code, message: body.message, details: body.details };
    }

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      const rawMessage = typeof body === 'object' && body !== null && 'message' in body ? (body as any).message : body;

      // ValidationPipe (class-validator) reporta uma lista de mensagens, uma por violação.
      if (Array.isArray(rawMessage)) {
        return { code: ErrorCode.VALIDATION_ERROR, message: ErrorMessage[ErrorCode.VALIDATION_ERROR], details: rawMessage };
      }

      const code = this.fallbackCodeForStatus(status);
      return { code, message: ErrorMessage[code] };
    }

    return { code: ErrorCode.INTERNAL_SERVER_ERROR, message: ErrorMessage[ErrorCode.INTERNAL_SERVER_ERROR] };
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
      default:
        return ErrorCode.INTERNAL_SERVER_ERROR;
    }
  }
}
