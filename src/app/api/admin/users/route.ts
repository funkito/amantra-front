import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/auth/session';
import { buildUserCreateData, normalizeUserEmail, validateUserPayload } from '@/lib/admin/users';

async function authorizeSuperAdmin() {
  const session = await getSessionFromCookies();

  if (!session || session.role !== 'SUPERADMIN') {
    return null;
  }

  return session;
}

export async function POST(request: Request) {
  try {
    const session = await authorizeSuperAdmin();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const body = (await request.json()) as {
      name?: string;
      email?: string;
      role?: 'SUPERADMIN' | 'EDITOR' | 'CLIENTE';
      isActive?: boolean;
      password?: string;
    };

    const payload = {
      name: body.name ?? '',
      email: body.email ?? '',
      role: body.role ?? 'CLIENTE',
      password: body.password ?? '',
    };

    const validationError = validateUserPayload(payload);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (!body.password?.trim()) {
      return NextResponse.json({ error: 'La contraseña es obligatoria para crear el usuario.' }, { status: 400 });
    }

    const normalizedEmail = normalizeUserEmail(payload.email);
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Ese correo ya está registrado.' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: buildUserCreateData({
        name: payload.name,
        email: normalizedEmail,
        role: payload.role,
        password: body.password,
        isActive: body.isActive ?? true,
      }),
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Admin user creation error:', error);
    return NextResponse.json({ error: 'No fue posible crear el usuario.' }, { status: 500 });
  }
}
