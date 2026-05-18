import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/auth/session';

const allowedStatuses = new Set(['PENDING', 'PAID', 'PREPARING', 'SHIPPED', 'CANCELLED']);

async function authorizeOrdersManager() {
  const session = await getSessionFromCookies();

  if (!session || !['SUPERADMIN', 'EDITOR'].includes(session.role)) {
    return null;
  }

  return session;
}

export async function PATCH(request: Request, ctx: RouteContext<'/api/admin/orders/[id]'>) {
  try {
    const session = await authorizeOrdersManager();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const { id } = await ctx.params;
    const body = (await request.json()) as { status?: string };

    if (!body.status || !allowedStatuses.has(body.status)) {
      return NextResponse.json({ error: 'Estado de orden inválido.' }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status: body.status },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Admin order update error:', error);
    return NextResponse.json({ error: 'No fue posible actualizar la orden.' }, { status: 500 });
  }
}
