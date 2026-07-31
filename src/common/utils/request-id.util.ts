import { v4 as uuidv4 } from 'uuid';

/** Gera um identificador curto de requisição, usado para correlacionar logs (ex.: `req_4f3c9a1b`). */
export function generateRequestId(): string {
  return `req_${uuidv4().substring(0, 8)}`;
}
