import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

async function authorizeNewsletterManagers() {
  const session = await getSessionFromCookies();

  if (!session || !['SUPERADMIN', 'EDITOR'].includes(session.role)) {
    return null;
  }

  return session;
}

export async function PATCH(request: Request, ctx: RouteContext<'/api/admin/newsletter/[id]'>) {
  try {
    const session = await authorizeNewsletterManagers();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const { id } = await ctx.params;
    const body = (await request.json()) as { action?: 'toggle-active' };

    if (body.action !== 'toggle-active') {
      return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 });
    }

    const currentSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { id },
    });

    if (!currentSubscriber) {
      return NextResponse.json({ error: 'Suscriptor no encontrado.' }, { status: 404 });
    }

    const subscriber = await prisma.newsletterSubscriber.update({
      where: { id },
      data: {
        isActive: !currentSubscriber.isActive,
      },
    });

    return NextResponse.json({ success: true, subscriber });
  } catch (error) {
    console.error('Newsletter admin update error:', error);
    return NextResponse.json({ error: 'No fue posible actualizar este suscriptor.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, ctx: RouteContext<'/api/admin/newsletter/[id]'>) {
  try {
    const session = await authorizeNewsletterManagers();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const { id } = await ctx.params;

    await prisma.newsletterSubscriber.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter admin delete error:', error);
    return NextResponse.json({ error: 'No fue posible eliminar este suscriptor.' }, { status: 500 });
  }
}

