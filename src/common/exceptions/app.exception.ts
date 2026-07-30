import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.BAD_REQUEST, details?: any) {
    super(
      {
        statusCode: status,
        error: HttpStatus[status],
        message,
        details,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }
}