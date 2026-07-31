import { PrismaClient, SubscriptionStatus, BillingCycle } from '@prisma/client';
import { subscriptions } from '../data/subscriptions';

export async function seedSubscriptions(prisma: PrismaClient): Promise<void> {
  console.log('💳 Seeding subscriptions...');

  for (const sub of subscriptions) {
    const account = await prisma.account.findUnique({
      where: { slug: sub.accountSlug },
    });

    if (!account) continue;

    await prisma.subscription.upsert({
      where: { accountId: account.id },
      update: {
        plan: sub.plan,
        status: sub.status as SubscriptionStatus,
        billingCycle: sub.billingCycle as BillingCycle,
        startsAt: sub.startsAt,
      },
      create: {
        accountId: account.id,
        plan: sub.plan,
        status: sub.status as SubscriptionStatus,
        billingCycle: sub.billingCycle as BillingCycle,
        startsAt: sub.startsAt,
      },
    });
  }

  console.log(`✅ ${subscriptions.length} subscriptions seeded.`);
}
