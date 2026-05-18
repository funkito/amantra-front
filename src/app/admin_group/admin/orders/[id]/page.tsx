import { notFound } from 'next/navigation';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import AdminShell from '@/components/admin/AdminShell';
import OrderStatusActions from '@/components/admin/OrderStatusActions';
import { requireProductManager } from '@/lib/auth/guards';
import { orderStatusLabel, paymentStatusLabel } from '@/lib/orders';
import { prisma } from '@/lib/prisma';

const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export default async function AdminOrderDetailPage(props: PageProps<'/admin_group/admin/orders/[id]'>) {
  const session = await requireProductManager();
  const { id } = await props.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <AdminShell
      title="Detalle de orden"
      description="Consulta la trazabilidad de una compra y ajusta su estado operativo sin salir del panel."
      email={session.email}
      role={session.role}
    >
      <AdminBreadcrumbs
        items={[
          { label: 'Dashboard', href: '/admin_group' },
          { label: 'Órdenes', href: '/admin_group/admin/orders' },
          { label: `Orden ${order.id.slice(0, 8)}` },
        ]}
      />

      <Stack spacing={3}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.2, md: 2.8 },
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
              <Typography sx={{ color: '#D4AF37', fontFamily: 'var(--font-display)', fontSize: '2rem' }}>
                Orden #{order.id.slice(0, 8)}
              </Typography>
              <Typography sx={{ color: '#BDBDBD', mt: 1, lineHeight: 1.7 }}>
                Registrada el {new Date(order.createdAt).toLocaleString('es-CO')}
              </Typography>
            </Box>

            <Chip
              label={orderStatusLabel(order.status)}
              sx={{
                bgcolor: 'rgba(212,175,55,0.12)',
                color: '#D4AF37',
                fontWeight: 700,
              }}
            />
          </Stack>
        </Paper>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', xl: '1.2fr 0.8fr' },
            gap: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.2, md: 2.8 },
              borderRadius: '24px',
              bgcolor: '#111',
              border: '1px solid rgba(212,175,55,0.14)',
            }}
          >
            <Typography sx={{ color: '#D4AF37', fontFamily: 'var(--font-display)', fontSize: '1.8rem', mb: 2 }}>
              Resumen
            </Typography>

            <Stack spacing={1.5}>
              <Typography sx={{ color: '#FFFFF0' }}>
                <strong>Cliente:</strong> {order.user.name?.trim() || 'Cliente Amantra'}
              </Typography>
              <Typography sx={{ color: '#FFFFF0' }}>
                <strong>Correo:</strong> {order.user.email}
              </Typography>
              <Typography sx={{ color: '#FFFFF0' }}>
                <strong>Total:</strong> {currency.format(order.totalAmount)}
              </Typography>
              <Typography sx={{ color: '#FFFFF0' }}>
                <strong>Método de pago:</strong> {order.paymentMethod ?? 'Sin definir'}
              </Typography>
              <Typography sx={{ color: '#FFFFF0' }}>
                <strong>Estado actual:</strong> {orderStatusLabel(order.status)}
              </Typography>
              <Typography sx={{ color: '#FFFFF0' }}>
                <strong>Estado del pago:</strong> {paymentStatusLabel(order.paymentStatus)}
              </Typography>
              <Typography sx={{ color: '#FFFFF0' }}>
                <strong>Flujo:</strong> {order.paymentFlow === 'DIRECT_API' ? 'API directa' : order.paymentFlow === 'PAYMENT_LINK' ? 'Link externo' : 'Sin definir'}
              </Typography>
              <Typography sx={{ color: '#FFFFF0' }}>
                <strong>Referencia:</strong> {order.paymentReference ?? 'Sin referencia'}
              </Typography>
              <Typography sx={{ color: '#FFFFF0' }}>
                <strong>Link de pago:</strong> {order.paymentLinkUrl ?? 'No aplica'}
              </Typography>
              <Typography sx={{ color: '#FFFFF0' }}>
                <strong>Transacción Bold:</strong> {order.paymentTransactionId ?? 'Aún no disponible'}
              </Typography>
              <Typography sx={{ color: '#FFFFF0' }}>
                <strong>Último webhook:</strong> {order.lastWebhookAt ? new Date(order.lastWebhookAt).toLocaleString('es-CO') : 'Sin webhook recibido'}
              </Typography>
              <Typography sx={{ color: '#FFFFF0' }}>
                <strong>Última actualización:</strong> {new Date(order.updatedAt).toLocaleString('es-CO')}
              </Typography>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.2, md: 2.8 },
              borderRadius: '24px',
              bgcolor: '#111',
              border: '1px solid rgba(212,175,55,0.14)',
            }}
          >
            <Typography sx={{ color: '#D4AF37', fontFamily: 'var(--font-display)', fontSize: '1.8rem', mb: 2 }}>
              Gestión rápida
            </Typography>
            <Typography sx={{ color: '#BDBDBD', mb: 2, lineHeight: 1.7 }}>
              Cambia el estado operativo de la orden según el avance del pago o la entrega.
            </Typography>

            <OrderStatusActions orderId={order.id} currentStatus={order.status} />
          </Paper>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.2, md: 2.8 },
            borderRadius: '24px',
            bgcolor: '#111',
            border: '1px solid rgba(212,175,55,0.14)',
          }}
        >
          <Typography sx={{ color: '#D4AF37', fontFamily: 'var(--font-display)', fontSize: '1.8rem', mb: 2 }}>
            Líneas de pedido
          </Typography>

          {order.items.length === 0 ? (
            <Typography sx={{ color: '#BDBDBD', lineHeight: 1.7 }}>
              Esta orden aún no tiene líneas históricas guardadas. Las nuevas compras ya empezarán a registrarlas.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {order.items.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.8fr' },
                    gap: 1.5,
                    p: 1.8,
                    borderRadius: '18px',
                    border: '1px solid rgba(212,175,55,0.1)',
                    bgcolor: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <Box>
                    <Typography sx={{ color: '#FFFFF0', fontWeight: 700 }}>{item.productName}</Typography>
                    <Typography sx={{ color: '#BDBDBD', mt: 0.4 }}>
                      Cantidad: {item.quantity}
                    </Typography>
                    {item.variantLabel ? (
                      <Typography sx={{ color: '#BDBDBD', mt: 0.4 }}>
                        Variante: {item.variantLabel}
                      </Typography>
                    ) : null}
                  </Box>

                  <Box>
                    <Typography sx={{ color: '#FFFFF0' }}>
                      <strong>Unitario:</strong> {currency.format(item.unitPrice)}
                    </Typography>
                    <Typography sx={{ color: '#FFFFF0', mt: 0.4 }}>
                      <strong>Envío:</strong> {item.shippingCost > 0 ? currency.format(item.shippingCost) : 'Gratis'}
                    </Typography>
                    <Typography sx={{ color: '#D4AF37', mt: 0.4, fontWeight: 700 }}>
                      Total línea: {currency.format(item.lineTotal)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>
    </AdminShell>
  );
}
