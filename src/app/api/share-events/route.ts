import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/auth/session';

type ShareRequestBody = {
  productId?: string;
  network?: 'WHATSAPP' | 'FACEBOOK' | 'TWITTER' | 'LINKEDIN' | 'COPY_LINK';
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ShareRequestBody;

    if (!body.productId || !body.network) {
      return NextResponse.json({ error: 'Datos incompletos para registrar el compartido.' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: body.productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 });
    }

    const session = await getSessionFromCookies();

    await prisma.shareEvent.create({
      data: {
        productId: body.productId,
        network: body.network,
        adminUserId: session && ['SUPERADMIN', 'EDITOR', 'VENDEDOR'].includes(session.role) ? session.userId : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Share event logging error:', error);
    return NextResponse.json({ error: 'No fue posible registrar la acción de compartir.' }, { status: 500 });
  }
}
