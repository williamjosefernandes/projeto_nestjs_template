import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  private getErrorCode(status: number, message: string): string {
    if (message.includes('Invalid email or password') || message.includes('Invalid credentials')) {
      return 'INVALID_EMAIL_OR_PASSWORD';
    }
    if (message.includes('Email not verified')) {
      return 'EMAIL_NOT_VERIFIED';
    }
    if (message.includes('Account locked')) {
      return 'ACCOUNT_LOCKED';
    }
    if (message.includes('Account disabled')) {
      return 'ACCOUNT_DISABLED';
    }
    if (message.includes('Account deleted')) {
      return 'ACCOUNT_DELETED';
    }
    if (message.includes('Password expired')) {
      return 'PASSWORD_EXPIRED';
    }
    if (message.includes('Too many attempts')) {
      return 'TOO_MANY_ATTEMPTS';
    }
    if (message.includes('Invalid refresh token')) {
      return 'INVALID_REFRESH_TOKEN';
    }
    if (message.includes('Token expired')) {
      return 'TOKEN_EXPIRED';
    }
    if (message.includes('Token revoked')) {
      return 'TOKEN_REVOKED';
    }
    if (message.includes('Session expired')) {
      return 'SESSION_EXPIRED';
    }
    if (message.includes('Invalid email')) {
      return 'INVALID_EMAIL';
    }
    if (message.includes('Invalid password')) {
      return 'INVALID_PASSWORD';
    }
    if (message.includes('Invalid code')) {
      return 'INVALID_CODE';
    }
    if (message.includes('Code expired')) {
      return 'CODE_EXPIRED';
    }
    if (message.includes('Password too weak')) {
      return 'PASSWORD_TOO_WEAK';
    }
    if (message.includes('Password reused')) {
      return 'PASSWORD_REUSED';
    }
    if (message.includes('Token invalid')) {
      return 'TOKEN_INVALID';
    }
    if (message.includes('Token already used')) {
      return 'TOKEN_ALREADY_USED';
    }
    if (status === HttpStatus.UNAUTHORIZED) {
      return 'UNAUTHORIZED';
    }
    if (status === HttpStatus.FORBIDDEN) {
      return 'FORBIDDEN';
    }
    if (status === HttpStatus.NOT_FOUND) {
      return 'NOT_FOUND';
    }
    if (status === HttpStatus.CONFLICT) {
      return 'CONFLICT';
    }
    if (status === HttpStatus.BAD_REQUEST) {
      return 'BAD_REQUEST';
    }
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      return 'INTERNAL_SERVER_ERROR';
    }
    return 'UNKNOWN_ERROR';
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception instanceof Error
        ? exception.message
        : 'Internal server error';

    const messageString = typeof message === 'object' && (message as any).message ? (message as any).message : String(message);

    this.logger.error(
      `HTTP Status: ${status} Error Message: ${messageString}`,
      exception instanceof Error ? exception.stack : '',
    );

    const errorCode = this.getErrorCode(status, messageString);
    const requestId = `req_${uuidv4().substring(0, 8)}`;

    const errorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      error: {
        code: errorCode,
        message: messageString,
      },
      requestId,
    };

    response.status(status).json(errorResponse);
  }
}