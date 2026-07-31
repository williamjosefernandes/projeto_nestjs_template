import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SKIP_TRANSFORM_KEY } from '../decorators/skip-transform.decorator';
import { SUCCESS_MESSAGE_KEY } from '../decorators/success-message.decorator';
import { SuccessMessageCode } from '../enum/success-message-code.enum';
import { getSuccessMessage } from '../messages/messages.util';
import { generateRequestId } from '../utils/request-id.util';
import { ApiResponseDto } from '../dto/api-response.dto';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponseDto<T> | T
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseDto<T> | T> {
    const skipTransform = this.reflector.getAllAndOverride<boolean>(
      SKIP_TRANSFORM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipTransform) {
      return next.handle();
    }

    const messageCode =
      this.reflector.getAllAndOverride<SuccessMessageCode>(
        SUCCESS_MESSAGE_KEY,
        [context.getHandler(), context.getClass()],
      ) ?? SuccessMessageCode.OPERATION_SUCCESS;

    const request = context
      .switchToHttp()
      .getRequest<Request & { requestId?: string }>();
    const message = getSuccessMessage(messageCode);

    return next.handle().pipe(
      map((data) => ({
        success: true,
        timestamp: new Date().toISOString(),
        message,
        messageCode,
        ...(data !== undefined ? { data } : {}),
        requestId: request.requestId ?? generateRequestId(),
      })),
    );
  }
}
