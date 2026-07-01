'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface CustomerAccessFormProps {
  nextPath: string;
}

export default function CustomerAccessForm({ nextPath }: CustomerAccessFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    startTransition(async () => {
      try {
        const response = await fetch(mode === 'login' ? '/api/auth/login' : '/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const payload = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? 'No fue posible continuar.');
        }

        router.replace(nextPath);
        router.refresh();
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'No fue posible continuar.');
      }
    });
  }

  return (
    <section
      style={{
        width: 'min(100%, 480px)',
        padding: 28,
        borderRadius: 28,
        border: '1px solid rgba(212,175,55,0.22)',
        background: 'rgba(31,23,18,0.94)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.28)',
      }}
    >
      <p style={{ margin: 0, color: '#d4af37', letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: 12 }}>
        Cuenta Amantra
      </p>
      <h1 style={{ margin: '10px 0 8px', fontSize: 'clamp(2rem, 6vw, 3.2rem)' }}>
        {mode === 'login' ? 'Vuelve a tu espacio' : 'Crea tu cuenta'}
      </h1>
      <p style={{ margin: '0 0 22px', color: 'rgba(245,239,228,0.72)', lineHeight: 1.7 }}>
        Tu cuenta protege el acceso a los talleres que hayas comprado.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button type="button" className={mode === 'login' ? 'checkout-button' : 'ghost-button'} onClick={() => { setMode('login'); setError(''); }}>
          Iniciar sesión
        </button>
        <button type="button" className={mode === 'register' ? 'checkout-button' : 'ghost-button'} onClick={() => { setMode('register'); setError(''); }}>
          Crear cuenta
        </button>
      </div>

      <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
        {mode === 'register' ? (
          <input
            className="cart-input"
            placeholder="Nombre completo"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
        ) : null}
        <input
          className="cart-input"
          type="email"
          placeholder="Correo"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          required
        />
        <input
          className="cart-input"
          type="password"
          placeholder="Contraseña (mínimo 8 caracteres)"
          minLength={8}
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          required
        />
        {error ? <div style={{ color: '#ffaaa2', lineHeight: 1.5 }}>{error}</div> : null}
        <button className="checkout-button" type="submit" disabled={pending}>
          {pending ? 'Procesando...' : mode === 'login' ? 'Entrar y continuar' : 'Crear cuenta y continuar'}
        </button>
      </form>
    </section>
  );
}