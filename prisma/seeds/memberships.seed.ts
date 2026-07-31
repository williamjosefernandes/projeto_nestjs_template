import { PrismaClient, MembershipStatus } from '@prisma/client';
import { memberships } from '../data/memberships';

export async function seedMemberships(
  prisma: PrismaClient,
): Promise<void> {
  console.log('👥 Seeding memberships...');

  for (const membership of memberships) {
    const user = await prisma.user.findUnique({
      where: {
        email: membership.userEmail,
      },
    });

    if (!user) {
      throw new Error(
        `User ${membership.userEmail} not found.`,
      );
    }

    const account = await prisma.account.findUnique({
      where: {
        slug: membership.accountSlug,
      },
    });

    if (!account) {
      throw new Error(
        `Account ${membership.accountSlug} not found.`,
      );
    }

    const profile = await prisma.profile.findFirst({
      where: {
        accountId: account.id,
        name: membership.profileName,
      },
    });

    if (!profile) {
      throw new Error(
        `Profile ${membership.profileName} not found.`,
      );
    }

    const createdMembership = await prisma.membership.upsert({
      where: {
        accountId_userId: {
          accountId: account.id,
          userId: user.id,
        },
      },
      update: {
        profileId: profile.id,
        status: MembershipStatus.ACTIVE,
      },
      create: {
        accountId: account.id,
        userId: user.id,
        profileId: profile.id,
        status: MembershipStatus.ACTIVE,
      },
    });

    // userPreference removido no novo schema, defaultMembershipId não é mais usado
  }

  console.log(`✅ ${memberships.length} memberships seeded.`);
}