import ProductForm from '@/components/admin/ProductForm';

export default function AdminProductsPage() {
    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ color: '#D4AF37', fontFamily: 'serif', fontSize: '2.5rem' }}>Añadir Nuevo Producto</h1>
                <p style={{ color: '#BDBDBD' }}>Configura los detalles de lujo y variantes para la tienda.</p>
            </header>
            <ProductForm />
        </div>
    );
}