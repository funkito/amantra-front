import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  createSessionToken,
  getSessionCookieName,
  getSessionMaxAge,
  isAdminRole,
} from '@/lib/auth/session';
import { verifyPassword } from '@/lib/auth/passwords';

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json({ error: 'Correo y contraseña son obligatorios.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.isActive || !isAdminRole(user.role) || !verifyPassword(password, user.password)) {
      return NextResponse.json({ error: 'Credenciales inválidas.' }, { status: 401 });
    }

    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({ success: true });
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
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'No fue posible iniciar sesión.' }, { status: 500 });
  }
}
