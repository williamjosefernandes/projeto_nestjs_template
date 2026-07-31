import { PrismaClient } from '@prisma/client';
import { permissionGroups } from '../data/permission-groups';

export async function seedPermissionGroups(
  prisma: PrismaClient,
): Promise<void> {
  console.log('📂 Seeding permission groups...');

  for (const group of permissionGroups) {
    await prisma.permissionGroup.upsert({
      where: {
        name: group.name,
      },
      update: {},
      create: {
        name: group.name,
        active: true,
      },
    });
  }

  console.log(`✅ ${permissionGroups.length} permission groups seeded.`);
}
