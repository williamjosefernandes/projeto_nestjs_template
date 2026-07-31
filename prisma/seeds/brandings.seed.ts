import { PrismaClient } from '@prisma/client';
import { brandings } from '../data/brandings';

export async function seedBrandings(prisma: PrismaClient): Promise<void> {
  console.log('🎨 Seeding brandings...');

  for (const branding of brandings) {
    const account = await prisma.account.findUnique({
      where: { slug: branding.accountSlug },
    });

    if (!account) continue;

    await prisma.branding.upsert({
      where: { accountId: account.id },
      update: {
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
      },
      create: {
        accountId: account.id,
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
      },
    });
  }

  console.log(`✅ ${brandings.length} brandings seeded.`);
}
