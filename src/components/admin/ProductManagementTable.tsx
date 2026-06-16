'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Box,
  Chip,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import ProductActions from '@/components/admin/ProductActions';
import { resolveBackendAssetUrl } from '@/lib/backend-api';

type ProductRow = {
  id: string;
  name: string;
  description: string;
  status: 'PUBLISHED' | 'DRAFT' | 'UNPUBLISHED';
  basePrice: number;
  shippingMode: 'FIXED' | 'FREE';
  shippingCost: number;
  images: string[];
  variantCount: number;
  tagNames: string[];
  createdAt: string;
};

interface ProductManagementTableProps {
  products: ProductRow[];
}

const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

function statusLabel(status: ProductRow['status']) {
  if (status === 'PUBLISHED') return 'Publicado';
  if (status === 'UNPUBLISHED') return 'Oculto';
  return 'Borrador';
}

function statusChipColor(status: ProductRow['status']) {
  if (status === 'PUBLISHED') return { color: '#D4AF37', bg: 'rgba(212,175,55,0.12)' };
  if (status === 'UNPUBLISHED') return { color: '#FFB4A8', bg: 'rgba(255,120,120,0.12)' };
  return { color: '#D7D0C3', bg: 'rgba(255,255,255,0.05)' };
}

function shippingLabel(mode: ProductRow['shippingMode'], cost: number) {
  if (mode === 'FREE') {
    return 'Envío gratis';
  }

  return `Envío fijo ${currency.format(cost)}`;
}

