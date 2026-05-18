import { prisma } from '@/lib/prisma';

export const SYSTEM_SETTING_KEYS = {
  siteUrl: 'NEXT_PUBLIC_SITE_URL',
  boldEnvironment: 'BOLD_ENVIRONMENT',
  boldIdentityKey: 'BOLD_IDENTITY_KEY',
  boldSecretKey: 'BOLD_SECRET_KEY',
  boldWebhookPath: 'BOLD_WEBHOOK_PATH',
  boldLinkBaseUrl: 'BOLD_LINKS_BASE_URL',
  boldPaymentsBaseUrl: 'BOLD_PAYMENTS_BASE_URL',
} as const;

export type SystemSettingKey = (typeof SYSTEM_SETTING_KEYS)[keyof typeof SYSTEM_SETTING_KEYS];

const DEFAULT_SETTINGS: Record<SystemSettingKey, string> = {
  NEXT_PUBLIC_SITE_URL: '',
  BOLD_ENVIRONMENT: 'sandbox',
  BOLD_IDENTITY_KEY: '',
  BOLD_SECRET_KEY: '',
  BOLD_WEBHOOK_PATH: '/api/payments/bold/webhook',
  BOLD_LINKS_BASE_URL: 'https://integrations.api.bold.co',
  BOLD_PAYMENTS_BASE_URL: 'https://api.online.payments.bold.co',
};

export interface BoldSettings {
  siteUrl: string;
  environment: 'sandbox' | 'production';
  identityKey: string;
  secretKey: string;
  webhookPath: string;
  linksBaseUrl: string;
  paymentsBaseUrl: string;
}

export async function getSettingsMap(keys?: SystemSettingKey[]) {
  const requestedKeys = keys ?? Object.values(SYSTEM_SETTING_KEYS);
  const records = await prisma.system_Setting.findMany({
    where: {
      key: {
        in: requestedKeys,
      },
    },
  });

  return requestedKeys.reduce<Record<SystemSettingKey, string>>((accumulator, key) => {
    accumulator[key] = records.find((record) => record.key === key)?.value ?? DEFAULT_SETTINGS[key];
    return accumulator;
  }, {} as Record<SystemSettingKey, string>);
}

export async function upsertSettings(entries: Partial<Record<SystemSettingKey, string>>) {
  const updates = Object.entries(entries)
    .filter((entry): entry is [SystemSettingKey, string] => typeof entry[1] === 'string')
    .map(([key, value]) =>
      prisma.system_Setting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      })
    );

  await prisma.$transaction(updates);
}

export async function getBoldSettings(): Promise<BoldSettings> {
  const values = await getSettingsMap([
    SYSTEM_SETTING_KEYS.siteUrl,
    SYSTEM_SETTING_KEYS.boldEnvironment,
    SYSTEM_SETTING_KEYS.boldIdentityKey,
    SYSTEM_SETTING_KEYS.boldSecretKey,
    SYSTEM_SETTING_KEYS.boldWebhookPath,
    SYSTEM_SETTING_KEYS.boldLinkBaseUrl,
    SYSTEM_SETTING_KEYS.boldPaymentsBaseUrl,
  ]);

  return {
    siteUrl: values.NEXT_PUBLIC_SITE_URL.trim(),
    environment: values.BOLD_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
    identityKey: values.BOLD_IDENTITY_KEY.trim(),
    secretKey: values.BOLD_SECRET_KEY.trim(),
    webhookPath: values.BOLD_WEBHOOK_PATH.trim() || DEFAULT_SETTINGS.BOLD_WEBHOOK_PATH,
    linksBaseUrl: values.BOLD_LINKS_BASE_URL.trim() || DEFAULT_SETTINGS.BOLD_LINKS_BASE_URL,
    paymentsBaseUrl: values.BOLD_PAYMENTS_BASE_URL.trim() || DEFAULT_SETTINGS.BOLD_PAYMENTS_BASE_URL,
  };
}

export function buildWebhookUrl(settings: Pick<BoldSettings, 'siteUrl' | 'webhookPath'>) {
  if (!settings.siteUrl) {
    return '';
  }

  const normalizedPath = settings.webhookPath.startsWith('/') ? settings.webhookPath : `/${settings.webhookPath}`;

  return `${settings.siteUrl.replace(/\/$/, '')}${normalizedPath}`;
}
