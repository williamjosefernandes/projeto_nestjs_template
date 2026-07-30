import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthorizationService } from './services/authorization.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SessionGuard } from './guards/session.guard';
import { MembershipGuard } from './guards/membership.guard';
import { ProfileGuard } from './guards/profile.guard';
import { PermissionGuard } from './guards/permission.guard';

import { SecuritySessionService } from './providers/security-session.service';
import { SecurityMembershipService } from './providers/security-membership.service';
import { PrismaService } from '../../database/prisma.service';

@Global()
@Module({
  imports: [
    CacheModule.register(),
  ],
  providers: [
    PrismaService,
    AuthorizationService,
    JwtAuthGuard,
    SessionGuard,
    MembershipGuard,
    ProfileGuard,
    PermissionGuard,
    {
      provide: 'I_SECURITY_SESSION_SERVICE',
      useClass: SecuritySessionService,
    },
    {
      provide: 'I_SECURITY_MEMBERSHIP_SERVICE',
      useClass: SecurityMembershipService,
    }
  ],
  exports: [
    AuthorizationService,
    JwtAuthGuard,
    SessionGuard,
    MembershipGuard,
    ProfileGuard,
    PermissionGuard,
    'I_SECURITY_SESSION_SERVICE',
    'I_SECURITY_MEMBERSHIP_SERVICE'
  ],
})
export class SecurityModule {}
