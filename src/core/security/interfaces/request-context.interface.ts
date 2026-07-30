import { Request } from 'express';

export interface UserContext {
  id: string;
  email: string;
  sessionId?: string;
}

export interface SessionContext {
  id: string;
  isActive: boolean;
}

export interface AccountContext {
  id: string;
  name: string;
  isActive: boolean;
}

export interface MembershipContext {
  id: string;
  accountId: string;
  userId: string;
  isActive: boolean;
}

export interface ProfileContext {
  id: string;
  name: string;
  isActive: boolean;
}

export interface AuthenticatedRequest extends Request {
  user: UserContext;
  session?: SessionContext;
  account?: AccountContext;
  membership?: MembershipContext;
  profile?: ProfileContext;
  permissions?: string[];
}
