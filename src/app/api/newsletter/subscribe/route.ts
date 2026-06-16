import { NextResponse } from 'next/server';
import { getBackendApiUrl } from '@/lib/backend-api';
import { normalizeNewsletterEmail, validateNewsletterEmail } from '@/lib/newsletter';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      name?: string;
      sourcePage?: string;
    };

    const email = body.email ?? '';
    const validationError = validateNewsletterEmail(email);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const normalizedEmail = normalizeNewsletterEmail(email);
    const sourcePage = body.sourcePage?.trim() || undefined;
    const name = body.name?.trim() || null;
    const response = await fetch(`${getBackendApiUrl()}/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: normalizedEmail,
        ...(name ? { name } : {}),
        ...(sourcePage ? { source: sourcePage } : {}),
        metadata: {
          from: 'next-frontend',
          interestedAt: new Date().toISOString(),
        },
      }),
      cache: 'no-store',
    });

    const payload = (await response.json().catch(() => null)) as
      | { data?: unknown; error?: string; message?: string }
      | null;

    if (!response.ok) {
      return NextResponse.json(
        { error: payload?.error ?? payload?.message ?? 'No fue posible guardar el correo en este momento.' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Listo, guardamos tu interés para próximas novedades de Amantra.',
    });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json({ error: 'No fue posible guardar el correo en este momento.' }, { status: 500 });
  }
}
