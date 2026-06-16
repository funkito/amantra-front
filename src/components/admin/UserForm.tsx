'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, Checkbox, FormControlLabel, MenuItem, Paper, Snackbar, TextField, Typography } from '@mui/material';

const darkFieldSx = {
  '& .MuiOutlinedInput-root': {
    color: '#FFFFF0',
    backgroundColor: 'rgba(255,255,255,0.02)',
    '& fieldset': {
      borderColor: 'rgba(212, 175, 55, 0.12)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(212, 175, 55, 0.35)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#D4AF37',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#BDBDBD',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#D4AF37',
  },
};

interface UserFormInitialData {
  id: string;
  name: string;
  email: string;
  role: 'SUPERADMIN' | 'EDITOR' | 'CLIENTE';
  isActive: boolean;
}

interface UserFormProps {
  mode?: 'create' | 'edit';
  userId?: string;
  initialData?: UserFormInitialData;
}

export default function UserForm({ mode = 'create', userId, initialData }: UserFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);
  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    email: initialData?.email ?? '',
    role: initialData?.role ?? ('CLIENTE' as const),
    isActive: initialData?.isActive ?? true,
    password: '',
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      const response = await fetch(mode === 'edit' && userId ? `/api/admin/users/${userId}` : '/api/admin/users', {
        method: mode === 'edit' ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setToast({
          severity: 'error',
          message: data.error ?? 'No fue posible guardar el usuario.',
        });
        return;
      }

      setToast({
        severity: 'success',
        message: mode === 'edit' ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.',
      });

      if (mode === 'edit') {
        router.push('/admin_group/admin/users');
      } else {
        setForm({
          name: '',
          email: '',
          role: 'CLIENTE',
          isActive: true,
          password: '',
        });
        router.refresh();
      }
    });
  };

  return (
    <>
      <Paper
        component="form"
        onSubmit={submit}
        elevation={0}
        sx={{
          p: { xs: 2.2, md: 3 },
          borderRadius: '24px',
          bgcolor: '#111',
          border: '1px solid rgba(212,175,55,0.14)',
        }}
      >
        <Typography sx={{ color: '#D4AF37', fontFamily: 'var(--font-display)', fontSize: '1.8rem', mb: 2.5 }}>
          {mode === 'edit' ? 'Editar usuario' : 'Nuevo usuario'}
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            label="Nombre"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            sx={darkFieldSx}
          />

          <TextField
            fullWidth
            label="Correo"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            sx={darkFieldSx}
          />

          <TextField
            select
            fullWidth
            label="Rol"
            value={form.role}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                role: event.target.value as 'SUPERADMIN' | 'EDITOR' | 'CLIENTE',
              }))
            }
            sx={darkFieldSx}
          >
            <MenuItem value="SUPERADMIN">admin</MenuItem>
            <MenuItem value="EDITOR">editor</MenuItem>
            <MenuItem value="CLIENTE">customer</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label={mode === 'edit' ? 'Nueva contraseña (opcional)' : 'Contraseña'}
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            sx={darkFieldSx}
          />
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={form.isActive}
              onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
              sx={{
                color: '#D4AF37',
                '&.Mui-checked': { color: '#D4AF37' },
              }}
            />
          }
          label="Usuario activo"
          sx={{ mt: 2, color: '#FFFFF0' }}
        />

        <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending}
            sx={{
              bgcolor: '#D4AF37',
              color: '#140e0a',
              borderRadius: '999px',
              fontWeight: 700,
              '&:hover': { bgcolor: '#C29B30' },
            }}
          >
            {mode === 'edit' ? 'Guardar cambios' : 'Crear usuario'}
          </Button>

          {mode === 'edit' ? (
            <Button
              type="button"
              variant="outlined"
              onClick={() => router.push('/admin_group/admin/users')}
              sx={{
                borderColor: 'rgba(212,175,55,0.24)',
                color: '#D4AF37',
                borderRadius: '999px',
              }}
            >
              Cancelar
            </Button>
          ) : null}
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
