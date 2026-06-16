'use client';

import { useState, useTransition } from 'react';

interface NewsletterSignupFormProps {
  sourcePage: string;
  buttonLabel?: string;
}

export default function NewsletterSignupForm({ sourcePage, buttonLabel = 'Suscribirme' }: NewsletterSignupFormProps) {
  const [email, setEmail] = useState('');
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      setStatus(null);

      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          sourcePage,
        }),
      });

      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setStatus({
          type: 'error',
          message: data.error ?? 'No fue posible guardar tu correo en este momento.',
        });
        return;
      }

      setStatus({
        type: 'success',
        message: data.message ?? 'Listo, guardamos tu correo para próximas novedades.',
      });
      setEmail('');
    });
  };

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, maxWidth: '460px' }}>
      <input
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="Tu correo electrónico"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={isPending}
        style={{
          borderRadius: 999,
          border: '1px solid rgba(212,175,55,0.18)',
          background: 'rgba(255,255,255,0.04)',
          color: '#FFFFF0',
          padding: '14px 18px',
          outline: 'none',
          fontSize: 15,
        }}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <button
          type="submit"
          disabled={isPending}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 180,
            padding: '14px 22px',
            borderRadius: 999,
            border: 'none',
            background: '#D4AF37',
            color: '#1a130d',
            fontWeight: 700,
            cursor: isPending ? 'wait' : 'pointer',
            opacity: isPending ? 0.8 : 1,
          }}
        >
          {isPending ? 'Guardando...' : buttonLabel}
        </button>

        {status ? (
          <span
            style={{
              color: status.type === 'success' ? '#9BD4A4' : '#FFB4A8',
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {status.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}

