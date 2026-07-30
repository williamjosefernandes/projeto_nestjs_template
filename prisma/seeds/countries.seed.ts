import { PrismaClient } from '@prisma/client';
import { countries } from '../data/countries';

export async function seedCountries(prisma: PrismaClient): Promise<void> {
  console.log('🌎 Seeding countries...');

  for (const country of countries) {
    await prisma.country.upsert({
      where: {
        code: country.code,
      },
      update: {
        name: country.name,
        phoneCode: country.phoneCode,
        currency: country.currencyCode,
        active: true,
      },
      create: {
        code: country.code,
        name: country.name,
        phoneCode: country.phoneCode,
        currency: country.currencyCode,
        active: true,
      },
    });
  }

  console.log(`✅ ${countries.length} countries seeded.`);
}