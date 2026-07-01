'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

interface WorkshopPaywallProps {
  slug: string;
  price: number;
  authenticated: boolean;
  paymentReturned?: boolean;
}

export default function WorkshopPaywall({
  slug,
  price,
  authenticated,
  paymentReturned = false,
}: WorkshopPaywallProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function beginCheckout() {
    setError('');
    startTransition(async () => {
      try {
        const response = await fetch('/api/workshops/' + encodeURIComponent(slug) + '/checkout', {
          method: 'POST',
        });
        const payload = (await response.json()) as { error?: string; redirectUrl?: string };

        if (response.status === 401) {
          router.push('/cuenta/ingresar?next=' + encodeURIComponent('/blog/' + slug));
          return;
        }

        if (!response.ok || !payload.redirectUrl) {
          throw new Error(payload.error ?? 'No fue posible iniciar el pago.');
        }

        window.location.assign(payload.redirectUrl);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'No fue posible iniciar el pago.');
      }
    });
  }

  return (
    <section
      style={{
        padding: 'clamp(24px, 5vw, 44px)',
        borderRadius: 28,
        border: '1px solid rgba(212,175,55,0.28)',
        background:
          'radial-gradient(circle at top right, rgba(212,175,55,0.16), transparent 38%), rgba(35,25,19,0.92)',
        textAlign: 'center',
        display: 'grid',
        justifyItems: 'center',
        gap: 14,
      }}
    >
      <div style={{ color: '#d4af37', letterSpacing: '0.16em', textTransform: 'uppercase', fontSize: 12 }}>
        Taller online
      </div>
      <h2 style={{ margin: 0, fontSize: 'clamp(1.8rem, 5vw, 3rem)' }}>Contenido exclusivo</h2>
      <p style={{ margin: 0, maxWidth: 600, color: 'rgba(245,239,228,0.76)', lineHeight: 1.75 }}>
        El contenido completo se habilita en tu cuenta cuando Bold confirma el pago.
      </p>
      <strong style={{ color: '#f2c85b', fontSize: '1.45rem' }}>{currency.format(price)}</strong>

      {paymentReturned ? (
        <div style={{ color: '#f5d98f', lineHeight: 1.6 }}>
          Estamos verificando el pago. Si ya fue aprobado, actualiza en unos segundos.
        </div>
      ) : null}

      {authenticated ? (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button type="button" className="checkout-button" onClick={beginCheckout} disabled={pending}>
            {pending ? 'Preparando pago...' : 'Comprar acceso'}
          </button>
          {paymentReturned ? (
            <button type="button" className="ghost-button" onClick={() => router.refresh()}>
              Verificar acceso
            </button>
          ) : null}
        </div>
      ) : (
        <Link
          href={'/cuenta/ingresar?next=' + encodeURIComponent('/blog/' + slug)}
          className="checkout-button"
        >
          Iniciar sesión para comprar
        </Link>
      )}

      {error ? <div style={{ color: '#ffaaa2' }}>{error}</div> : null}
    </section>
  );
}