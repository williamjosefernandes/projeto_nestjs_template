import { PrismaClient, Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { countries } from './data/countries';
import { getAllStates } from './data/states';
import { getAllCities } from './data/cities';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const users = [
    {
      email: 'admin@madecoders.com',
      password: passwordHash,
      firstName: 'Admin',
      lastName: 'MadeCoders',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
    {
      email: 'company@madecoders.com',
      password: passwordHash,
      firstName: 'COMPANY',
      lastName: 'User',
      role: Role.COMPANY,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
    {
      email: 'user@madecoders.com',
      password: passwordHash,
      firstName: 'PROFESSIONAL',
      lastName: 'User',
      role: Role.PROFESSIONAL,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  ];

  for (const user of users) {
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log(`Created user with id: ${createdUser.id} and email: ${createdUser.email}`);
  }

  console.log('Seeding countries...');
  for (const country of countries) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: country,
      create: country,
    });
  }
  console.log(`Seeded ${countries.length} countries`);

  console.log('Seeding states...');
  const brazilCountry = await prisma.country.findUnique({ where: { code: 'BR' } });
  if (brazilCountry) {
    const states = getAllStates();
    for (const state of states) {
      await prisma.state.upsert({
        where: { ufCode: state.ufCode },
        update: {
          name: state.name,
          uf: state.uf,
          region: state.region,
          latitude: state.latitude,
          longitude: state.longitude,
          flagUrl: state.flag,
        },
        create: {
          ufCode: state.ufCode,
          uf: state.uf,
          name: state.name,
          region: state.region,
          latitude: state.latitude,
          longitude: state.longitude,
          flagUrl: state.flag,
          countryId: brazilCountry.id,
        },
      });
    }
    console.log(`Seeded ${states.length} states`);

    console.log('Seeding cities...');
    const cities = getAllCities();
    let seedCount = 0;
    for (const city of cities) {
      const state = await prisma.state.findUnique({ where: { ufCode: city.ufCode } });
      if (state) {
        await prisma.city.upsert({
          where: { codeIbge: city.codeIbge },
          update: {
            name: city.name,
            latitude: city.latitude,
            longitude: city.longitude,
            capital: city.capital,
            siafiId: city.siafiId,
            ddd: city.ddd,
            timeZone: city.timeZone,
          },
          create: {
            codeIbge: city.codeIbge,
            name: city.name,
            latitude: city.latitude,
            longitude: city.longitude,
            capital: city.capital,
            siafiId: city.siafiId,
            ddd: city.ddd,
            timeZone: city.timeZone,
            stateId: state.id,
            countryId: brazilCountry.id,
          },
        });
        seedCount++;
      }
    }
    console.log(`Seeded ${seedCount} cities`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
