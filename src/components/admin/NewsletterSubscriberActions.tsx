'use client';

import { useState, useTransition } from 'react';
import { Alert, Box, Button, Snackbar } from '@mui/material';

interface NewsletterSubscriberActionsProps {
  subscriberId: string;
  isActive: boolean;
}

export default function NewsletterSubscriberActions({ subscriberId, isActive }: NewsletterSubscriberActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);

  const runAction = (action: 'toggle-active' | 'delete') => {
    if (action === 'delete' && !window.confirm('¿Seguro que quieres eliminar este suscriptor?')) {
      return;
    }

    if (action === 'toggle-active' && !window.confirm(isActive ? '¿Desactivar este suscriptor?' : '¿Reactivar este suscriptor?')) {
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/admin/newsletter/${subscriberId}`, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: action === 'delete' ? undefined : JSON.stringify({ action }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setToast({
          severity: 'error',
          message: data.error ?? 'No fue posible completar la acción.',
        });
        return;
      }

      setToast({
        severity: 'success',
        message:
          action === 'delete'
            ? 'Suscriptor eliminado correctamente.'
            : isActive
              ? 'Suscriptor desactivado correctamente.'
              : 'Suscriptor reactivado correctamente.',
      });

      window.location.reload();
    });
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Button
          type="button"
          onClick={() => runAction('toggle-active')}
          disabled={isPending}
          variant="outlined"
          size="small"
          sx={{
            borderColor: 'rgba(212,175,55,0.14)',
            color: '#FFFFF0',
            borderRadius: '999px',
            whiteSpace: 'nowrap',
          }}
        >
          {isActive ? 'Desactivar' : 'Reactivar'}
        </Button>

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
      </Box>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2800}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast?.severity ?? 'success'} onClose={() => setToast(null)} variant="filled">
          {toast?.message}
        </Alert>
      </Snackbar>
    </>
  );
}

