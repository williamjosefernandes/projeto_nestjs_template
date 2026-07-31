import { PrismaClient } from '@prisma/client';
import { addresses } from '../data/addresses';

export async function seedAddresses(prisma: PrismaClient): Promise<void> {
  console.log('📍 Seeding addresses...');

  for (const address of addresses) {
    const account = await prisma.account.findUnique({
      where: { slug: address.accountSlug },
      include: { company: true, customer: true },
    });

    if (!account) continue;

    const companyId = account.company?.id || null;
    const customerId = account.customer?.id || null;

    if (!companyId && !customerId) continue;

    // Check if an address already exists for this company or customer
    const existing = await prisma.address.findFirst({
      where: {
        OR: [
          companyId ? { companyId } : {},
          customerId ? { customerId } : {},
        ].filter(Boolean),
      },
    });

    const data = {
      companyId,
      customerId,
      zipCode: address.zipCode,
      street: address.street,
      number: address.number,
      complement: address.complement,
      district: address.district,
      city: address.city,
      state: address.state,
      country: address.country,
    };

    if (existing) {
      await prisma.address.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.address.create({ data });
    }
  }

  console.log(`✅ ${addresses.length} addresses seeded.`);
}
