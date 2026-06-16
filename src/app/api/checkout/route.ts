import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import type { PaymentFlow } from '@prisma/client';
import { PaymentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/passwords';
import { normalizeUserEmail } from '@/lib/admin/users';
import { createBoldDirectPaymentAttempt, createBoldPaymentLink } from '@/lib/payments/bold';
import { getBoldSettings } from '@/lib/system-settings';

function buildOrderReference(orderId: string) {
  return `AMANTRA-${orderId.slice(-8).toUpperCase()}`;
}

interface CheckoutBody {
  amount?: number;
  userId?: string;
  flow?: PaymentFlow;
  description?: string;
  payerEmail?: string;
  callbackUrl?: string;
  imageUrl?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    documentType?: 'CEDULA' | 'CEDULA_EXTRANJERIA' | 'TARJETA_IDENTIDAD' | 'PASAPORTE' | 'NIT';
    documentNumber?: string;
    city?: string;
    state?: string;
    address?: string;
    zipCode?: string;
  };
  paymentMethod?: {
    name?: 'PSE' | 'NEQUI' | 'BOTON_BANCOLOMBIA';
    bankCode?: string;
    bankName?: string;
  };
  deviceFingerprint?: {
    deviceType?: string;
    os?: string;
    model?: string;
    browser?: string;
    javaEnabled?: boolean;
    language?: string;
    colorDepth?: number;
    screenHeight?: number;
    screenWidth?: number;
    timeZoneOffset?: number;
    userAgent?: string;
    acceptHeader?: string;
  };
  items?: Array<{
    productId?: string;
    variantId?: string | null;
    name?: string;
    imageUrl?: string | null;
    price?: number;
    quantity?: number;
    shippingCost?: number;
    shippingLabel?: string;
    selectedVariantLabel?: string | null;
  }>;
}

