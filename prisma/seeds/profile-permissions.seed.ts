import { PrismaClient } from '@prisma/client';
import { profilePermissions } from '../data/profile-permissions';

export async function seedProfilePermissions(
  prisma: PrismaClient,
): Promise<void> {
  console.log('🔐 Seeding profile permissions...');

  for (const profilePermission of profilePermissions) {
    const profile = await prisma.profile.findFirst({
      where: {
        name: profilePermission.profile,
      },
    });

    if (!profile) {
      console.warn(
        `⚠️ Profile ${profilePermission.profile} not found.`,
      );
      continue;
    }

    for (const permissionCode of profilePermission.permissions) {
      // Owner recebe todas as permissões
      if (permissionCode === '*') {
        const permissions = await prisma.permission.findMany();

        for (const permission of permissions) {
          await prisma.profilePermission.upsert({
            where: {
              profileId_permissionId: {
                profileId: profile.id,
                permissionId: permission.id,
              },
            },
            update: {},
            create: {
              profileId: profile.id,
              permissionId: permission.id,
            },
          });
        }

        continue;
      }

      const permission = await prisma.permission.findUnique({
        where: {
          code: permissionCode,
        },
      });

      if (!permission) {
        console.warn(
          `⚠️ Permission ${permissionCode} not found.`,
        );
        continue;
      }

      await prisma.profilePermission.upsert({
        where: {
          profileId_permissionId: {
            profileId: profile.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          profileId: profile.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log('✅ Profile permissions seeded.');
}