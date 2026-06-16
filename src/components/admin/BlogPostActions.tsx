'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Alert, Box, Button, Snackbar } from '@mui/material';

interface BlogPostActionsProps {
  postId: string;
  published: boolean;
}

export default function BlogPostActions({ postId, published }: BlogPostActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);

  const runAction = (action: 'toggle-published' | 'delete') => {
    const confirmationMessage =
      action === 'delete'
        ? '¿Seguro que quieres eliminar este artículo?'
        : published
          ? '¿Quieres quitar este artículo de publicación?'
          : '¿Quieres publicar este artículo?';

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/admin/blog/${postId}`, {
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
            ? 'Artículo eliminado correctamente.'
            : published
              ? 'Artículo despublicado correctamente.'
              : 'Artículo publicado correctamente.',
      });

      window.location.reload();
    });
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Button
          component={Link}
          href={`/admin_group/admin/blog/${postId}`}
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

        <Button
          type="button"
          onClick={() => runAction('toggle-published')}
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
          {published ? 'Despublicar' : 'Publicar'}
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
