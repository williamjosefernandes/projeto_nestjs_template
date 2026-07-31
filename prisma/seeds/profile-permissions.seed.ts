import { PrismaClient } from '@prisma/client';
import { profilePermissions } from '../data/profile-permissions';

export async function seedProfilePermissions(
  prisma: PrismaClient,
): Promise<void> {
  console.log('🔐 Seeding profile permissions...');

  for (const profilePermission of profilePermissions) {
    const profiles = await prisma.profile.findMany({
      where: {
        name: profilePermission.profile,
      },
    });

    if (!profiles.length) {
      console.warn(
        `⚠️ Profile ${profilePermission.profile} not found in any account.`,
      );
      continue;
    }

    for (const profile of profiles) {
      // Limpa as permissões antigas do perfil para garantir que refletem exatamente a seed atual
      await prisma.profilePermission.deleteMany({
        where: {
          profileId: profile.id,
        },
      });

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
  }

  console.log('✅ Profile permissions seeded.');
}