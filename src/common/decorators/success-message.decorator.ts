import { SetMetadata } from '@nestjs/common';
import { SuccessMessageCode } from '../enum/success-message-code.enum';

export const SUCCESS_MESSAGE_KEY = 'successMessage';

/** Anexa o código de mensagem de sucesso resolvido via i18n pelo `TransformInterceptor`. */
export const SuccessMessage = (code: SuccessMessageCode) =>
  SetMetadata(SUCCESS_MESSAGE_KEY, code);
