import { PrismaClient } from '@prisma/client';
import { systemAccounts } from '../data/accounts';

export async function seedAccounts(
  prisma: PrismaClient,
): Promise<void> {
  console.log('🏢 Seeding system accounts...');

  for (const account of systemAccounts) {
    await prisma.account.upsert({
      where: {
        slug: account.slug,
      },
      update: {
        name: account.name,
        slug: account.slug,
        active: account.active,
      },
      create: {
        type: account.type,
        name: account.name,
        slug: account.slug,
        active: account.active,
      },
    });
  }

  console.log(`✅ ${systemAccounts.length} accounts seeded.`);
}