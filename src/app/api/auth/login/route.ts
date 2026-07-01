import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  createSessionToken,
  getSessionCookieName,
  getSessionMaxAge,
} from '@/lib/auth/session';
import { verifyPassword } from '@/lib/auth/passwords';
import { customerLoginSchema } from '@/lib/auth/customer-validation';

export async function POST(request: Request) {
  try {
    const parsed = customerLoginSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Datos de acceso inválidos.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user || !user.isActive || !verifyPassword(parsed.data.password, user.password)) {
      return NextResponse.json({ error: 'Correo o contraseña incorrectos.' }, { status: 401 });
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
    console.error('Customer login error:', error);
    return NextResponse.json({ error: 'No fue posible iniciar sesión.' }, { status: 500 });
  }
}