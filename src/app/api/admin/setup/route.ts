import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/passwords';
import {
  createSessionToken,
  getSessionCookieName,
  getSessionMaxAge,
} from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const { name, email, password } = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nombre, correo y contraseña son obligatorios.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, { status: 400 });
    }

    const adminCount = await prisma.user.count({
      where: {
        role: {
          in: ['SUPERADMIN', 'EDITOR', 'VENDEDOR'],
        },
      },
    });

    if (adminCount > 0) {
      return NextResponse.json({ error: 'Ya existe un administrador configurado.' }, { status: 409 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Ese correo ya está registrado.' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashPassword(password),
        role: 'SUPERADMIN',
      },
    });

    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({ success: true, message: 'Administrador creado.' });
    response.cookies.set({
      name: getSessionCookieName(),
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: getSessionMaxAge(),
    });

    return response;
  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json({ error: 'No fue posible crear el administrador.' }, { status: 500 });
  }
}
