import { PrismaClient } from '@prisma/client';
import { permissionOverrides } from '../data/permission-overrides';

export async function seedPermissionOverrides(
  prisma: PrismaClient,
): Promise<void> {
  console.log('🚧 Seeding permission overrides...');

  for (const override of permissionOverrides) {
    const profiles = await prisma.profile.findMany({
      where: {
        name: override.profileName,
      },
    });

    if (!profiles.length) {
      console.warn(
        `⚠️ Profile ${override.profileName} not found. Skipping override.`,
      );
      continue;
    }

    const permission = await prisma.permission.findUnique({
      where: {
        code: override.permissionCode,
      },
    });

    if (!permission) {
      console.warn(
        `⚠️ Permission ${override.permissionCode} not found. Skipping override.`,
      );
      continue;
    }

    for (const profile of profiles) {
      await prisma.permissionOverride.upsert({
        where: {
          profileId_permissionId: {
            profileId: profile.id,
            permissionId: permission.id,
          },
        },
        update: {
          effect: override.effect,
        },
        create: {
          profileId: profile.id,
          permissionId: permission.id,
          effect: override.effect,
        },
      });
    }
  }

  console.log('✅ Permission overrides seeded.');
}
