import { PrismaClient, ProfileType } from '@prisma/client';
import { systemProfiles } from '../data/profiles';

export async function seedProfiles(
  prisma: PrismaClient,
): Promise<void> {
  console.log('👤 Seeding system profiles...');

  const accounts = await prisma.account.findMany();

  if (accounts.length === 0) {
    throw new Error(
      'No accounts found. Run accounts.seed.ts before profiles.seed.ts.',
    );
  }

  for (const account of accounts) {
    for (const profile of systemProfiles) {
      await prisma.profile.upsert({
        where: {
          accountId_name: {
            accountId: account.id,
            name: profile.name,
          },
        },
        update: {
          description: profile.description,
          type: ProfileType.SYSTEM,
          isDefault: true,
          isProtected: true,
        },
        create: {
          accountId: account.id,
          type: ProfileType.SYSTEM,
          name: profile.name,
          description: profile.description,
          isDefault: true,
          isProtected: true,
        },
      });
    }
  }

  console.log(`✅ ${systemProfiles.length} profiles seeded.`);
}