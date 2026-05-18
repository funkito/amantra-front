'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Alert, Box, Button, MenuItem, Snackbar, TextField } from '@mui/material';

interface OrderStatusActionsProps {
  orderId: string;
  currentStatus: string;
}

const orderStatusOptions = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'PAID', label: 'Pagada' },
  { value: 'PREPARING', label: 'En preparación' },
  { value: 'SHIPPED', label: 'Enviada' },
  { value: 'CANCELLED', label: 'Cancelada' },
];

export default function OrderStatusActions({ orderId, currentStatus }: OrderStatusActionsProps) {
  const [status, setStatus] = useState(currentStatus === 'COMPLETED' ? 'PAID' : currentStatus);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);

  const updateStatus = () => {
    startTransition(async () => {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setToast({
          severity: 'error',
          message: data.error ?? 'No fue posible actualizar el estado.',
        });
        return;
      }

      setToast({
        severity: 'success',
        message: 'Estado actualizado correctamente.',
      });
    });
  };

  const syncPayment = () => {
    startTransition(async () => {
      const response = await fetch(`/api/admin/orders/${orderId}/sync-payment`, {
        method: 'PATCH',
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setToast({
          severity: 'error',
          message: data.error ?? 'No fue posible sincronizar el pago.',
        });
        return;
      }

      setToast({
        severity: 'success',
        message: 'Estado de pago sincronizado con Bold.',
      });

      window.location.reload();
    });
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <Button
          component={Link}
          href={`/admin_group/admin/orders/${orderId}`}
          variant="outlined"
          size="small"
          sx={{
            borderColor: 'rgba(212,175,55,0.25)',
            color: '#D4AF37',
            borderRadius: '999px',
            whiteSpace: 'nowrap',
          }}
        >
          Ver detalle
        </Button>

        <Button
          type="button"
          onClick={syncPayment}
          disabled={isPending}
          variant="outlined"
          size="small"
          sx={{
            borderColor: 'rgba(212,175,55,0.2)',
            color: '#FFFFF0',
            borderRadius: '999px',
            whiteSpace: 'nowrap',
          }}
        >
          Sync pago
        </Button>

        <TextField
          select
          size="small"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          sx={{
            minWidth: 160,
            '& .MuiOutlinedInput-root': {
              color: '#FFFFF0',
              backgroundColor: 'rgba(255,255,255,0.02)',
              '& fieldset': { borderColor: 'rgba(212,175,55,0.12)' },
              '&:hover fieldset': { borderColor: 'rgba(212,175,55,0.35)' },
              '&.Mui-focused fieldset': { borderColor: '#D4AF37' },
            },
          }}
        >
          {orderStatusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <Button
          type="button"
          onClick={updateStatus}
          disabled={isPending}
          variant="contained"
          size="small"
          sx={{
            bgcolor: '#D4AF37',
            color: '#140e0a',
            borderRadius: '999px',
            fontWeight: 700,
            '&:hover': { bgcolor: '#C29B30' },
          }}
        >
          Guardar
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
