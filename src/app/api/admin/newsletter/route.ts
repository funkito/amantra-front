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

export async function GET() {
  try {
    const session = await authorizeNewsletterManagers();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ subscribers });
  } catch (error) {
    console.error('Newsletter admin fetch error:', error);
    return NextResponse.json({ error: 'No fue posible cargar los suscriptores.' }, { status: 500 });
  }
}

