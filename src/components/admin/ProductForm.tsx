'use client';

import React, { DragEvent, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Autocomplete,
  Box,
  Button,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { resolveBackendAssetUrl } from '@/lib/backend-api';

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
  '& .MuiInputBase-input::placeholder': {
    color: 'rgba(255,255,240,0.45)',
    opacity: 1,
  },
  '& .MuiInputBase-inputMultiline::placeholder': {
    color: 'rgba(255,255,240,0.45)',
    opacity: 1,
  },
};

interface VariantForm {
  sku: string;
  size: string;
  color: string;
  stoneType: string;
  stock: number;
  price: string;
}

interface ExistingImagePreview {
  kind: 'existing';
  url: string;
}

interface UploadedImagePreview {
  kind: 'new';
  file: File;
  url: string;
}

type ProductImagePreview = ExistingImagePreview | UploadedImagePreview;

interface ProductFormInitialData {
  id?: string;
  name: string;
  description: string;
  basePrice: string;
  status: 'PUBLISHED' | 'DRAFT' | 'UNPUBLISHED';
  shippingMode: 'FIXED' | 'FREE';
  shippingCost: string;
  shippingNotes: string;
  tags: string[];
  images: string[];
  variants: VariantForm[];
}

interface ProductFormProps {
  mode?: 'create' | 'edit';
  productId?: string;
  initialData?: ProductFormInitialData;
}

function createEmptyProduct() {
  return {
    name: '',
    description: '',
    basePrice: '',
    status: 'DRAFT' as const,
    shippingMode: 'FIXED' as const,
    shippingCost: '',
    shippingNotes: '',
  };
}

function createEmptyVariant(): VariantForm {
  return { sku: '', size: '', color: '', stoneType: '', stock: 0, price: '' };
}

function buildResolvedTags(selectedTags: string[], tagInput: string) {
  return [...selectedTags, tagInput]
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .filter((tag, index, all) => all.findIndex((value) => value.toLowerCase() === tag.toLowerCase()) === index);
}

