import { PrismaClient, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { systemUsers } from '../data/users';

export async function seedUsers(
  prisma: PrismaClient,
): Promise<void> {
  console.log('👤 Seeding users...');

  const passwordHash = await bcrypt.hash('password123', 10);

  for (const user of systemUsers) {
    await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {
        firstName: user.firstName,
        lastName: user.lastName,
        password: passwordHash,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
      },
      create: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: passwordHash,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
      },
    });
  }

  console.log(`✅ ${systemUsers.length} users seeded.`);
}