import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { generateRequestId } from '../utils/request-id.util';

declare module 'express-serve-static-core' {
  interface Request {
    requestId: string;
  }
}

/** Gera um único `requestId` por requisição, reaproveitado por respostas de sucesso e de erro. */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req.requestId = generateRequestId();
    res.setHeader('x-request-id', req.requestId);
    next();
  }
}
