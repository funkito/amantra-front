import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/auth/session';
import { buildUserUpdateData, normalizeUserEmail, validateUserPayload } from '@/lib/admin/users';

async function authorizeSuperAdmin() {
  const session = await getSessionFromCookies();

  if (!session || session.role !== 'SUPERADMIN') {
    return null;
  }

  return session;
}

export async function PATCH(request: Request, ctx: RouteContext<'/api/admin/users/[id]'>) {
  try {
    const session = await authorizeSuperAdmin();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const { id } = await ctx.params;
    const body = (await request.json()) as {
      action?: 'toggle-active';
      name?: string;
      email?: string;
      role?: 'SUPERADMIN' | 'EDITOR' | 'CLIENTE';
      isActive?: boolean;
      password?: string;
    };

    if (body.action === 'toggle-active') {
      if (id === session.userId) {
        return NextResponse.json({ error: 'No puedes desactivarte a ti mismo.' }, { status: 400 });
      }

      const currentUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!currentUser) {
        return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
      }

      const user = await prisma.user.update({
        where: { id },
        data: { isActive: !currentUser.isActive },
      });

      return NextResponse.json({ success: true, user });
    }

    const payload = {
      name: body.name ?? '',
      email: body.email ?? '',
      role: body.role ?? 'CLIENTE',
      password: body.password,
    };

    const validationError = validateUserPayload(payload);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const normalizedEmail = normalizeUserEmail(payload.email);
    const duplicateUser = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        id: { not: id },
      },
    });

    if (duplicateUser) {
      return NextResponse.json({ error: 'Ese correo ya está registrado por otro usuario.' }, { status: 409 });
    }

    if (id === session.userId && body.isActive === false) {
      return NextResponse.json({ error: 'No puedes desactivarte a ti mismo.' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: buildUserUpdateData({
        name: payload.name,
        email: normalizedEmail,
        role: payload.role,
        password: body.password,
        isActive: body.isActive ?? true,
      }),
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json({ error: 'No fue posible actualizar el usuario.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, ctx: RouteContext<'/api/admin/users/[id]'>) {
  try {
    const session = await authorizeSuperAdmin();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const { id } = await ctx.params;

    if (id === session.userId) {
      return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: { select: { id: true } },
        posts: { select: { id: true } },
        shareEvents: { select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    if (user.orders.length > 0 || user.posts.length > 0 || user.shareEvents.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar este usuario porque ya tiene actividad registrada.' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin user delete error:', error);
    return NextResponse.json({ error: 'No fue posible eliminar el usuario.' }, { status: 500 });
  }
}
