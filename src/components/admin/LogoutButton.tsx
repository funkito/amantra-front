'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', {
      method: 'POST',
    });

    startTransition(() => {
      router.push('/admin_group/login');
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      style={{
        width: '100%',
        color: '#FFF8EA',
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(212, 175, 55, 0.16)',
        borderRadius: '14px',
        padding: '12px 14px',
        cursor: 'pointer',
      }}
    >
      {isPending ? 'Saliendo...' : 'Cerrar sesión'}
    </button>
  );
}
