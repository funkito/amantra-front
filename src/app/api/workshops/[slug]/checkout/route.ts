import { NextResponse } from 'next/server';
import { PaymentStatus, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/auth/session';
import { createBoldPaymentLink } from '@/lib/payments/bold';
import { getPublishedBlogPostBySlug } from '@/lib/content/public-blog';
import { getSiteUrl } from '@/lib/social/share';

function buildWorkshopReference(orderId: string) {
  return 'TALLER-' + orderId.slice(-8).toUpperCase();
}

export async function POST(
  _request: Request,
  ctx: RouteContext<'/api/workshops/[slug]/checkout'>
) {
  try {
    const session = await getSessionFromCookies();

    if (!session) {
      return NextResponse.json({ error: 'Debes iniciar sesión para comprar el taller.' }, { status: 401 });
    }

    const { slug } = await ctx.params;
    const [user, workshop] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, email: true, isActive: true },
      }),
      getPublishedBlogPostBySlug(slug),
    ]);

    if (!user?.isActive) {
      return NextResponse.json({ error: 'La cuenta no está disponible.' }, { status: 403 });
    }

    if (!workshop || workshop.accessType !== 'PAID_WORKSHOP' || !workshop.workshopPrice) {
      return NextResponse.json({ error: 'El taller no está disponible para compra.' }, { status: 404 });
    }

    const existingAccess = await prisma.workshopAccess.findUnique({
      where: {
        userId_postSlug: {
          userId: user.id,
          postSlug: workshop.slug,
        },
      },
      select: { status: true },
    });

    if (existingAccess?.status === 'ACTIVE') {
      return NextResponse.json({
        success: true,
        alreadyPurchased: true,
        redirectUrl: '/blog/' + workshop.slug,
      });
    }

    const callbackUrl =
      getSiteUrl().replace(/\/$/, '') +
      '/blog/' +
      encodeURIComponent(workshop.slug) +
      '?payment=return';
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: workshop.workshopPrice,
        status: 'PENDING',
        paymentStatus: PaymentStatus.PENDING,
        paymentProvider: 'BOLD',
        paymentFlow: 'PAYMENT_LINK',
        paymentMethod: 'BOLD',
        paymentMetadata: {
          source: 'paid_workshop',
          workshopSlug: workshop.slug,
          callbackUrl,
        } as Prisma.InputJsonValue,
      },
    });
    const paymentReference = buildWorkshopReference(order.id);

    try {
      const paymentLink = await createBoldPaymentLink({
        referenceId: paymentReference,
        totalAmount: workshop.workshopPrice,
        description: 'Taller online: ' + workshop.title,
        payerEmail: user.email,
        callbackUrl,
        imageUrl: workshop.coverImage || undefined,
      });

      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentReference,
          paymentLinkId: paymentLink.paymentLinkId,
          paymentLinkUrl: paymentLink.paymentLinkUrl,
          paymentMetadata: {
            source: 'paid_workshop',
            workshopSlug: workshop.slug,
            callbackUrl,
            paymentLinkId: paymentLink.paymentLinkId,
          } as Prisma.InputJsonValue,
        },
      });

      return NextResponse.json(
        {
          success: true,
          orderId: order.id,
          paymentReference,
          redirectUrl: paymentLink.paymentLinkUrl,
        },
        { status: 201 }
      );
    } catch (paymentError) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          paymentStatus: PaymentStatus.FAILED,
          paymentMetadata: {
            source: 'paid_workshop',
            workshopSlug: workshop.slug,
            callbackUrl,
            error: paymentError instanceof Error ? paymentError.message : 'Bold payment link failed',
          } as Prisma.InputJsonValue,
        },
      });
      throw paymentError;
    }
  } catch (error) {
    console.error('Workshop checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No fue posible iniciar el pago del taller.' },
      { status: 500 }
    );
  }
}