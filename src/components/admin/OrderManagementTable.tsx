'use client';

import { useMemo, useState } from 'react';
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
import OrderStatusActions from '@/components/admin/OrderStatusActions';
import { orderStatusLabel, paymentStatusLabel } from '@/lib/orders';
import type { PaymentFlow, PaymentStatus } from '@prisma/client';

type OrderRow = {
  id: string;
  customerName: string | null;
  customerEmail: string;
  totalAmount: number;
  status: string;
  paymentStatus: PaymentStatus;
  paymentFlow: PaymentFlow | null;
  paymentMethod: string | null;
  paymentReference: string | null;
  itemCount: number;
  createdAt: string;
};

interface OrderManagementTableProps {
  orders: OrderRow[];
}

const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

function statusChipColor(status: string) {
  if (status === 'PAID' || status === 'COMPLETED') return { color: '#D4AF37', bg: 'rgba(212,175,55,0.12)' };
  if (status === 'SHIPPED') return { color: '#9BD4A4', bg: 'rgba(112,255,140,0.12)' };
  if (status === 'CANCELLED') return { color: '#FFB4A8', bg: 'rgba(255,120,120,0.12)' };
  if (status === 'PREPARING') return { color: '#8FD6FF', bg: 'rgba(100,180,255,0.12)' };
  return { color: '#D7D0C3', bg: 'rgba(255,255,255,0.05)' };
}

function paymentChipColor(status: PaymentStatus) {
  if (status === 'APPROVED') return { color: '#9BD4A4', bg: 'rgba(112,255,140,0.12)' };
  if (status === 'PROCESSING') return { color: '#8FD6FF', bg: 'rgba(100,180,255,0.12)' };
  if (['REJECTED', 'FAILED', 'VOIDED', 'EXPIRED'].includes(status)) return { color: '#FFB4A8', bg: 'rgba(255,120,120,0.12)' };
  return { color: '#D4AF37', bg: 'rgba(212,175,55,0.12)' };
}

function paymentFlowLabel(flow: PaymentFlow | null) {
  if (flow === 'DIRECT_API') return 'API directa';
  if (flow === 'PAYMENT_LINK') return 'Link externo';
  return 'Sin definir';
}

export default function OrderManagementTable({ orders }: OrderManagementTableProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      const normalizedStatus = order.status === 'COMPLETED' ? 'PAID' : order.status;
      const matchesStatus = status === 'ALL' ? true : normalizedStatus === status;
      const searchableText = [
        order.id,
        order.customerEmail,
        order.customerName ?? '',
        order.paymentMethod ?? '',
        order.paymentReference ?? '',
        order.paymentStatus,
      ]
        .join(' ')
        .toLowerCase();

      const matchesQuery = normalizedQuery ? searchableText.includes(normalizedQuery) : true;

      return matchesStatus && matchesQuery;
    });
  }, [orders, query, status]);

  const paginatedOrders = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredOrders.slice(start, start + rowsPerPage);
  }, [filteredOrders, page, rowsPerPage]);

  return (
    <section>
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
            label="Buscar orden"
            placeholder="ID, cliente o correo"
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
            <MenuItem value="ALL">Todos</MenuItem>
            <MenuItem value="PENDING">Pendiente</MenuItem>
            <MenuItem value="PAID">Pagada</MenuItem>
            <MenuItem value="PREPARING">En preparación</MenuItem>
            <MenuItem value="SHIPPED">Enviada</MenuItem>
            <MenuItem value="CANCELLED">Cancelada</MenuItem>
          </TextField>
        </Box>

        {orders.length === 0 ? (
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
              Aún no hay órdenes registradas. Cuando entren compras desde checkout, aparecerán aquí.
            </Box>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Orden / Cliente</TableCell>
                    <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Estado</TableCell>
                    <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Pago</TableCell>
                    <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Fecha</TableCell>
                    <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedOrders.map((order) => {
                    const chip = statusChipColor(order.status);

                    return (
                      <TableRow key={order.id} hover sx={{ '& td': { borderColor: 'rgba(212,175,55,0.08)' } }}>
                        <TableCell sx={{ color: '#FFFFF0' }}>
                          <Typography sx={{ color: '#FFFFF0', fontWeight: 700 }}>#{order.id.slice(0, 8)}</Typography>
                          <Typography sx={{ color: '#D7D0C3', mt: 0.4 }}>
                            {order.customerName?.trim() || 'Cliente Amantra'}
                          </Typography>
                          <Typography sx={{ color: '#8f846d', fontSize: '0.88rem', mt: 0.3 }}>
                            {order.customerEmail}
                          </Typography>
                          <Typography sx={{ color: '#8f846d', fontSize: '0.82rem', mt: 0.3 }}>
                            {order.itemCount} línea{order.itemCount === 1 ? '' : 's'} de pedido
                          </Typography>
                          {order.paymentReference ? (
                            <Typography sx={{ color: '#8f846d', fontSize: '0.82rem', mt: 0.3 }}>
                              Ref: {order.paymentReference}
                            </Typography>
                          ) : null}
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={orderStatusLabel(order.status)}
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
                            {currency.format(order.totalAmount)}
                          </Typography>
                          <Typography sx={{ color: '#BDBDBD', fontSize: '0.9rem', mt: 0.5 }}>
                            {order.paymentMethod ?? 'Sin definir'}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 1 }}>
                            <Chip
                              size="small"
                              label={paymentStatusLabel(order.paymentStatus)}
                              sx={{
                                color: paymentChipColor(order.paymentStatus).color,
                                backgroundColor: paymentChipColor(order.paymentStatus).bg,
                              }}
                            />
                            <Chip
                              size="small"
                              label={paymentFlowLabel(order.paymentFlow)}
                              sx={{
                                color: '#D7D0C3',
                                backgroundColor: 'rgba(255,255,255,0.04)',
                              }}
                            />
                          </Box>
                        </TableCell>

                        <TableCell sx={{ color: '#D7D0C3' }}>
                          {new Date(order.createdAt).toLocaleDateString('es-CO')}
                        </TableCell>

                        <TableCell>
                          <OrderStatusActions orderId={order.id} currentStatus={order.status} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredOrders.length}
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
    </section>
  );
}
