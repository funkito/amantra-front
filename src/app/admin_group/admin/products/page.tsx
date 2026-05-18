import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import AdminShell from '@/components/admin/AdminShell';
import ProductForm from '@/components/admin/ProductForm';
import ProductList from '@/components/admin/ProductList';
import { requireProductManager } from '@/lib/auth/guards';

export default async function AdminProductsPage() {
    const session = await requireProductManager();

    return (
        <AdminShell
            title="Gestión de productos"
            description="Crea, organiza y mantiene el catálogo de Amantra desde un solo lugar."
            email={session.email}
            role={session.role}
        >
            <AdminBreadcrumbs
                items={[
                    { label: 'Dashboard', href: '/admin_group' },
                    { label: 'Productos', href: '/admin_group/admin/products' },
                    { label: 'Gestión del catálogo' },
                ]}
            />

            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ color: '#D4AF37', fontFamily: 'serif', fontSize: '2rem', marginBottom: '10px' }}>
                    Añadir Nuevo Producto
                </h2>
                <p style={{ color: '#BDBDBD', margin: 0 }}>
                    Configura los detalles de lujo y variantes para la tienda.
                </p>
            </div>
            <ProductForm />
            <ProductList />
        </AdminShell>
    );
}
