import { PrismaClient } from '@prisma/client';

import { seedCountries } from './seeds/countries.seed';
import { seedStates } from './seeds/states.seed';
import { seedCities } from './seeds/cities.seed';

import { seedPermissionGroups } from './seeds/permission-groups.seed';
import { seedPermissions } from './seeds/permissions.seed';
import { seedAccounts } from './seeds/accounts.seed';
import { seedProfiles } from './seeds/profiles.seed';
import { seedProfilePermissions } from './seeds/profile-permissions.seed';

import { seedCompanies } from './seeds/companies.seed';
import { seedCustomers } from './seeds/customers.seed';

import { seedUsers } from './seeds/users.seed';
import { seedMemberships } from './seeds/memberships.seed';
import { seedUserPreferences } from './seeds/user-preferences.seed';

import { seedAddresses } from './seeds/addresses.seed';
import { seedSubscriptions } from './seeds/subscriptions.seed';
import { seedBrandings } from './seeds/brandings.seed';
import { seedAccountSettings } from './seeds/account-settings.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting seed...');

  // 1. Geographic
  await seedCountries(prisma);
  await seedStates(prisma);
  await seedCities(prisma);

  // 2. RBAC Base
  await seedPermissionGroups(prisma);
  await seedPermissions(prisma);

  // 3. Accounts Base
  await seedAccounts(prisma);

  // 4. RBAC Profiles
  await seedProfiles(prisma);
  await seedProfilePermissions(prisma);

  // 5. Account Details (Company / Customer)
  await seedCompanies(prisma);
  await seedCustomers(prisma);

  // 6. Users & Links
  await seedUsers(prisma);
  await seedMemberships(prisma);
  await seedUserPreferences(prisma);

  // 7. Metadata (Addresses, Settings, Subscriptions, Brandings)
  await seedAddresses(prisma);
  await seedSubscriptions(prisma);
  await seedBrandings(prisma);
  await seedAccountSettings(prisma);

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