import { PrismaClient } from '@prisma/client';
import { getAllCities } from '../data/cities';
import { getAllStates } from '../data/states';

export async function seedCities(prisma: PrismaClient): Promise<void> {
  console.log('🌎 Seeding cities...');

  const states = await prisma.state.findMany({
    select: {
      id: true,
      code: true,
    },
  });

  const statesMap = new Map(
    states.map((state) => [state.code, state.id]),
  );

  const cities = getAllCities();

  let count = 0;

  for (const city of cities) {
    const stateData = getAllStates().find((s) => s.ufCode === city.ufCode);
    const stateId = stateData ? statesMap.get(stateData.uf) : undefined;

    if (!stateId) {
      console.warn(
        `⚠️ State for city ${city.name} (ufCode: ${city.ufCode}) not found. Skipping.`,
      );
      continue;
    }

    await prisma.city.upsert({
      where: {
        ibgeCode: city.codeIbge.toString(),
      },
      update: {
        name: city.name,
        active: true,
      },
      create: {
        stateId,
        ibgeCode: city.codeIbge.toString(),
        name: city.name,
        active: true,
      },
    });

    count++;
  }

  console.log(`✅ ${count} cities seeded.`);
}