import { PrismaClient } from '@prisma/client';

import { seedCountries } from './seeds/countries.seed';
import { seedStates } from './seeds/states.seed';
import { seedCities } from './seeds/cities.seed';

import { seedPermissions } from './seeds/permissions.seed';
import { seedAccounts } from './seeds/accounts.seed';
import { seedProfiles } from './seeds/profiles.seed';
import { seedProfilePermissions } from './seeds/profile-permissions.seed';

import { seedUsers } from './seeds/users.seed';
import { seedMemberships } from './seeds/memberships.seed';
import { seedUserPreferences } from './seeds/user-preferences.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting seed...');

  await seedCountries(prisma);
  await seedStates(prisma);
  await seedCities(prisma);

  await seedPermissions(prisma);

  await seedAccounts(prisma);
  await seedProfiles(prisma);
  await seedProfilePermissions(prisma);

  await seedUsers(prisma);
  await seedMemberships(prisma);
  await seedUserPreferences(prisma);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });