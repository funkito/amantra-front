import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getSessionFromCookies } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import {
  getBoldDirectPaymentStatus,
  getBoldPaymentLinkStatus,
  mapBoldPaymentStatusToOrderStatus,
  mapBoldRemoteStatus,
} from '@/lib/payments/bold';

async function authorizeOrdersManager() {
  const session = await getSessionFromCookies();

  if (!session || !['SUPERADMIN', 'EDITOR'].includes(session.role)) {
    return null;
  }

  return session;
}

export async function PATCH(_request: Request, ctx: RouteContext<'/api/admin/orders/[id]/sync-payment'>) {
  try {
    const session = await authorizeOrdersManager();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const { id } = await ctx.params;
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada.' }, { status: 404 });
    }

    if (!order.paymentReference) {
      return NextResponse.json({ error: 'La orden no tiene referencia de pago.' }, { status: 400 });
    }

    const remotePayload =
      order.paymentFlow === 'PAYMENT_LINK' && order.paymentLinkId
        ? await getBoldPaymentLinkStatus(order.paymentLinkId)
        : await getBoldDirectPaymentStatus(order.paymentReference);

    const remoteStatus =
      typeof remotePayload === 'object' && remotePayload && 'status' in remotePayload
        ? String((remotePayload as { status?: string }).status)
        : typeof remotePayload === 'object' && remotePayload && 'payment_status' in remotePayload
          ? String((remotePayload as { payment_status?: string }).payment_status)
          : undefined;
    const remoteTransactionId =
      typeof remotePayload === 'object' && remotePayload && 'transaction_id' in remotePayload
        ? (remotePayload as { transaction_id?: string }).transaction_id
        : undefined;

    const paymentStatus = mapBoldRemoteStatus(remoteStatus);

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus,
        paymentTransactionId: remoteTransactionId || order.paymentTransactionId,
        paymentMetadata: (remotePayload ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        lastWebhookAt: new Date(),
        status: mapBoldPaymentStatusToOrderStatus(paymentStatus, order.status),
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder, remotePayload });
  } catch (error) {
    console.error('Order payment sync error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No fue posible sincronizar el pago.' },
      { status: 500 }
    );
  }
}
