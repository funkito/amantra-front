import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { pageBuilderDocumentSchema } from '@/lib/builder/page-schema';
import { prisma } from '@/lib/prisma';

async function authorizePageBuilder() {
  const session = await getSessionFromCookies();

  if (!session || !['SUPERADMIN', 'EDITOR'].includes(session.role)) {
    return null;
  }

  return session;
}

interface VersionRouteProps {
  params: Promise<{
    versionId: string;
  }>;
}

export async function GET(_request: Request, { params }: VersionRouteProps) {
  try {
    const session = await authorizePageBuilder();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const { versionId } = await params;

    const version = await prisma.pageLayoutVersion.findUnique({
      where: { id: versionId },
    });

    if (!version) {
      return NextResponse.json({ error: 'No encontramos esa versión.' }, { status: 404 });
    }

    const snapshot = pageBuilderDocumentSchema.parse(version.snapshot);

    return NextResponse.json({
      version: {
        id: version.id,
        createdAt: version.createdAt.toISOString(),
        label: version.label,
        status: version.status,
        snapshot,
      },
    });
  } catch (error) {
    console.error('Page version fetch error:', error);
    return NextResponse.json({ error: 'No fue posible cargar la versión.' }, { status: 500 });
  }
}
