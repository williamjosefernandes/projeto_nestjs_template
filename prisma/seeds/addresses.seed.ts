import { PrismaClient } from '@prisma/client';
import { addresses } from '../data/addresses';

export async function seedAddresses(prisma: PrismaClient): Promise<void> {
  console.log('📍 Seeding addresses...');

  for (const address of addresses) {
    const account = await prisma.account.findUnique({
      where: { slug: address.accountSlug },
    });

    if (!account) continue;

    let country = await prisma.country.findFirst({
      where: { name: address.country || 'Brasil' },
    });

    if (!country) {
      console.warn(`⚠️ Country ${address.country || 'Brasil'} not found, using default 'BR'`);
      country = await prisma.country.findUnique({ where: { code: 'BR' } });
      if (!country) continue;
    }

    const existing = await prisma.address.findFirst({
      where: { accountId: account.id },
    });

    if (existing) {
      await prisma.address.update({
        where: { id: existing.id },
        data: {
          zipCode: address.zipCode,
          street: address.street,
          number: address.number,
          complement: address.complement,
          district: address.district,
          city: address.city,
          state: address.state,
          countryId: country.id,
        },
      });
    } else {
      await prisma.address.create({
        data: {
          accountId: account.id,
          zipCode: address.zipCode,
          street: address.street,
          number: address.number,
          complement: address.complement,
          district: address.district,
          city: address.city,
          state: address.state,
          countryId: country.id,
        }
      });
    }
  }

  console.log(`✅ ${addresses.length} addresses seeded.`);
}
