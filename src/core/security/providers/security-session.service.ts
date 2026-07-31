import { Injectable } from '@nestjs/common';
import { ISecuritySessionService } from '../interfaces/security-providers.interface';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class SecuritySessionService implements ISecuritySessionService {
  constructor(private readonly prisma: PrismaService) {}

  async validateAndGetSession(
    sessionId: string,
  ): Promise<{ id: string; isActive: boolean } | null> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) return null;

    const isActive = !session.revokedAt && session.expiresAt > new Date();

    return {
      id: session.id,
      isActive,
    };
  }
}
