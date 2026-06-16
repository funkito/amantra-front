'use client';

import { FormEvent, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

type Mode = 'login' | 'setup';

interface AuthFormProps {
  mode: Mode;
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const isSetup = mode === 'setup';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const endpoint = isSetup ? '/api/admin/setup' : '/api/admin/login';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = (await response.json()) as { error?: string; message?: string };

    if (!response.ok) {
      setError(data.error ?? 'No fue posible completar la operación.');
      return;
    }

    if (isSetup) {
      setSuccess('Administrador creado correctamente. Entrando al panel...');
    }

    startTransition(() => {
      router.push('/admin_group');
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="admin-auth-form">
      {isSetup ? (
        <label>
          Nombre
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Administrador Amantra"
            required
          />
        </label>
      ) : null}

      <label>
        Correo
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          placeholder="admin@amantra.com"
          required
        />
      </label>

      <label>
        Contraseña
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          placeholder="Minimo 8 caracteres"
          required
          minLength={8}
        />
      </label>

      {error ? <p className="admin-auth-error">{error}</p> : null}
      {success ? <p className="admin-auth-success">{success}</p> : null}

      <button type="submit" disabled={isPending}>
        {isPending ? 'Procesando...' : isSetup ? 'Crear administrador' : 'Ingresar'}
      </button>
    </form>
  );
}
