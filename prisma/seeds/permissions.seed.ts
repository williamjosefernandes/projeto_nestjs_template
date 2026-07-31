import { PrismaClient } from '@prisma/client';
import { permissions } from '../data/permissions';

export async function seedPermissions(
  prisma: PrismaClient,
): Promise<void> {
  console.log('🔐 Seeding permissions...');

  for (const permission of permissions) {
    let permissionGroupId = null;
    
    if (permission.group) {
      const groupObj = await prisma.permissionGroup.findUnique({
        where: { name: permission.group },
      });
      if (groupObj) {
        permissionGroupId = groupObj.id;
      }
    }

    await prisma.permission.upsert({
      where: {
        code: permission.code,
      },
      update: {
        permissionGroupId,
        name: permission.name,
        description: permission.description,
        type: permission.type,
      },
      create: {
        permissionGroupId,
        code: permission.code,
        name: permission.name,
        description: permission.description,
        type: permission.type,
      },
    });
  }

  console.log(`✅ ${permissions.length} permissions seeded.`);
}