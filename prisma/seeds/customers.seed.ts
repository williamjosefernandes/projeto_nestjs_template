import { PrismaClient, Gender } from '@prisma/client';
import { customers } from '../data/customers';

export async function seedCustomers(
  prisma: PrismaClient,
): Promise<void> {
  console.log('👤 Seeding customers...');

  for (const customer of customers) {
    const account = await prisma.account.findUnique({
      where: {
        slug: customer.accountSlug,
      },
    });

    if (!account) {
      console.warn(
        `⚠️ Account ${customer.accountSlug} not found. Skipping customer.`,
      );
      continue;
    }

    await prisma.customer.upsert({
      where: {
        accountId: account.id,
      },
      update: {
        document: customer.document,
        birthDate: customer.birthDate,
        gender: customer.gender as Gender,
        photo: customer.photo,
      },
      create: {
        accountId: account.id,
        document: customer.document,
        birthDate: customer.birthDate,
        gender: customer.gender as Gender,
        photo: customer.photo,
      },
    });
  }

  console.log(`✅ ${customers.length} customers seeded.`);
}