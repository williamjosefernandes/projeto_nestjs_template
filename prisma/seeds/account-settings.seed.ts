import { PrismaClient, Language } from '@prisma/client';
import { accountSettings } from '../data/account-settings';

export async function seedAccountSettings(prisma: PrismaClient): Promise<void> {
  console.log('⚙️ Seeding account settings...');

  for (const setting of accountSettings) {
    const account = await prisma.account.findUnique({
      where: { slug: setting.accountSlug },
    });

    if (!account) continue;

    await prisma.accountSetting.upsert({
      where: { accountId: account.id },
      update: {
        language: setting.language as Language,
        timezone: setting.timezone,
        dateFormat: setting.dateFormat,
        currency: setting.currency,
        notificationsEnabled: setting.notificationsEnabled,
      },
      create: {
        accountId: account.id,
        language: setting.language as Language,
        timezone: setting.timezone,
        dateFormat: setting.dateFormat,
        currency: setting.currency,
        notificationsEnabled: setting.notificationsEnabled,
      },
    });
  }

  console.log(`✅ ${accountSettings.length} account settings seeded.`);
}
