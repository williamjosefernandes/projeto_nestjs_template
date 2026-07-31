export interface ISecuritySessionService {
  validateAndGetSession(sessionId: string): Promise<{ id: string; isActive: boolean } | null>;
}

export interface ISecurityMembershipService {
  getActiveMembership(userId: string, accountId: string): Promise<{
    id: string;
    accountId: string;
    userId: string;
    isActive: boolean;
    account: { id: string; name: string; isActive: boolean };
    profile: { id: string; name: string; isActive: boolean };
  } | null>;
  getProfilePermissions(membershipId: string): Promise<{ code: string; type: string }[]>;
  getPermissionOverrides(membershipId: string): Promise<{ code: string; type: string; isDenied: boolean }[]>;
}
