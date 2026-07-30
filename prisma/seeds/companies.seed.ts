import { PrismaClient } from '@prisma/client';
import { companies } from '../data/companies';

export async function seedCompanies(
  prisma: PrismaClient,
): Promise<void> {
  console.log('🏢 Seeding companies...');

  for (const [i, company] of companies.entries()) {
    const account = await prisma.account.upsert({
      where: { slug: `company-${i + 1}` },
      update: {},
      create: {
        type: 'COMPANY',
        name: company.corporateName,
        slug: `company-${i + 1}`,
      },
    });

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