export default function ProductForm({
  mode = 'create',
  productId,
  initialData,
}: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [product, setProduct] = useState(
    initialData
      ? {
          name: initialData.name,
          description: initialData.description,
          basePrice: initialData.basePrice,
          status: initialData.status,
          shippingMode: initialData.shippingMode,
          shippingCost: initialData.shippingCost,
          shippingNotes: initialData.shippingNotes,
        }
      : createEmptyProduct()
  );
  const [images, setImages] = useState<ProductImagePreview[]>(
    initialData
      ? initialData.images.map((url) => ({
          kind: 'existing' as const,
          url,
        }))
      : []
  );
  const [tagInput, setTagInput] = useState('');
  const [tagOptions, setTagOptions] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags ?? []);
  const [variants, setVariants] = useState<VariantForm[]>(
    initialData?.variants.length ? initialData.variants : [createEmptyVariant()]
  );

  useEffect(() => {
    return () => {
      for (const image of images) {
        if (image.kind === 'new') {
          URL.revokeObjectURL(image.url);
        }
      }
    };
  }, [images]);

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
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [tagInput]);

  const addVariant = () => {
    setVariants((current) => [...current, createEmptyVariant()]);
  };

  const removeVariant = (index: number) => {
    setVariants((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const updateVariant = (index: number, field: keyof VariantForm, value: string | number) => {
    setVariants((current) =>
      current.map((variant, currentIndex) =>
        currentIndex === index ? { ...variant, [field]: value } : variant
      )
    );
  };

  const addImageFiles = (incomingFiles: FileList | File[]) => {
    setError('');
    const nextFiles = Array.from(incomingFiles);
    const validTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
    const validImages: UploadedImagePreview[] = [];

    for (const file of nextFiles) {
      if (!validTypes.has(file.type)) {
        setError(`El archivo ${file.name} no es JPG, PNG o WEBP.`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError(`El archivo ${file.name} supera los 5MB permitidos.`);
        continue;
      }

      validImages.push({
        kind: 'new',
        file,
        url: URL.createObjectURL(file),
      });
    }

    if (validImages.length > 0) {
      setImages((current) => [...current, ...validImages]);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    addImageFiles(event.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    setImages((current) => {
      const imageToRemove = current[index];

      if (imageToRemove?.kind === 'new') {
        URL.revokeObjectURL(imageToRemove.url);
      }

      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const resetForm = () => {
    setProduct(createEmptyProduct());
    setSelectedTags([]);
    setTagInput('');
    setTagOptions([]);
    setVariants([createEmptyVariant()]);
    setImages((current) => {
      for (const image of current) {
        if (image.kind === 'new') {
          URL.revokeObjectURL(image.url);
        }
      }

      return [];
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (images.length === 0) {
      setError('Debes mantener o subir al menos una imagen.');
      return;
    }

    if (!product.name.trim() || !product.description.trim() || !product.basePrice) {
      setError('Completa nombre, descripción y precio base.');
      return;
    }

    const resolvedTags = buildResolvedTags(selectedTags, tagInput);

    const formData = new FormData();
    formData.set('name', product.name.trim());
    formData.set('description', product.description.trim());
    formData.set('basePrice', product.basePrice);
    formData.set('status', product.status);
    formData.set('shippingMode', product.shippingMode);
    formData.set('shippingCost', product.shippingMode === 'FREE' ? '0' : product.shippingCost);
    formData.set('shippingNotes', product.shippingNotes.trim());
    formData.set('tags', JSON.stringify(resolvedTags));
    formData.set('variants', JSON.stringify(variants));
    formData.set(
      'retainedImages',
      JSON.stringify(images.filter((image) => image.kind === 'existing').map((image) => image.url))
    );

    for (const image of images) {
      if (image.kind === 'new') {
        formData.append('images', image.file);
      }
    }

    const endpoint = mode === 'edit' && productId ? `/api/admin/products/${productId}` : '/api/admin/products';
    const method = mode === 'edit' ? 'PATCH' : 'POST';

    startTransition(async () => {
      const response = await fetch(endpoint, {
        method,
        body: formData,
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? 'No fue posible guardar el producto.');
        return;
      }

      setSuccess(
        mode === 'edit'
          ? 'Producto actualizado correctamente.'
          : 'Producto guardado correctamente en Amantra.'
      );

      if (mode === 'edit') {
        router.push('/admin_group/admin/products');
      } else {
        resetForm();
        router.refresh();
      }
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ color: '#FFFFF0' }}>
      <Paper
        elevation={0}
        sx={{ p: 4, bgcolor: '#111', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: 2 }}
      >
        <Typography variant="h5" sx={{ color: '#D4AF37', mb: 3, fontFamily: 'serif' }}>
          Información Básica
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          <Box>
            <TextField
              fullWidth
              label="Nombre del Producto"
              variant="outlined"
              sx={{ ...darkFieldSx, mb: 2 }}
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Descripción de Bienestar"
              sx={darkFieldSx}
              value={product.description}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              label="Precio Base (COP)"
              type="number"
              sx={darkFieldSx}
              value={product.basePrice}
              onChange={(e) => setProduct({ ...product, basePrice: e.target.value })}
            />
          </Box>
        </Box>

        <Box sx={{ mt: 3, maxWidth: { xs: '100%', md: '360px' } }}>
          <TextField
            select
            fullWidth
            label="Estado del producto"
            sx={darkFieldSx}
            value={product.status}
            onChange={(e) => setProduct({ ...product, status: e.target.value as ProductFormInitialData['status'] })}
          >
            <MenuItem value="DRAFT">Borrador</MenuItem>
            <MenuItem value="PUBLISHED">Publicado</MenuItem>
            <MenuItem value="UNPUBLISHED">Oculto</MenuItem>
          </TextField>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mt: 3 }}>
          <TextField
            select
            fullWidth
            label="Envío"
            sx={darkFieldSx}
            value={product.shippingMode}
            onChange={(e) =>
              setProduct((current) => ({
                ...current,
                shippingMode: e.target.value as ProductFormInitialData['shippingMode'],
                shippingCost: e.target.value === 'FREE' ? '0' : current.shippingCost,
              }))
            }
          >
            <MenuItem value="FIXED">Envío fijo</MenuItem>
            <MenuItem value="FREE">Envío gratis</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Valor del envío (COP)"
            type="number"
            sx={darkFieldSx}
            value={product.shippingMode === 'FREE' ? '0' : product.shippingCost}
            onChange={(e) => setProduct({ ...product, shippingCost: e.target.value })}
            disabled={product.shippingMode === 'FREE'}
            helperText={
              product.shippingMode === 'FREE'
                ? 'Este producto se mostrará con envío gratis.'
                : 'Este valor se sumará al precio final del producto.'
            }
            slotProps={{
              formHelperText: {
                sx: { color: '#8f846d' },
              },
            }}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Notas de envío"
            placeholder="Ejemplo: entrega nacional de 2 a 5 días hábiles."
            helperText="Úsalo para aclarar tiempos, cobertura o condiciones de entrega."
            sx={{
              ...darkFieldSx,
              '& .MuiFormHelperText-root': { color: '#8f846d' },
            }}
            value={product.shippingNotes}
            onChange={(e) => setProduct({ ...product, shippingNotes: e.target.value })}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.15fr 0.85fr' }, gap: 3, mt: 3 }}>
          <Box>
            <Typography sx={{ color: '#FFFFF0', mb: 1.2, fontWeight: 600 }}>
              Imágenes del producto
            </Typography>
            <Box
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              sx={{
                border: '1px dashed rgba(212, 175, 55, 0.35)',
                borderRadius: '18px',
                p: 3,
                textAlign: 'center',
                bgcolor: 'rgba(255,255,255,0.02)',
              }}
            >
              <UploadFileIcon sx={{ color: '#D4AF37', fontSize: 38, mb: 1 }} />
              <Typography sx={{ color: '#FFFFF0', mb: 0.5 }}>
                Arrastra imágenes aquí o selecciónalas manualmente
              </Typography>
              <Typography sx={{ color: '#8f846d', fontSize: '0.92rem', mb: 2 }}>
                JPG, PNG o WEBP. Máximo 5MB por archivo. Se optimizan automáticamente al guardar.
              </Typography>
              <Button component="label" sx={{ color: '#D4AF37', borderColor: '#D4AF37' }} variant="outlined">
                Seleccionar imágenes
                <input
                  hidden
                  multiple
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    if (event.target.files) {
                      addImageFiles(event.target.files);
                      event.target.value = '';
                    }
                  }}
                />
              </Button>
            </Box>

            {images.length > 0 ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: 2,
                  mt: 2,
                }}
              >
                {images.map((image, index) => (
                  <Box
                    key={`${image.url}-${index}`}
                    sx={{
                      position: 'relative',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1px solid rgba(212,175,55,0.15)',
                      bgcolor: '#1a1a1a',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.kind === 'existing' ? resolveBackendAssetUrl(image.url) : image.url}
                      alt={`product-${index}`}
                      style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }}
                    />
                    <IconButton
                      onClick={() => removeImage(index)}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.55)',
                        color: '#fff',
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            ) : null}
          </Box>

          <Autocomplete
            multiple
            freeSolo
            options={tagOptions}
            value={selectedTags}
            inputValue={tagInput}
            onInputChange={(_, value) => {
              setTagInput(value);
              if (!value.trim()) {
                setTagOptions([]);
              }
            }}
            onChange={(_, value) => {
              const cleanValues = value.map((tag) => String(tag).trim()).filter(Boolean);
              setSelectedTags([...new Set(cleanValues)]);
            }}
            onBlur={() => {
              if (!tagInput.trim()) {
                return;
              }

              setSelectedTags((current) => buildResolvedTags(current, tagInput));
              setTagInput('');
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                label="Etiquetas / búsqueda"
                placeholder="incienso, india, regalo"
                helperText="Busca con autocompletado. Si no existe, se crea al guardar."
                sx={{
                  ...darkFieldSx,
                  '& .MuiFormHelperText-root': { color: '#8f846d' },
                }}
              />
            )}
            sx={{
              '& .MuiOutlinedInput-root': {
                ...darkFieldSx['& .MuiOutlinedInput-root'],
                alignItems: 'flex-start',
                minHeight: '140px',
              },
              '& .MuiAutocomplete-input': {
                color: '#FFFFF0 !important',
              },
              '& .MuiAutocomplete-tag': {
                backgroundColor: 'rgba(212, 175, 55, 0.14)',
                color: '#D4AF37',
              },
              '& .MuiChip-deleteIcon': {
                color: '#8f846d',
              },
            }}
          />
        </Box>

        <Divider sx={{ my: 4, bgcolor: 'rgba(212, 175, 55, 0.2)' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#D4AF37', fontFamily: 'serif' }}>
            Variantes (Tallas / Colores)
          </Typography>
          <Button onClick={addVariant} sx={{ color: '#D4AF37' }}>
            Agregar Variante
          </Button>
        </Box>

        {variants.map((variant, index) => (
          <Box
            key={index}
            sx={{
              mb: 2,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(6, minmax(0, 1fr)) 64px' },
              gap: 2,
              alignItems: 'center',
            }}
          >
            <Box>
              <TextField
                size="small"
                label="SKU"
                sx={darkFieldSx}
                value={variant.sku}
                onChange={(e) => updateVariant(index, 'sku', e.target.value)}
              />
            </Box>
            <Box>
              <TextField
                size="small"
                label="Talla"
                sx={darkFieldSx}
                value={variant.size}
                onChange={(e) => updateVariant(index, 'size', e.target.value)}
              />
            </Box>
            <Box>
              <TextField
                size="small"
                label="Color"
                sx={darkFieldSx}
                value={variant.color}
                onChange={(e) => updateVariant(index, 'color', e.target.value)}
              />
            </Box>
            <Box>
              <TextField
                size="small"
                label="Material / Acabado"
                sx={darkFieldSx}
                value={variant.stoneType}
                onChange={(e) => updateVariant(index, 'stoneType', e.target.value)}
              />
            </Box>
            <Box>
              <TextField
                size="small"
                label="Stock"
                type="number"
                sx={darkFieldSx}
                value={variant.stock}
                onChange={(e) => updateVariant(index, 'stock', Number(e.target.value))}
              />
            </Box>
            <Box>
              <TextField
                size="small"
                label="Precio Var. (Opcional)"
                sx={darkFieldSx}
                value={variant.price}
                onChange={(e) => updateVariant(index, 'price', e.target.value)}
              />
            </Box>
            <Box>
              <IconButton onClick={() => removeVariant(index)} sx={{ color: '#ff4444' }}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        ))}

        {error ? <Typography sx={{ color: '#ff8f80', mt: 2 }}>{error}</Typography> : null}
        {success ? <Typography sx={{ color: '#a8e6a1', mt: 2 }}>{success}</Typography> : null}

        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isPending}
            sx={{ bgcolor: '#D4AF37', color: '#000', fontWeight: 'bold', '&:hover': { bgcolor: '#C29B30' } }}
          >
            {isPending
              ? mode === 'edit'
                ? 'Actualizando producto...'
                : 'Guardando producto...'
              : mode === 'edit'
                ? 'Actualizar producto'
                : 'Guardar Producto en AMANTRA'}
          </Button>

          {mode === 'edit' ? (
            <Button
              type="button"
              variant="outlined"
              onClick={() => router.push('/admin_group/admin/products')}
              sx={{ borderColor: '#D4AF37', color: '#D4AF37' }}
            >
              Cancelar
            </Button>
          ) : null}
        </Box>
      </Paper>
    </Box>
  );
}
