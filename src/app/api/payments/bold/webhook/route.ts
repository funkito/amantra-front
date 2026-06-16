import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  BOLD_PROVIDER,
  buildWebhookIdempotencyKey,
  extractBoldReference,
  extractBoldTransactionId,
  inferBoldFlowFromSource,
  mapBoldEventToPaymentStatus,
  mapBoldPaymentStatusToOrderStatus,
  normalizeWebhookProcessingStatus,
  validateBoldWebhookSignature,
  type BoldWebhookPayload,
} from '@/lib/payments/bold';
import { getBoldSettings } from '@/lib/system-settings';

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-bold-signature');
  const settings = await getBoldSettings();

  let orderId: string | null = null;

  try {
    const payload = JSON.parse(rawBody) as BoldWebhookPayload;
    const idempotencyKey = buildWebhookIdempotencyKey(payload);
    const validSignature = validateBoldWebhookSignature(rawBody, signature, settings.secretKey, settings.environment);

    if (!validSignature) {
      await prisma.webhookEventLog.upsert({
        where: { idempotencyKey },
        create: {
          provider: BOLD_PROVIDER,
          eventId: payload.id,
          eventType: payload.type ?? 'UNKNOWN',
          subject: payload.subject,
          idempotencyKey,
          signature,
          processingStatus: 'INVALID_SIGNATURE',
          payload: payload as Prisma.InputJsonValue,
          errorMessage: 'Firma de webhook inválida.',
        },
        update: {
          signature,
          processingStatus: 'INVALID_SIGNATURE',
          payload: payload as Prisma.InputJsonValue,
          errorMessage: 'Firma de webhook inválida.',
        },
      });

      return NextResponse.json({ error: 'Firma inválida.' }, { status: 400 });
    }

    const existingEvent = await prisma.webhookEventLog.findUnique({
      where: { idempotencyKey },
    });

    if (existingEvent?.processingStatus === 'PROCESSED') {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    const paymentReference = extractBoldReference(payload);
    const transactionId = extractBoldTransactionId(payload);
    const order =
      (paymentReference
        ? await prisma.order.findUnique({
            where: { paymentReference },
          })
        : null) ??
      (transactionId
        ? await prisma.order.findFirst({
            where: {
              OR: [{ paymentTransactionId: transactionId }, { paymentLinkId: transactionId }],
            },
          })
        : null);

    orderId = order?.id ?? null;

    const paymentStatus = mapBoldEventToPaymentStatus(payload.type);

    await prisma.$transaction(async (transaction) => {
      await transaction.webhookEventLog.upsert({
        where: { idempotencyKey },
        create: {
          provider: BOLD_PROVIDER,
          eventId: payload.id,
          eventType: payload.type ?? 'UNKNOWN',
          subject: payload.subject,
          idempotencyKey,
          orderId,
          signature,
          processingStatus: normalizeWebhookProcessingStatus(false),
          payload: payload as Prisma.InputJsonValue,
          processedAt: new Date(),
        },
        update: {
          orderId,
          signature,
          processingStatus: normalizeWebhookProcessingStatus(false),
          payload: payload as Prisma.InputJsonValue,
          errorMessage: null,
          processedAt: new Date(),
        },
      });

      if (!order) {
        return;
      }

      await transaction.order.update({
        where: { id: order.id },
        data: {
          paymentProvider: BOLD_PROVIDER,
          paymentFlow: inferBoldFlowFromSource(typeof payload.source === 'string' ? payload.source : undefined),
          paymentStatus,
          paymentTransactionId: transactionId,
          paymentMethod: typeof payload.data?.payment_method === 'string' ? payload.data.payment_method : order.paymentMethod,
          paymentMetadata: payload as Prisma.InputJsonValue,
          lastWebhookAt: new Date(),
          status: mapBoldPaymentStatusToOrderStatus(paymentStatus, order.status),
        },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Bold webhook error:', error);

    return NextResponse.json({ error: 'No fue posible procesar el webhook.' }, { status: 500 });
  }
}
