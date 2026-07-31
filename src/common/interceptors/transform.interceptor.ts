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
import { I18nContext, I18nService } from 'nestjs-i18n';
import { SKIP_TRANSFORM_KEY } from '../decorators/skip-transform.decorator';
import { SUCCESS_MESSAGE_KEY } from '../decorators/success-message.decorator';
import { SuccessMessageCode } from '../enum/success-message-code.enum';
import { generateRequestId } from '../utils/request-id.util';
import { ApiResponseDto } from '../dto/api-response.dto';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponseDto<T> | T
> {
  constructor(
    private readonly reflector: Reflector,
    private readonly i18n: I18nService,
  ) {}

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
    const lang = I18nContext.current(context)?.lang;
    const message = this.i18n.t(`success.${messageCode}`, { lang });

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
