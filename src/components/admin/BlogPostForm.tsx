'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import RichTextEditor, { buildInlineImageMarkup } from '@/components/admin/RichTextEditor';

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

export interface BlogPostFormInitialData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string;
  tags: string[];
  published: boolean;
}

interface BlogPostFormProps {
  mode?: 'create' | 'edit';
  postId?: string;
  initialData?: BlogPostFormInitialData;
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function BlogPostForm({ mode = 'create', postId, initialData }: BlogPostFormProps) {
  const router = useRouter();
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);
  const [mediaItems, setMediaItems] = useState<Array<{ id: string; label: string; url: string; source: string }>>([]);
  const [mediaQuery, setMediaQuery] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tagOptions, setTagOptions] = useState<string[]>([]);
  const [showBodyMediaLibrary, setShowBodyMediaLibrary] = useState(false);
  const [uploadState, setUploadState] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({
    type: 'idle',
    message: '',
  });
  const [manualSlug, setManualSlug] = useState(Boolean(initialData?.slug));
  const [form, setForm] = useState({
    title: initialData?.title ?? '',
    slug: initialData?.slug ?? '',
    excerpt: initialData?.excerpt ?? '',
    body: initialData?.body ?? '',
    coverImage: initialData?.coverImage ?? '',
    tags: initialData?.tags.join(', ') ?? '',
    published: initialData?.published ?? false,
  });

  useEffect(() => {
    void loadMediaLibrary().then(setMediaItems);
  }, []);

  useEffect(() => {
    if (!tagInput.trim()) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      const response = await fetch(`/api/admin/tags?q=${encodeURIComponent(tagInput)}`);

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as { tags: string[] };
      setTagOptions(data.tags);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [tagInput]);

  const computedSlug = useMemo(() => {
    if (manualSlug) {
      return form.slug;
    }

    return slugify(form.title);
  }, [form.slug, form.title, manualSlug]);

  const filteredMedia = useMemo(() => {
    const normalized = mediaQuery.trim().toLowerCase();

    if (!normalized) {
      return mediaItems;
    }

    return mediaItems.filter((media) => media.label.toLowerCase().includes(normalized));
  }, [mediaItems, mediaQuery]);

  async function persistPost() {
    const response = await fetch(mode === 'edit' && postId ? `/api/admin/blog/${postId}` : '/api/admin/blog', {
      method: mode === 'edit' ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...form,
        slug: computedSlug,
      }),
    });

    const data = (await response.json()) as { error?: string; post?: { id: string } };

    if (!response.ok) {
      throw new Error(data.error ?? 'No fue posible guardar el artículo.');
    }

    return data;
  }

  async function handleCoverUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('images', file);

    setUploadState({
      type: 'loading',
      message: 'Subiendo portada...',
    });

    try {
      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      const data = (await response.json()) as {
        error?: string;
        media?: Array<{ url: string }>;
      };

      if (!response.ok) {
        throw new Error(data.error ?? 'No fue posible subir la imagen.');
      }

      const uploadedImage = data.media?.[0]?.url ?? '';

      if (!uploadedImage) {
        throw new Error('La subida terminó, pero no devolvió una imagen válida.');
      }

      setForm((current) => ({
        ...current,
        coverImage: uploadedImage,
      }));
      const refreshedMedia = await loadMediaLibrary();
      setMediaItems(refreshedMedia);

      setUploadState({
        type: 'success',
        message: 'Portada subida correctamente.',
      });
    } catch (error) {
      setUploadState({
        type: 'error',
        message: error instanceof Error ? error.message : 'No fue posible subir la imagen.',
      });
    } finally {
      if (uploadInputRef.current) {
        uploadInputRef.current.value = '';
      }
    }
  }

  function insertImageIntoBody(imageUrl: string) {
    const snippet = buildInlineImageMarkup(imageUrl, '', 'medium');

    setForm((current) => ({
      ...current,
      body: `${current.body}${current.body ? '' : ''}${snippet}`,
    }));
    setShowBodyMediaLibrary(false);
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      try {
        const data = await persistPost();

        setToast({
          severity: 'success',
          message: mode === 'edit' ? 'Artículo actualizado correctamente.' : 'Artículo creado correctamente.',
        });

        if (mode === 'edit') {
          router.push('/admin_group/admin/blog');
        } else if (data.post?.id) {
          router.push(`/admin_group/admin/blog/${data.post.id}`);
        } else {
          setForm({
            title: '',
            slug: '',
            excerpt: '',
            body: '',
            coverImage: '',
            tags: '',
            published: false,
          });
          setManualSlug(false);
          router.refresh();
        }
      } catch (error) {
        setToast({
          severity: 'error',
          message: error instanceof Error ? error.message : 'No fue posible guardar el artículo.',
        });
      }
    });
  };

  const preview = () => {
    startTransition(async () => {
      try {
        const data = await persistPost();
        const targetId = mode === 'edit' ? postId : data.post?.id;

        if (!targetId) {
          throw new Error('No fue posible preparar la vista previa.');
        }

        if (mode === 'create' && data.post?.id) {
          router.replace(`/admin_group/admin/blog/${data.post.id}`);
        }

        window.open(`/admin_group/admin/blog/preview/${targetId}`, '_blank', 'noopener,noreferrer');
      } catch (error) {
        setToast({
          severity: 'error',
          message: error instanceof Error ? error.message : 'No fue posible abrir la vista previa.',
        });
      }
    });
  };

  const selectedTags = useMemo(
    () =>
      form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    [form.tags]
  );

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
          {mode === 'edit' ? 'Editar artículo' : 'Nuevo artículo'}
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
            label="Título"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            sx={darkFieldSx}
          />

          <TextField
            fullWidth
            label="Slug"
            value={computedSlug}
            onChange={(event) => {
              setManualSlug(true);
              setForm((current) => ({ ...current, slug: event.target.value }));
            }}
            helperText="URL amigable del artículo."
            sx={darkFieldSx}
          />

          <TextField
            fullWidth
            label="Imagen de portada"
            placeholder="https://..."
            value={form.coverImage}
            onChange={(event) => setForm((current) => ({ ...current, coverImage: event.target.value }))}
            sx={darkFieldSx}
          />

          <Autocomplete
            multiple
            freeSolo
            options={tagOptions}
            value={selectedTags}
            inputValue={tagInput}
            onInputChange={(_event, nextValue) => {
              setTagInput(nextValue);

              if (!nextValue.trim()) {
                setTagOptions([]);
              }
            }}
            onChange={(_event, nextValue) =>
              setForm((current) => ({
                ...current,
                tags: nextValue
                  .map((tag) => String(tag).trim())
                  .filter(Boolean)
                  .join(', '),
              }))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                label="Etiquetas"
                placeholder="ritual, joyas, bienestar"
                helperText="Escribe para buscar o crea una nueva etiqueta."
                sx={darkFieldSx}
              />
            )}
            sx={{
              '& .MuiChip-root': {
                bgcolor: 'rgba(212,175,55,0.12)',
                color: '#D4AF37',
              },
              '& .MuiAutocomplete-clearIndicator, & .MuiAutocomplete-popupIndicator': {
                color: '#D4AF37',
              },
            }}
          />

          <TextField
            fullWidth
            label="Extracto"
            value={form.excerpt}
            onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))}
            multiline
            minRows={3}
            sx={{ ...darkFieldSx, gridColumn: { xs: '1 / -1', md: '1 / -1' } }}
          />

          <Box sx={{ gridColumn: { xs: '1 / -1', md: '1 / -1' } }}>
            <RichTextEditor
              label="Contenido"
              value={form.body}
              onChange={(nextValue) => setForm((current) => ({ ...current, body: nextValue }))}
              onOpenMediaLibrary={() => setShowBodyMediaLibrary((current) => !current)}
              mediaLibraryLabel="Medios"
            />
          </Box>
        </Box>

        {showBodyMediaLibrary ? (
          <Box
            sx={{
              mt: 2,
              display: 'grid',
              gap: 1.4,
              p: 2,
              borderRadius: '20px',
              border: '1px solid rgba(212,175,55,0.14)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <Typography sx={{ color: '#D4AF37', fontWeight: 700 }}>Insertar imagen en el contenido</Typography>
            <TextField
              fullWidth
              label="Buscar imagen"
              value={mediaQuery}
              onChange={(event) => setMediaQuery(event.target.value)}
              sx={darkFieldSx}
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 1.2,
              }}
            >
              {filteredMedia.map((media) => (
                <Box
                  key={media.id}
                  sx={{
                    borderRadius: '18px',
                    overflow: 'hidden',
                    border: '1px solid rgba(212,175,55,0.12)',
                    background: '#0f0f0f',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- Admin media gallery uses arbitrary project images. */}
                  <img
                    src={media.url}
                    alt={media.label}
                    style={{
                      display: 'block',
                      width: '100%',
                      height: 160,
                      objectFit: 'cover',
                    }}
                  />
                  <Box sx={{ p: 1.2, display: 'grid', gap: 0.8 }}>
                    <Typography sx={{ color: '#FFFFF0', fontSize: '0.92rem', fontWeight: 700 }}>
                      {media.label}
                    </Typography>
                    <Typography sx={{ color: '#8f846d', fontSize: '0.82rem' }}>{media.source}</Typography>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => insertImageIntoBody(media.url)}
                      sx={{
                        borderColor: 'rgba(212,175,55,0.24)',
                        color: '#D4AF37',
                        borderRadius: '999px',
                      }}
                    >
                      Insertar en contenido
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        ) : null}

        <Box
          sx={{
            mt: 2,
            display: 'grid',
            gap: 1.4,
            p: 2,
            borderRadius: '20px',
            border: '1px solid rgba(212,175,55,0.14)',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <Typography sx={{ color: '#D4AF37', fontWeight: 700 }}>Portada del artículo</Typography>

          <input
            ref={uploadInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleCoverUpload}
            style={{ display: 'none' }}
          />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, alignItems: 'center' }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => uploadInputRef.current?.click()}
              sx={{
                borderColor: 'rgba(212,175,55,0.24)',
                color: '#D4AF37',
                borderRadius: '999px',
              }}
            >
              Subir imagen
            </Button>

            <Typography sx={{ color: '#8f846d', fontSize: '0.9rem' }}>
              JPG, PNG o WEBP. Máximo 5MB por archivo.
            </Typography>
          </Box>

          {uploadState.type !== 'idle' ? (
            <Box
              sx={{
                borderRadius: '14px',
                px: 1.5,
                py: 1.1,
                fontSize: '0.92rem',
                color:
                  uploadState.type === 'error'
                    ? '#ffb3b3'
                    : uploadState.type === 'success'
                      ? '#9ae6b4'
                      : '#FFFFF0',
                border:
                  uploadState.type === 'error'
                    ? '1px solid rgba(255,99,99,0.28)'
                    : uploadState.type === 'success'
                      ? '1px solid rgba(72,187,120,0.28)'
                      : '1px solid rgba(212,175,55,0.12)',
                background:
                  uploadState.type === 'error'
                    ? 'rgba(255,99,99,0.08)'
                    : uploadState.type === 'success'
                      ? 'rgba(72,187,120,0.08)'
                      : 'rgba(255,255,255,0.02)',
              }}
            >
              {uploadState.message}
            </Box>
          ) : null}

          {form.coverImage ? (
            <Box
              sx={{
                borderRadius: '18px',
                overflow: 'hidden',
                border: '1px solid rgba(212,175,55,0.12)',
                background: '#0f0f0f',
                maxWidth: 360,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- Admin preview uses arbitrary uploaded/local URLs. */}
              <img
                src={form.coverImage}
                alt="Vista previa de la portada"
                style={{
                  display: 'block',
                  width: '100%',
                  height: 210,
                  objectFit: 'cover',
                }}
              />
            </Box>
          ) : null}
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={form.published}
              onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))}
              sx={{
                color: '#D4AF37',
                '&.Mui-checked': { color: '#D4AF37' },
              }}
            />
          }
          label="Publicado"
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
            {mode === 'edit' ? 'Guardar cambios' : 'Crear artículo'}
          </Button>

          <>
            <Button
              type="button"
              variant="outlined"
              onClick={preview}
              disabled={isPending}
              sx={{
                borderColor: 'rgba(212,175,55,0.24)',
                color: '#D4AF37',
                borderRadius: '999px',
              }}
            >
              Vista previa
            </Button>

            {mode === 'edit' ? (
              <Button
                type="button"
                variant="outlined"
                onClick={() => router.push('/admin_group/admin/blog')}
                sx={{
                  borderColor: 'rgba(212,175,55,0.24)',
                  color: '#D4AF37',
                  borderRadius: '999px',
                }}
              >
                Cancelar
              </Button>
            ) : null}
          </>
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

async function loadMediaLibrary() {
  try {
    const response = await fetch('/api/admin/media', { cache: 'no-store' });
    const data = (await response.json()) as {
      media?: Array<{ id: string; label: string; url: string; source: string }>;
    };

    if (!response.ok) {
      return [];
    }

    return data.media ?? [];
  } catch {
    return [];
  }
}
