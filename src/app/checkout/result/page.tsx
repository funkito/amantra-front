import Link from 'next/link';

export default function CheckoutResultPage() {
  return (
    <main className="amantra-shell" style={{ paddingTop: '72px', paddingBottom: '72px' }}>
      <section className="service-section">
        <div className="service-card" style={{ maxWidth: 720, margin: '0 auto' }}>
          <p className="eyebrow">Pago en proceso</p>
          <h1>Estamos verificando tu transacción con Bold</h1>
          <p>
            Si acabas de terminar el flujo de pago, tu orden puede tardar unos segundos en reflejarse.
            Amantra sincroniza el estado automáticamente con webhook y también puede refrescarlo desde el admin.
          </p>
          <div className="hero-actions" style={{ marginTop: 24 }}>
            <Link href="/" className="primary-link">
              Volver a la tienda
            </Link>
            <Link href="/admin_group/admin/orders" className="secondary-button">
              Ver órdenes en el admin
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
