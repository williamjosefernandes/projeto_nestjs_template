import { PrismaClient } from '@prisma/client';
import { companies } from '../data/companies';

export async function seedCompanies(
  prisma: PrismaClient,
): Promise<void> {
  console.log('🏢 Seeding companies...');

  for (const company of companies) {
    const account = await prisma.account.findUnique({
      where: { slug: company.accountSlug },
    });

    if (!account) {
      console.warn(`⚠️ Account ${company.accountSlug} not found. Skipping company.`);
      continue;
    }

    await prisma.company.upsert({
      where: {
        accountId: account.id,
      },
      update: {
        logo: company.logo,
        corporateName: company.corporateName,
        tradeName: company.tradeName,
        document: company.document,
        email: company.email,
        phone: company.phone,
        whatsapp: company.whatsapp,
        website: company.website,
      },
      create: {
        accountId: account.id,
        logo: company.logo,
        corporateName: company.corporateName,
        tradeName: company.tradeName,
        document: company.document,
        email: company.email,
        phone: company.phone,
        whatsapp: company.whatsapp,
        website: company.website,
      },
    });
  }

  console.log(`✅ ${companies.length} companies seeded.`);
}