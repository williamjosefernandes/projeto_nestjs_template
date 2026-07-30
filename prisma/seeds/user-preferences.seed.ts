import {
  Language,
  PrismaClient,
  Theme,
  TimeFormat,
} from '@prisma/client';
import { userPreferences } from '../data/user-preferences';

export async function seedUserPreferences(
  prisma: PrismaClient,
): Promise<void> {
  console.log('⚙️ Seeding user preferences...');

  for (const preference of userPreferences) {
    const user = await prisma.user.findUnique({
      where: {
        email: preference.userEmail,
      },
      include: {
        memberships: {
          orderBy: {
            createdAt: 'asc',
          },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new Error(
        `User ${preference.userEmail} not found.`,
      );
    }

    const defaultMembership = user.memberships[0];

    await prisma.userPreference.upsert({
      where: {
        userId: user.id,
      },
      update: {
        defaultMembershipId: defaultMembership?.id,
        theme: preference.theme as Theme,
        language: preference.language as Language,
        timeFormat: preference.timeFormat as TimeFormat,
        timezone: preference.timezone,
      },
      create: {
        userId: user.id,
        defaultMembershipId: defaultMembership?.id,
        theme: preference.theme as Theme,
        language: preference.language as Language,
        timeFormat: preference.timeFormat as TimeFormat,
        timezone: preference.timezone,
      },
    });
  }

  console.log(`✅ ${userPreferences.length} user preferences seeded.`);
}