async function resolveCheckoutUser(body: CheckoutBody) {
  if (body.userId) {
    return body.userId;
  }

  const normalizedEmail = normalizeUserEmail(body.customer?.email ?? body.payerEmail ?? '');

  if (!normalizedEmail) {
    throw new Error('El correo del comprador es obligatorio.');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return existingUser.id;
  }

  const guestPassword = hashPassword(`guest-${crypto.randomUUID()}`);
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      name: body.customer?.name?.trim() || 'Cliente Amantra',
      role: 'CLIENTE',
      isActive: true,
      password: guestPassword,
    },
  });

  return user.id;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutBody;
    const flow = body.flow ?? 'PAYMENT_LINK';
    const normalizedEmail = normalizeUserEmail(body.customer?.email ?? body.payerEmail ?? '');

    if (!normalizedEmail) {
      return NextResponse.json({ error: 'El correo del comprador es obligatorio.' }, { status: 400 });
    }

    if (!body.amount || Number.isNaN(body.amount) || body.amount <= 0) {
      return NextResponse.json({ error: 'Monto inválido para procesar el checkout.' }, { status: 400 });
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío.' }, { status: 400 });
    }

    const normalizedItems = body.items
      .map((item) => ({
        productId: item.productId?.trim() ?? '',
        variantId: item.variantId?.trim() || null,
        name: item.name?.trim() ?? '',
        imageUrl: item.imageUrl?.trim() || null,
        price: typeof item.price === 'number' ? item.price : NaN,
        quantity: typeof item.quantity === 'number' ? item.quantity : NaN,
        shippingCost: typeof item.shippingCost === 'number' ? item.shippingCost : 0,
        shippingLabel: item.shippingLabel?.trim() || '',
        selectedVariantLabel: item.selectedVariantLabel?.trim() || null,
      }))
      .filter((item) => item.productId && item.name && !Number.isNaN(item.price) && !Number.isNaN(item.quantity) && item.quantity > 0);

    if (normalizedItems.length === 0) {
      return NextResponse.json({ error: 'No se encontraron líneas válidas para la orden.' }, { status: 400 });
    }

    const computedTotal = normalizedItems.reduce(
      (sum, item) => sum + item.price * item.quantity + item.shippingCost * item.quantity,
      0
    );

    if (Math.round(computedTotal) !== Math.round(body.amount)) {
      return NextResponse.json({ error: 'El total del carrito no coincide con la orden.' }, { status: 400 });
    }

    if (!['PAYMENT_LINK', 'DIRECT_API'].includes(flow)) {
      return NextResponse.json({ error: 'Flujo de pago inválido.' }, { status: 400 });
    }

    const settings = await getBoldSettings();
    if (!settings.identityKey) {
      return NextResponse.json({ error: 'Bold no está configurado todavía.' }, { status: 500 });
    }

    const userId = await resolveCheckoutUser(body);
    const callbackUrl =
      body.callbackUrl?.trim() ||
      (settings.siteUrl ? `${settings.siteUrl.replace(/\/$/, '')}/checkout/result` : undefined);

    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount: body.amount,
        status: 'PENDING',
        paymentStatus: PaymentStatus.PENDING,
        paymentProvider: 'BOLD',
        paymentFlow: flow,
        paymentMethod: 'BOLD',
        items: {
          create: normalizedItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            productName: item.name,
            productImageUrl: item.imageUrl,
            variantLabel: item.selectedVariantLabel,
            unitPrice: item.price,
            shippingCost: item.shippingCost,
            lineTotal: item.price * item.quantity + item.shippingCost * item.quantity,
            metadata: {
              shippingLabel: item.shippingLabel,
            } as Prisma.InputJsonValue,
          })),
        },
      },
    });

    const paymentReference = buildOrderReference(order.id);

    if (flow === 'PAYMENT_LINK') {
      const description = body.description?.trim() || `Pago orden ${paymentReference}`;
      const paymentLink = await createBoldPaymentLink({
        referenceId: paymentReference,
        totalAmount: body.amount,
        description,
        payerEmail: normalizedEmail,
        callbackUrl,
        imageUrl: body.imageUrl,
      });

      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentReference,
          paymentLinkId: paymentLink.paymentLinkId,
          paymentLinkUrl: paymentLink.paymentLinkUrl,
          paymentMetadata: {
            source: 'checkout',
            callbackUrl,
          } as Prisma.InputJsonValue,
        },
      });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        flow,
        paymentReference,
        paymentLinkId: paymentLink.paymentLinkId,
        redirectUrl: paymentLink.paymentLinkUrl,
      });
    }

    if (!body.customer?.name?.trim() || !body.customer.phone?.trim() || !body.customer.documentNumber?.trim()) {
      return NextResponse.json(
        { error: 'Nombre, teléfono y documento son obligatorios para pago directo.' },
        { status: 400 }
      );
    }

    if (!body.customer.address?.trim() || !body.customer.city?.trim() || !body.customer.state?.trim()) {
      return NextResponse.json(
        { error: 'Dirección, ciudad y departamento son obligatorios para pago directo.' },
        { status: 400 }
      );
    }

    if (!body.paymentMethod?.name) {
      return NextResponse.json({ error: 'Selecciona un método de pago directo.' }, { status: 400 });
    }

    if (
      body.paymentMethod.name === 'PSE' &&
      (!body.paymentMethod.bankCode?.trim() || !body.paymentMethod.bankName?.trim())
    ) {
      return NextResponse.json({ error: 'Selecciona el banco para el pago PSE.' }, { status: 400 });
    }

    const paymentAttempt = await createBoldDirectPaymentAttempt({
      referenceId: paymentReference,
      payer: {
        personType: 'NATURAL_PERSON',
        name: body.customer.name.trim(),
        phone: body.customer.phone.trim(),
        email: normalizedEmail,
        documentType: body.customer.documentType ?? 'CEDULA',
        documentNumber: body.customer.documentNumber.trim(),
        billingAddress: {
          street: body.customer.address.trim(),
          city: body.customer.city.trim(),
          state: body.customer.state.trim(),
          zipCode: body.customer.zipCode?.trim() || '000000',
          countryCode: 'CO',
        },
      },
      paymentMethod:
        body.paymentMethod.name === 'PSE'
          ? {
              name: 'PSE',
              bankCode: body.paymentMethod.bankCode ?? '',
              bankName: body.paymentMethod.bankName ?? '',
            }
          : { name: body.paymentMethod.name },
      deviceFingerprint: {
        deviceType: body.deviceFingerprint?.deviceType ?? 'DESKTOP',
        os: body.deviceFingerprint?.os ?? 'Unknown',
        model: body.deviceFingerprint?.model ?? '',
        browser: body.deviceFingerprint?.browser ?? 'Unknown',
        javaEnabled: body.deviceFingerprint?.javaEnabled ?? false,
        language: body.deviceFingerprint?.language ?? 'es-CO',
        colorDepth: body.deviceFingerprint?.colorDepth ?? 24,
        screenHeight: body.deviceFingerprint?.screenHeight ?? 1080,
        screenWidth: body.deviceFingerprint?.screenWidth ?? 1920,
        timeZoneOffset: body.deviceFingerprint?.timeZoneOffset ?? 300,
        userAgent: body.deviceFingerprint?.userAgent,
        acceptHeader: body.deviceFingerprint?.acceptHeader,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentReference,
        paymentStatus:
          paymentAttempt.status === 'APPROVED'
            ? PaymentStatus.APPROVED
            : paymentAttempt.status === 'REJECTED'
              ? PaymentStatus.REJECTED
              : PaymentStatus.PROCESSING,
        paymentTransactionId: paymentAttempt.transactionId,
        paymentMethod: body.paymentMethod.name,
        paymentMetadata: (paymentAttempt.raw ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      flow,
      paymentReference,
      paymentStatus: paymentAttempt.status,
      transactionId: paymentAttempt.transactionId,
      redirectUrl: paymentAttempt.redirectUrl,
      redirectMethod: paymentAttempt.redirectMethod,
      payment: paymentAttempt.raw,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error procesando el pago con Bold.' },
      { status: 500 }
    );
  }
}
