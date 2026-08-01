import { Prisma, ProfileType } from '@prisma/client';
import { permissionOverrides, profilePermissions, systemProfiles } from './default-profiles.data';

/**
 * Cria os 7 perfis padrão (Owner/Administrador/Gerente/Usuário/Visualizador/
 * Financeiro/Suporte) para uma conta nova, já com `ProfilePermission`/
 * `PermissionOverride` wireados conforme `default-profiles.data.ts`.
 *
 * Função pura (sem DI) de propósito — chamada de dois contextos diferentes
 * que não compartilham o container do Nest: `OnboardingService` (dentro de
 * um `prisma.$transaction`, ver `onboarding.service.ts`) e
 * `prisma/seeds/profiles.seed.ts` (script `ts-node`, fora do Nest). `tx`
 * aceita tanto `PrismaClient` quanto `Prisma.TransactionClient`.
 *
 * @returns o id do perfil "Owner" recém-criado — quem chama usa isso para
 * criar o `Membership` do dono da conta.
 */
export async function provisionDefaultProfiles(
  tx: Prisma.TransactionClient,
  accountId: string,
): Promise<{ ownerProfileId: string }> {
  const profileIdByName = new Map<string, string>();

  for (const profile of systemProfiles) {
    const created = await tx.profile.create({
      data: {
        accountId,
        type: ProfileType.SYSTEM,
        name: profile.name,
        description: profile.description,
        isDefault: true,
        isProtected: true,
      },
    });
    profileIdByName.set(profile.name, created.id);
  }

  const allPermissions = await tx.permission.findMany();
  const permissionByCode = new Map(allPermissions.map((p) => [p.code, p]));

  for (const entry of profilePermissions) {
    const profileId = profileIdByName.get(entry.profile);
    if (!profileId) continue;

    const codes = entry.permissions.includes('*')
      ? allPermissions.map((p) => p.code)
      : entry.permissions;

    for (const code of codes) {
      const permission = permissionByCode.get(code);
      if (!permission) continue;
      await tx.profilePermission.create({
        data: { profileId, permissionId: permission.id },
      });
    }
  }

  for (const override of permissionOverrides) {
    const profileId = profileIdByName.get(override.profileName);
    const permission = permissionByCode.get(override.permissionCode);
    if (!profileId || !permission) continue;
    await tx.permissionOverride.create({
      data: { profileId, permissionId: permission.id, effect: override.effect },
    });
  }

  const ownerProfileId = profileIdByName.get('Owner');
  if (!ownerProfileId) {
    throw new Error('Perfil "Owner" não encontrado após provisionamento — verifique default-profiles.data.ts');
  }

  return { ownerProfileId };
}
