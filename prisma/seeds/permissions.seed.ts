import { PrismaClient } from '@prisma/client';
import { permissions } from '../data/permissions';

export async function seedPermissions(
  prisma: PrismaClient,
): Promise<void> {
  console.log('🔐 Seeding permissions...');

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        code: permission.code,
      },
      update: {
        module: permission.module,
        name: permission.name,
        description: permission.description,
      },
      create: permission,
    });
  }

  console.log(`✅ ${permissions.length} permissions seeded.`);
}