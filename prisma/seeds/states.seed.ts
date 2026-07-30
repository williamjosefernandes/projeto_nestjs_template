import { PrismaClient } from '@prisma/client';
import { getAllStates } from '../data/states';

export async function seedStates(prisma: PrismaClient): Promise<void> {
  console.log('🌎 Seeding states...');

  const brazil = await prisma.country.findUnique({
    where: {
      code: 'BR',
    },
  });

  if (!brazil) {
    throw new Error(
      'Country BR not found. Run countries.seed.ts before states.seed.ts.',
    );
  }

  const states = getAllStates();

  for (const state of states) {
    await prisma.state.upsert({
      where: {
        countryId_code: {
          countryId: brazil.id,
          code: state.uf,
        },
      },
      update: {
        name: state.name,
        active: true,
      },
      create: {
        countryId: brazil.id,
        code: state.uf,
        name: state.name,
        active: true,
      },
    });
  }

  console.log(`✅ ${states.length} states seeded.`);
}