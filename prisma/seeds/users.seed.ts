import { PrismaClient, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { systemUsers } from '../data/users';

export async function seedUsers(
  prisma: PrismaClient,
): Promise<void> {
  console.log('👤 Seeding users...');

  const passwordHash = await bcrypt.hash('password123', 10);

  for (const user of systemUsers) {
    // Por padrão ACTIVE + e-mail verificado; usuários de cenário (bloqueado,
    // suspenso, pendente de verificação...) declaram `status`/`emailVerified`
    // explicitamente em `data/users.ts` — ver `prisma/SEED.md`.
    const status = user.status ?? UserStatus.ACTIVE;
    const emailVerifiedAt = user.emailVerified === false ? null : new Date();

    await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.email,
        password: passwordHash,
        status,
        emailVerifiedAt,
        authProvider: 'LOCAL',
      },
      create: {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.email,
        email: user.email,
        password: passwordHash,
        status,
        authProvider: 'LOCAL',
        emailVerifiedAt,
      },
    });
  }

  console.log(`✅ ${systemUsers.length} users seeded.`);
}