'use client';

import { useMemo, useState } from 'react';
import { Box, Chip, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography } from '@mui/material';
import NewsletterSubscriberActions from '@/components/admin/NewsletterSubscriberActions';

type NewsletterSubscriberRow = {
  id: string;
  email: string;
  name: string | null;
  sourcePage: string | null;
  isActive: boolean;
  createdAt: string;
};

interface NewsletterSubscribersTableProps {
  subscribers: NewsletterSubscriberRow[];
}

export default function NewsletterSubscribersTable({ subscribers }: NewsletterSubscribersTableProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredSubscribers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return subscribers.filter((subscriber) => {
      const matchesQuery = normalizedQuery
        ? [subscriber.email, subscriber.name ?? '', subscriber.sourcePage ?? ''].join(' ').toLowerCase().includes(normalizedQuery)
        : true;
      const matchesStatus = status === 'ALL' ? true : status === 'ACTIVE' ? subscriber.isActive : !subscriber.isActive;

      return matchesQuery && matchesStatus;
    });
  }, [query, status, subscribers]);

  const paginatedSubscribers = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredSubscribers.slice(start, start + rowsPerPage);
  }, [filteredSubscribers, page, rowsPerPage]);

  return (
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
          gridTemplateColumns: { xs: '1fr', md: '1.3fr 0.5fr' },
          gap: 2,
        }}
      >
        <TextField
          fullWidth
          label="Buscar suscriptor"
          placeholder="Correo, nombre o página origen"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
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
        />

        <TextField
          select
          fullWidth
          label="Estado"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE');
            setPage(0);
          }}
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
          <MenuItem value="ACTIVE">Activos</MenuItem>
          <MenuItem value="INACTIVE">Inactivos</MenuItem>
        </TextField>
      </Box>

      {subscribers.length === 0 ? (
        <Box sx={{ px: 3, pb: 4 }}>
          <Box
            sx={{
              border: '1px solid rgba(212, 175, 55, 0.16)',
              borderRadius: '20px',
              p: 4,
              color: '#BDBDBD',
              textAlign: 'center',
            }}
          >
            Aún no hay interesados en newsletter registrados.
          </Box>
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Contacto</TableCell>
                  <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Origen</TableCell>
                  <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Estado</TableCell>
                  <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Fecha</TableCell>
                  <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id} hover sx={{ '& td': { borderColor: 'rgba(212,175,55,0.08)' } }}>
                    <TableCell sx={{ color: '#FFFFF0' }}>
                      <Typography sx={{ color: '#FFFFF0', fontWeight: 700 }}>
                        {subscriber.name?.trim() || 'Interesado newsletter'}
                      </Typography>
                      <Typography sx={{ color: '#8f846d', fontSize: '0.9rem', mt: 0.4 }}>
                        {subscriber.email}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ color: '#D7D0C3' }}>
                      {subscriber.sourcePage ? `/${subscriber.sourcePage}` : 'Sin referencia'}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={subscriber.isActive ? 'Activo' : 'Inactivo'}
                        size="small"
                        sx={{
                          bgcolor: subscriber.isActive ? 'rgba(112,255,140,0.12)' : 'rgba(255,120,120,0.12)',
                          color: subscriber.isActive ? '#9BD4A4' : '#FFB4A8',
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ color: '#D7D0C3' }}>
                      {new Date(subscriber.createdAt).toLocaleDateString('es-CO')}
                    </TableCell>

                    <TableCell>
                      <NewsletterSubscriberActions subscriberId={subscriber.id} isActive={subscriber.isActive} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredSubscribers.length}
            page={page}
            onPageChange={(_event, nextPage) => setPage(nextPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50]}
            labelRowsPerPage="Filas por página"
            sx={{
              color: '#D7D0C3',
              borderTop: '1px solid rgba(212,175,55,0.08)',
              '.MuiTablePagination-selectIcon': { color: '#D7D0C3' },
              '.MuiSelect-select': { color: '#D7D0C3' },
              '.MuiSvgIcon-root': { color: '#D7D0C3' },
            }}
          />
        </>
      )}
    </Paper>
  );
}

