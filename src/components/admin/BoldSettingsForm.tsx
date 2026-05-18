'use client';

import { useState, useTransition } from 'react';
import { Alert, Box, Button, MenuItem, Paper, Snackbar, TextField, Typography } from '@mui/material';
import type { BoldSettings } from '@/lib/system-settings';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    color: '#FFFFF0',
    backgroundColor: 'rgba(255,255,255,0.02)',
    '& fieldset': { borderColor: 'rgba(212,175,55,0.12)' },
    '&:hover fieldset': { borderColor: 'rgba(212,175,55,0.35)' },
    '&.Mui-focused fieldset': { borderColor: '#D4AF37' },
  },
  '& .MuiInputLabel-root': { color: '#BDBDBD' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#D4AF37' },
  '& .MuiInputBase-input::placeholder': { color: '#7f7566', opacity: 1 },
};

interface BoldSettingsFormProps {
  initialValues: BoldSettings;
  webhookUrl: string;
}

export default function BoldSettingsForm({ initialValues, webhookUrl }: BoldSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);
  const [form, setForm] = useState({
    siteUrl: initialValues.siteUrl,
    environment: initialValues.environment,
    identityKey: initialValues.identityKey,
    secretKey: initialValues.secretKey,
    webhookPath: initialValues.webhookPath,
    linksBaseUrl: initialValues.linksBaseUrl,
    paymentsBaseUrl: initialValues.paymentsBaseUrl,
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: {
            NEXT_PUBLIC_SITE_URL: form.siteUrl,
            BOLD_ENVIRONMENT: form.environment,
            BOLD_IDENTITY_KEY: form.identityKey,
            BOLD_SECRET_KEY: form.secretKey,
            BOLD_WEBHOOK_PATH: form.webhookPath,
            BOLD_LINKS_BASE_URL: form.linksBaseUrl,
            BOLD_PAYMENTS_BASE_URL: form.paymentsBaseUrl,
          },
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setToast({
          severity: 'error',
          message: data.error ?? 'No fue posible guardar la configuración.',
        });
        return;
      }

      setToast({
        severity: 'success',
        message: 'Configuración de Bold guardada correctamente.',
      });
    });
  };

  return (
    <>
      <Paper
        component="form"
        onSubmit={submit}
        elevation={0}
        sx={{
          p: { xs: 2.4, md: 3 },
          borderRadius: '24px',
          bgcolor: '#111',
          border: '1px solid rgba(212,175,55,0.14)',
        }}
      >
        <Typography sx={{ color: '#D4AF37', fontFamily: 'var(--font-display)', fontSize: '1.9rem', mb: 1.2 }}>
          Bold y pagos online
        </Typography>
        <Typography sx={{ color: '#BDBDBD', lineHeight: 1.75, mb: 3 }}>
          Aquí centralizas el ambiente activo, las llaves de integración y las URLs base usadas por el checkout, los links de pago y el webhook.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, 1fr)' },
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            label="URL pública del sitio"
            placeholder="https://amantra.com.co"
            value={form.siteUrl}
            onChange={(event) => setForm((current) => ({ ...current, siteUrl: event.target.value }))}
            sx={fieldSx}
          />

          <TextField
            select
            fullWidth
            label="Ambiente activo"
            value={form.environment}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                environment: event.target.value as 'sandbox' | 'production',
              }))
            }
            sx={fieldSx}
          >
            <MenuItem value="sandbox">Pruebas</MenuItem>
            <MenuItem value="production">Producción</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Llave de identidad"
            value={form.identityKey}
            onChange={(event) => setForm((current) => ({ ...current, identityKey: event.target.value }))}
            sx={fieldSx}
          />

          <TextField
            fullWidth
            type="password"
            label="Llave secreta"
            value={form.secretKey}
            onChange={(event) => setForm((current) => ({ ...current, secretKey: event.target.value }))}
            sx={fieldSx}
          />

          <TextField
            fullWidth
            label="Path del webhook"
            value={form.webhookPath}
            onChange={(event) => setForm((current) => ({ ...current, webhookPath: event.target.value }))}
            sx={fieldSx}
          />

          <TextField
            fullWidth
            label="URL webhook resultante"
            value={webhookUrl || 'Completa la URL pública para generar esta ruta.'}
            slotProps={{ input: { readOnly: true } }}
            sx={fieldSx}
          />

          <TextField
            fullWidth
            label="Base URL Links de pago"
            value={form.linksBaseUrl}
            onChange={(event) => setForm((current) => ({ ...current, linksBaseUrl: event.target.value }))}
            sx={fieldSx}
          />

          <TextField
            fullWidth
            label="Base URL API directa"
            value={form.paymentsBaseUrl}
            onChange={(event) => setForm((current) => ({ ...current, paymentsBaseUrl: event.target.value }))}
            sx={fieldSx}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
          <Button
            type="submit"
            disabled={isPending}
            variant="contained"
            sx={{
              bgcolor: '#D4AF37',
              color: '#140e0a',
              borderRadius: '999px',
              fontWeight: 700,
              '&:hover': { bgcolor: '#C29B30' },
            }}
          >
            Guardar configuración
          </Button>
        </Box>
      </Paper>

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
