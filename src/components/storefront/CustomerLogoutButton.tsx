'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function CustomerLogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="ghost-button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await fetch('/api/auth/logout', { method: 'POST' });
          router.replace('/');
          router.refresh();
        });
      }}
    >
      {pending ? 'Cerrando...' : 'Cerrar sesión'}
    </button>
  );
}