export default function ProductManagementTable({ products }: ProductManagementTableProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'ALL' | ProductRow['status']>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesStatus = status === 'ALL' ? true : product.status === status;
      const searchableText = [
        product.name,
        product.description,
        product.tagNames.join(' '),
        shippingLabel(product.shippingMode, product.shippingCost),
      ]
        .join(' ')
        .toLowerCase();

      const matchesQuery = normalizedQuery ? searchableText.includes(normalizedQuery) : true;

      return matchesStatus && matchesQuery;
    });
  }, [products, query, status]);

  const paginatedProducts = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredProducts.slice(start, start + rowsPerPage);
  }, [filteredProducts, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, nextPage: number) => {
    setPage(nextPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(0);
  };

  const handleStatusChange = (value: 'ALL' | ProductRow['status']) => {
    setStatus(value);
    setPage(0);
  };

  return (
    <section style={{ marginTop: '56px' }}>
      <header style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#D4AF37', fontFamily: 'serif', fontSize: '2rem', marginBottom: '8px' }}>
          Gestión de productos
        </h2>
        <p style={{ color: '#BDBDBD', margin: 0 }}>
          Busca, filtra y administra el catálogo sin salir del panel.
        </p>
      </header>

      {products.length === 0 ? (
        <div
          style={{
            border: '1px solid rgba(212, 175, 55, 0.16)',
            borderRadius: '20px',
            padding: '24px',
            backgroundColor: '#111',
            color: '#BDBDBD',
          }}
        >
          Aún no hay productos creados. El primero que guardes aparecerá aquí.
        </div>
      ) : (
        <Paper
          elevation={0}
          sx={{
            overflow: 'hidden',
            borderRadius: '24px',
            bgcolor: '#111',
            border: '1px solid rgba(212, 175, 55, 0.16)',
          }}
        >
          <Box
            sx={{
              p: 3,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.4fr 0.6fr' },
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Buscar producto"
              placeholder="Nombre, descripción, etiqueta o envío"
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#FFFFF0',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  '& fieldset': { borderColor: 'rgba(212,175,55,0.12)' },
                  '&:hover fieldset': { borderColor: 'rgba(212,175,55,0.35)' },
                  '&.Mui-focused fieldset': { borderColor: '#D4AF37' },
                },
                '& .MuiInputLabel-root': { color: '#BDBDBD' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#D4AF37' },
                '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,240,0.45)', opacity: 1 },
              }}
            />

            <TextField
              select
              fullWidth
              label="Estado"
              value={status}
              onChange={(event) => handleStatusChange(event.target.value as 'ALL' | ProductRow['status'])}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#FFFFF0',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  '& fieldset': { borderColor: 'rgba(212,175,55,0.12)' },
                  '&:hover fieldset': { borderColor: 'rgba(212,175,55,0.35)' },
                  '&.Mui-focused fieldset': { borderColor: '#D4AF37' },
                },
                '& .MuiInputLabel-root': { color: '#BDBDBD' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#D4AF37' },
              }}
            >
              <MenuItem value="ALL">Todos</MenuItem>
              <MenuItem value="PUBLISHED">Publicado</MenuItem>
              <MenuItem value="DRAFT">Borrador</MenuItem>
              <MenuItem value="UNPUBLISHED">Oculto</MenuItem>
            </TextField>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Producto</TableCell>
                  <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Estado</TableCell>
                  <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Precio / Envío</TableCell>
                  <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Fecha</TableCell>
                  <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProducts.map((product) => {
                  const chip = statusChipColor(product.status);

                  return (
                    <TableRow key={product.id} hover sx={{ '& td': { borderColor: 'rgba(212,175,55,0.08)' } }}>
                      <TableCell sx={{ color: '#FFFFF0' }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                          <Box
                            sx={{
                              position: 'relative',
                              width: 72,
                              height: 72,
                              borderRadius: '16px',
                              overflow: 'hidden',
                              flexShrink: 0,
                              bgcolor: product.images[0]
                                ? '#1a1a1a'
                                : 'linear-gradient(135deg, #5b3a0c 0%, #1a1208 100%)',
                            }}
                          >
                            {product.images[0] ? (
                              <Image
                                src={resolveBackendAssetUrl(product.images[0])}
                                alt={product.name}
                                fill
                                sizes="72px"
                                style={{ objectFit: 'cover' }}
                              />
                            ) : null}
                          </Box>

                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ color: '#FFFFF0', fontWeight: 700 }}>{product.name}</Typography>
                            <Typography
                              sx={{
                                color: '#BDBDBD',
                                fontSize: '0.92rem',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                mt: 0.5,
                              }}
                            >
                              {product.description}
                            </Typography>
                            <Typography sx={{ color: '#8f846d', fontSize: '0.82rem', mt: 1 }}>
                              {product.variantCount} variantes · {product.images.length} imágenes
                            </Typography>
                            {product.tagNames.length > 0 ? (
                              <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mt: 1 }}>
                                {product.tagNames.slice(0, 4).map((tag) => (
                                  <Chip
                                    key={tag}
                                    label={tag}
                                    size="small"
                                    sx={{
                                      color: '#D7D0C3',
                                      border: '1px solid rgba(212,175,55,0.12)',
                                      backgroundColor: 'transparent',
                                    }}
                                  />
                                ))}
                              </Box>
                            ) : null}
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={statusLabel(product.status)}
                          size="small"
                          sx={{
                            color: chip.color,
                            backgroundColor: chip.bg,
                            borderRadius: '999px',
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ color: '#D7D0C3' }}>
                        <Typography sx={{ color: '#FFFFF0', fontWeight: 700 }}>
                          {currency.format(product.basePrice)}
                        </Typography>
                        <Typography sx={{ color: '#BDBDBD', fontSize: '0.9rem', mt: 0.5 }}>
                          {shippingLabel(product.shippingMode, product.shippingCost)}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ color: '#D7D0C3' }}>
                        {new Date(product.createdAt).toLocaleDateString('es-CO')}
                      </TableCell>

                      <TableCell>
                        <ProductActions productId={product.id} currentStatus={product.status} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredProducts.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 20]}
            labelRowsPerPage="Filas por página"
            sx={{
              color: '#D7D0C3',
              borderTop: '1px solid rgba(212,175,55,0.08)',
              '.MuiTablePagination-selectIcon': { color: '#D7D0C3' },
              '.MuiSelect-select': { color: '#D7D0C3' },
              '.MuiSvgIcon-root': { color: '#D7D0C3' },
            }}
          />
        </Paper>
      )}
    </section>
  );
}
