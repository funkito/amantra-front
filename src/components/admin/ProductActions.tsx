'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Alert, Button, Snackbar, Stack } from '@mui/material';

interface ProductActionsProps {
  productId: string;
  currentStatus: 'PUBLISHED' | 'DRAFT' | 'UNPUBLISHED';
}

export default function ProductActions({ productId, currentStatus }: ProductActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const runAction = async (action: 'unpublish' | 'delete') => {
    const confirmed =
      action === 'delete'
        ? window.confirm('¿Seguro que quieres eliminar este producto? Se ocultará del catálogo.')
        : window.confirm('¿Quieres despublicar este producto?');

    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/admin/products/${productId}`, {
      method: action === 'delete' ? 'DELETE' : 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setToast({
        message: data.error ?? 'No fue posible completar la acción.',
        severity: 'error',
      });
      return;
    }

    setToast({
      message: action === 'delete' ? 'Producto eliminado del catálogo.' : 'Producto despublicado correctamente.',
      severity: 'success',
    });

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ mt: 1 }}>
        <Button
          component={Link}
          href={`/admin_group/admin/products/${productId}`}
          variant="outlined"
          size="small"
          sx={{
            borderColor: 'rgba(212,175,55,0.25)',
            color: '#D4AF37',
            borderRadius: '999px',
            whiteSpace: 'nowrap',
          }}
        >
          Editar
        </Button>

        {currentStatus !== 'UNPUBLISHED' ? (
          <Button
            type="button"
            onClick={() => runAction('unpublish')}
            disabled={isPending}
            variant="outlined"
            size="small"
            sx={{
              borderColor: 'rgba(212,175,55,0.12)',
              color: '#FFF8EA',
              borderRadius: '999px',
              whiteSpace: 'nowrap',
            }}
          >
            Despublicar
          </Button>
        ) : null}

        <Button
          type="button"
          onClick={() => runAction('delete')}
          disabled={isPending}
          variant="outlined"
          size="small"
          sx={{
            borderColor: 'rgba(255,120,120,0.18)',
            color: '#ff9e95',
            borderRadius: '999px',
            whiteSpace: 'nowrap',
          }}
        >
          Eliminar
        </Button>
      </Stack>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2800}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setToast(null)} severity={toast?.severity ?? 'success'} variant="filled">
          {toast?.message}
        </Alert>
      </Snackbar>
    </>
  );
}
