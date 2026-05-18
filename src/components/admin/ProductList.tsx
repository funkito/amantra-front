import ProductManagementTable from '@/components/admin/ProductManagementTable';
import { getAdminProductsFromBackend } from '@/lib/admin/backend-products';
import { getBackendApiUrl } from '@/lib/backend-api';
import { prisma } from '@/lib/prisma';

export default async function ProductList() {
  if (getBackendApiUrl()) {
    const products = await getAdminProductsFromBackend();
    return <ProductManagementTable products={products} />;
  }

  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    where: {
      deletedAt: null,
    },
    include: {
      tags: true,
      variants: true,
    },
  });

  return (
    <ProductManagementTable
      products={products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        status: product.status,
        basePrice: product.basePrice,
        shippingMode: product.shippingMode,
        shippingCost: product.shippingCost,
        images: product.images,
        variantCount: product.variants.length,
        tagNames: product.tags.map((tag) => tag.name),
        createdAt: product.createdAt.toISOString(),
      }))}
    />
  );
}
