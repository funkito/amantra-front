import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getSettingsMap, SYSTEM_SETTING_KEYS, upsertSettings, type SystemSettingKey } from '@/lib/system-settings';

async function requireSuperAdminApi() {
  const session = await getSessionFromCookies();

  if (!session || session.role !== 'SUPERADMIN') {
    return null;
  }

  return session;
}

export async function GET() {
  try {
    const session = await requireSuperAdminApi();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const settings = await getSettingsMap();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Admin settings fetch error:', error);
    return NextResponse.json({ error: 'No fue posible cargar la configuración.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSuperAdminApi();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const body = (await request.json()) as {
      settings?: Partial<Record<SystemSettingKey, string>>;
    };

    if (!body.settings) {
      return NextResponse.json({ error: 'No se enviaron ajustes.' }, { status: 400 });
    }

    const allowedKeys = new Set(Object.values(SYSTEM_SETTING_KEYS));
    const sanitizedEntries = Object.fromEntries(
      Object.entries(body.settings)
        .filter((entry): entry is [SystemSettingKey, string] => allowedKeys.has(entry[0] as SystemSettingKey) && typeof entry[1] === 'string')
        .map(([key, value]) => [key, value.trim()])
    ) as Partial<Record<SystemSettingKey, string>>;

    await upsertSettings(sanitizedEntries);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin settings update error:', error);
    return NextResponse.json({ error: 'No fue posible guardar la configuración.' }, { status: 500 });
  }
}
