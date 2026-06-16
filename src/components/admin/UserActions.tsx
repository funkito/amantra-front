'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Alert, Box, Button, Snackbar } from '@mui/material';

interface UserActionsProps {
  userId: string;
  currentActive: boolean;
  currentUserId: string;
}

export default function UserActions({ userId, currentActive, currentUserId }: UserActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);

  const runAction = (action: 'toggle-active' | 'delete') => {
    if (action === 'delete' && !window.confirm('¿Seguro que quieres eliminar este usuario?')) {
      return;
    }

    if (action === 'toggle-active' && !window.confirm(currentActive ? '¿Desactivar este usuario?' : '¿Activar este usuario?')) {
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/admin/users/${userId}`, {
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
            ? 'Usuario eliminado correctamente.'
            : currentActive
              ? 'Usuario desactivado correctamente.'
              : 'Usuario activado correctamente.',
      });

      window.location.reload();
    });
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Button
          component={Link}
          href={`/admin_group/admin/users/${userId}`}
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

        {userId !== currentUserId ? (
          <>
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
              {currentActive ? 'Desactivar' : 'Activar'}
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
          </>
        ) : null}
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
