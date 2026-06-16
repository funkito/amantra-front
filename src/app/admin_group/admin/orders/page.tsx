import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import AdminShell from '@/components/admin/AdminShell';
import OrderManagementTable from '@/components/admin/OrderManagementTable';
import { requireProductManager } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';

export default async function AdminOrdersPage() {
  const session = await requireProductManager();
  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: true,
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  return (
    <AdminShell
      title="Órdenes y seguimiento"
      description="Centraliza pagos, estados y trazabilidad de pedidos con una vista clara para operación diaria."
      email={session.email}
      role={session.role}
    >
      <AdminBreadcrumbs
        items={[
          { label: 'Dashboard', href: '/admin_group' },
          { label: 'Órdenes', href: '/admin_group/admin/orders' },
          { label: 'Gestión de pedidos' },
        ]}
      />

      <OrderManagementTable
        orders={orders.map((order) => ({
          id: order.id,
          customerName: order.user.name,
          customerEmail: order.user.email,
          totalAmount: order.totalAmount,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentFlow: order.paymentFlow,
          paymentMethod: order.paymentMethod,
          paymentReference: order.paymentReference,
          itemCount: order._count.items,
          createdAt: order.createdAt.toISOString(),
        }))}
      />
    </AdminShell>
  );
}
