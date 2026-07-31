import { ErrorCode } from '../enum/error-code.enum';
import { SuccessMessageCode } from '../enum/success-message-code.enum';
import errorMessages from './errors.json';
import successMessages from './success.json';

export function getErrorMessage(code: ErrorCode): string {
  return errorMessages[code] ?? errorMessages[ErrorCode.INTERNAL_SERVER_ERROR];
}

export function getSuccessMessage(code: SuccessMessageCode): string {
  return (
    successMessages[code] ?? successMessages[SuccessMessageCode.OPERATION_SUCCESS]
  );
}
