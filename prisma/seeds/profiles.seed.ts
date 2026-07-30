import { PrismaClient, ProfileType } from '@prisma/client';
import { systemProfiles } from '../data/profiles';

export async function seedProfiles(
  prisma: PrismaClient,
): Promise<void> {
  console.log('👤 Seeding system profiles...');

  const systemAccount = await prisma.account.findFirst({
    where: {
      type: 'SYSTEM',
    },
  });

  if (!systemAccount) {
    throw new Error(
      'System Account not found. Run accounts.seed.ts before profiles.seed.ts.',
    );
  }

  for (const profile of systemProfiles) {
    await prisma.profile.upsert({
      where: {
        accountId_name: {
          accountId: systemAccount.id,
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
        accountId: systemAccount.id,
        type: ProfileType.SYSTEM,
        name: profile.name,
        description: profile.description,
        isDefault: true,
        isProtected: true,
      },
    });
  }

  console.log(`✅ ${systemProfiles.length} profiles seeded.`);
}