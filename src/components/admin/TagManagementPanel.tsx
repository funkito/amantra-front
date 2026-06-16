'use client';

import { useState, useTransition } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

export type AdminTagRow = {
  id: number;
  name: string;
  slug: string;
  productCount: number;
  blogCount: number;
};

interface TagManagementPanelProps {
  initialTags: AdminTagRow[];
}

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
};

export default function TagManagementPanel({ initialTags }: TagManagementPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [tags, setTags] = useState(initialTags);
  const [newTagName, setNewTagName] = useState('');
  const [editing, setEditing] = useState<Record<number, string>>({});
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);

  const refreshTags = async () => {
    const response = await fetch('/api/admin/tags?admin=1');
    const data = (await response.json()) as { tags?: AdminTagRow[]; error?: string };

    if (!response.ok) {
      throw new Error(data.error ?? 'No fue posible actualizar etiquetas.');
    }

    setTags(data.tags ?? []);
  };

  const createTag = () => {
    const name = newTagName.trim();

    if (!name) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/admin/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        const data = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(data.error ?? 'No fue posible crear la etiqueta.');
        }

        setNewTagName('');
        await refreshTags();
        setToast({ severity: 'success', message: 'Etiqueta guardada.' });
      } catch (error) {
        setToast({
          severity: 'error',
          message: error instanceof Error ? error.message : 'No fue posible guardar la etiqueta.',
        });
      }
    });
  };

  const updateTag = (tag: AdminTagRow) => {
    const name = (editing[tag.id] ?? tag.name).trim();

    if (!name || name === tag.name) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/tags/${tag.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        const data = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(data.error ?? 'No fue posible actualizar la etiqueta.');
        }

        await refreshTags();
        setEditing((current) => {
          const next = { ...current };
          delete next[tag.id];
          return next;
        });
        setToast({ severity: 'success', message: 'Etiqueta actualizada.' });
      } catch (error) {
        setToast({
          severity: 'error',
          message: error instanceof Error ? error.message : 'No fue posible actualizar la etiqueta.',
        });
      }
    });
  };

  const deleteTag = (tag: AdminTagRow) => {
    if (!window.confirm(`¿Eliminar la etiqueta "${tag.name}" y quitarla de productos y blog?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/tags/${tag.id}`, {
          method: 'DELETE',
        });
        const data = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(data.error ?? 'No fue posible eliminar la etiqueta.');
        }

        await refreshTags();
        setToast({ severity: 'success', message: 'Etiqueta eliminada.' });
      } catch (error) {
        setToast({
          severity: 'error',
          message: error instanceof Error ? error.message : 'No fue posible eliminar la etiqueta.',
        });
      }
    });
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '24px',
          bgcolor: '#111',
          border: '1px solid rgba(212,175,55,0.16)',
          display: 'grid',
          gap: 3,
        }}
      >
        <Box>
          <Typography sx={{ color: '#D4AF37', fontFamily: 'var(--font-display)', fontSize: '2rem' }}>
            Administrador de etiquetas
          </Typography>
          <Typography sx={{ color: '#BDBDBD', mt: 0.8 }}>
            Normaliza nombres, fusiona duplicados y controla qué etiquetas alimentan filtros y relaciones.
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.4}>
          <TextField
            fullWidth
            label="Nueva etiqueta"
            value={newTagName}
            onChange={(event) => setNewTagName(event.target.value)}
            sx={fieldSx}
          />
          <Button
            type="button"
            onClick={createTag}
            disabled={isPending || !newTagName.trim()}
            variant="contained"
            sx={{ bgcolor: '#D4AF37', color: '#140e0a', fontWeight: 800, px: 3 }}
          >
            Crear
          </Button>
        </Stack>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Etiqueta</TableCell>
                <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Slug</TableCell>
                <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Uso</TableCell>
                <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id} sx={{ '& td': { borderColor: 'rgba(212,175,55,0.08)' } }}>
                  <TableCell>
                    <TextField
                      fullWidth
                      value={editing[tag.id] ?? tag.name}
                      onChange={(event) =>
                        setEditing((current) => ({
                          ...current,
                          [tag.id]: event.target.value,
                        }))
                      }
                      sx={fieldSx}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#D7D0C3' }}>{tag.slug}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.8} useFlexGap sx={{ flexWrap: 'wrap' }}>
                      <Chip label={`${tag.productCount} productos`} size="small" sx={{ color: '#D4AF37' }} />
                      <Chip label={`${tag.blogCount} blogs`} size="small" sx={{ color: '#D4AF37' }} />
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        type="button"
                        onClick={() => updateTag(tag)}
                        disabled={isPending || (editing[tag.id] ?? tag.name).trim() === tag.name}
                        size="small"
                        variant="outlined"
                        sx={{ borderColor: 'rgba(212,175,55,0.25)', color: '#D4AF37' }}
                      >
                        Guardar
                      </Button>
                      <Button
                        type="button"
                        onClick={() => deleteTag(tag)}
                        disabled={isPending}
                        size="small"
                        variant="outlined"
                        sx={{ borderColor: 'rgba(255,120,120,0.18)', color: '#ff9e95' }}
                      >
                        Eliminar
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2600}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast?.severity ?? 'success'} variant="filled" onClose={() => setToast(null)}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </>
  );
}
