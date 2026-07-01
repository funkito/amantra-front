import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/passwords';
import {
  createSessionToken,
  getSessionCookieName,
  getSessionMaxAge,
} from '@/lib/auth/session';
import { customerRegisterSchema } from '@/lib/auth/customer-validation';

export async function POST(request: Request) {
  try {
    const parsed = customerRegisterSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Datos de registro inválidos.' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este correo. Inicia sesión para continuar.' },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: hashPassword(parsed.data.password),
        role: 'CLIENTE',
        isActive: true,
      },
    });
    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const response = NextResponse.json({ success: true }, { status: 201 });

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
    console.error('Customer registration error:', error);
    return NextResponse.json({ error: 'No fue posible crear la cuenta.' }, { status: 500 });
  }
}