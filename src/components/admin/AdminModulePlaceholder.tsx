'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

interface AdminModulePlaceholderProps {
  moduleLabel: string;
  singularLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  statusOptions: string[];
}

export default function AdminModulePlaceholder({
  moduleLabel,
  singularLabel,
  emptyTitle,
  emptyDescription,
  statusOptions,
}: AdminModulePlaceholderProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          borderRadius: '24px',
          bgcolor: '#111',
          border: '1px solid rgba(212,175,55,0.14)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}
        >
          <Box>
            <Typography sx={{ color: '#D4AF37', fontFamily: 'var(--font-display)', fontSize: '1.8rem' }}>
              {moduleLabel}
            </Typography>
            <Typography sx={{ color: '#BDBDBD', mt: 0.8, lineHeight: 1.7 }}>
              Vista preparada para búsqueda, filtros, paginación y gestión rápida desde móvil o desktop.
            </Typography>
          </Box>

          <Button
            variant="contained"
            sx={{
              borderRadius: '999px',
              bgcolor: '#D4AF37',
              color: '#140e0a',
              fontWeight: 700,
              '&:hover': { bgcolor: '#C29B30' },
            }}
          >
            Nuevo {singularLabel}
          </Button>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: '24px',
          bgcolor: '#111',
          border: '1px solid rgba(212,175,55,0.14)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            p: { xs: 2, md: 3 },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.3fr 0.7fr' },
            gap: 2,
          }}
        >
          <TextField
            label={`Buscar ${singularLabel}`}
            placeholder={`Busca por nombre, estado o palabra clave`}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
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
            label="Filtro"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
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
            {statusOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.08)' }}>{singularLabel}</TableCell>
              <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.08)' }}>Estado</TableCell>
              <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.08)' }}>Fecha</TableCell>
              <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.08)' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={4} sx={{ borderColor: 'rgba(212,175,55,0.08)' }}>
                <Box
                  sx={{
                    py: 6,
                    display: 'grid',
                    placeItems: 'center',
                    textAlign: 'center',
                    gap: 1.5,
                  }}
                >
                  <Chip label="Módulo listo para crecer" sx={{ bgcolor: 'rgba(212,175,55,0.12)', color: '#D4AF37' }} />
                  <Typography sx={{ color: '#FFFFF0', fontFamily: 'var(--font-display)', fontSize: '2rem' }}>
                    {emptyTitle}
                  </Typography>
                  <Typography sx={{ color: '#BDBDBD', maxWidth: '620px', lineHeight: 1.7 }}>
                    {emptyDescription}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={0}
          page={page}
          onPageChange={(_event, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
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
    </Stack>
  );
}
