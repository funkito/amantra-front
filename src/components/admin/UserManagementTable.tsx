'use client';

import { useMemo, useState } from 'react';
import { Box, Chip, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography } from '@mui/material';
import UserActions from '@/components/admin/UserActions';

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: 'SUPERADMIN' | 'EDITOR' | 'CLIENTE' | 'VENDEDOR';
  isActive: boolean;
  createdAt: string;
};

interface UserManagementTableProps {
  users: UserRow[];
  currentUserId: string;
}

function getRoleLabel(role: UserRow['role']) {
  if (role === 'SUPERADMIN') return 'admin';
  if (role === 'EDITOR') return 'editor';
  return 'customer';
}

export default function UserManagementTable({ users, currentUserId }: UserManagementTableProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [role, setRole] = useState<'ALL' | 'SUPERADMIN' | 'EDITOR' | 'CLIENTE'>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesQuery = normalizedQuery
        ? [user.name ?? '', user.email, getRoleLabel(user.role)].join(' ').toLowerCase().includes(normalizedQuery)
        : true;
      const matchesStatus =
        status === 'ALL' ? true : status === 'ACTIVE' ? user.isActive : !user.isActive;
      const matchesRole =
        role === 'ALL'
          ? true
          : role === 'CLIENTE'
            ? user.role === 'CLIENTE' || user.role === 'VENDEDOR'
            : user.role === role;

      return matchesQuery && matchesStatus && matchesRole;
    });
  }, [users, query, status, role]);

  const paginatedUsers = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

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
          gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.4fr 0.4fr' },
          gap: 2,
        }}
      >
        <TextField
          fullWidth
          label="Buscar usuario"
          placeholder="Nombre, correo o rol"
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
          <MenuItem value="INACTIVE">Suspendidos</MenuItem>
        </TextField>

        <TextField
          select
          fullWidth
          label="Rol"
          value={role}
          onChange={(event) => {
            setRole(event.target.value as 'ALL' | 'SUPERADMIN' | 'EDITOR' | 'CLIENTE');
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
          <MenuItem value="SUPERADMIN">admin</MenuItem>
          <MenuItem value="EDITOR">editor</MenuItem>
          <MenuItem value="CLIENTE">customer</MenuItem>
        </TextField>
      </Box>

      {users.length === 0 ? (
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
            Aún no hay usuarios registrados.
          </Box>
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Usuario</TableCell>
                  <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Rol</TableCell>
                  <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Estado</TableCell>
                  <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Fecha</TableCell>
                  <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id} hover sx={{ '& td': { borderColor: 'rgba(212,175,55,0.08)' } }}>
                    <TableCell sx={{ color: '#FFFFF0' }}>
                      <Typography sx={{ color: '#FFFFF0', fontWeight: 700 }}>
                        {user.name?.trim() || 'Sin nombre'}
                      </Typography>
                      <Typography sx={{ color: '#8f846d', fontSize: '0.9rem', mt: 0.4 }}>
                        {user.email}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={getRoleLabel(user.role)}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(212,175,55,0.12)',
                          color: '#D4AF37',
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Activo' : 'Suspendido'}
                        size="small"
                        sx={{
                          bgcolor: user.isActive ? 'rgba(112,255,140,0.12)' : 'rgba(255,120,120,0.12)',
                          color: user.isActive ? '#9BD4A4' : '#FFB4A8',
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ color: '#D7D0C3' }}>
                      {new Date(user.createdAt).toLocaleDateString('es-CO')}
                    </TableCell>

                    <TableCell>
                      <UserActions userId={user.id} currentActive={user.isActive} currentUserId={currentUserId} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredUsers.length}
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
        </>
      )}
    </Paper>
  );
}
