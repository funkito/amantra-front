import { notFound } from 'next/navigation';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import AdminShell from '@/components/admin/AdminShell';
import ProductForm from '@/components/admin/ProductForm';
import { requireProductManager } from '@/lib/auth/guards';
import { getAdminProductFromBackend } from '@/lib/admin/backend-products';
import { getBackendApiUrl } from '@/lib/backend-api';
import { prisma } from '@/lib/prisma';

export default async function AdminEditProductPage(props: PageProps<'/admin_group/admin/products/[id]'>) {
  const session = await requireProductManager();
  const { id } = await props.params;

  if (getBackendApiUrl()) {
    const product = await getAdminProductFromBackend(id);

    if (!product) {
      notFound();
    }

    return (
      <AdminShell
        title="Edición de producto"
        description="Ajusta el contenido, el estado y la configuración comercial sin salir del panel administrativo."
        email={session.email}
        role={session.role}
      >
        <AdminBreadcrumbs
          items={[
            { label: 'Dashboard', href: '/admin_group' },
            { label: 'Productos', href: '/admin_group/admin/products' },
            { label: 'Editar producto' },
          ]}
        />

        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#D4AF37', fontFamily: 'serif', fontSize: '2rem', marginBottom: '10px' }}>
            Editar Producto
          </h2>
          <p style={{ color: '#BDBDBD', margin: 0 }}>
            Trabaja el detalle del producto sin perder el contexto del catálogo.
          </p>
        </div>

        <ProductForm mode="edit" productId={product.id} initialData={product} />
      </AdminShell>
    );
  }

  const product = await prisma.product.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      tags: true,
      variants: true,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <AdminShell
      title="Edición de producto"
      description="Ajusta el contenido, el estado y la configuración comercial sin salir del panel administrativo."
      email={session.email}
      role={session.role}
    >
      <AdminBreadcrumbs
        items={[
          { label: 'Dashboard', href: '/admin_group' },
          { label: 'Productos', href: '/admin_group/admin/products' },
          { label: 'Editar producto' },
        ]}
      />

      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#D4AF37', fontFamily: 'serif', fontSize: '2rem', marginBottom: '10px' }}>
          Editar Producto
        </h2>
        <p style={{ color: '#BDBDBD', margin: 0 }}>
          Trabaja el detalle del producto sin perder el contexto del catálogo.
        </p>
      </div>

      <ProductForm
        mode="edit"
        productId={product.id}
        initialData={{
          id: product.id,
          name: product.name,
          description: product.description,
          basePrice: String(product.basePrice),
          status: product.status,
          shippingMode: product.shippingMode,
          shippingCost: String(product.shippingCost),
          shippingNotes: product.shippingNotes ?? '',
          tags: product.tags.map((tag) => tag.name),
          images: (product.images as string[]) ?? [],
          variants: product.variants.map((variant) => ({
            sku: variant.sku,
            size: variant.size ?? '',
            color: variant.color ?? '',
            stoneType: variant.stoneType ?? '',
            stock: variant.stock,
            price: variant.price !== null ? String(variant.price) : '',
          })),
        }}
      />
    </AdminShell>
  );
}
