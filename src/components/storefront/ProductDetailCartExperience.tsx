'use client';

import { useCheckoutStore } from '@/lib/store/useCheckoutStore';
import type { CatalogProduct } from '@/lib/catalog/types';
import ProductShareButton from '@/components/storefront/ProductShareButton';
import type { ShareableProduct } from '@/lib/social/share';
import CheckoutPanel from '@/components/storefront/CheckoutPanel';

const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

interface ProductDetailCartExperienceProps {
  cartProduct: CatalogProduct;
  shareProduct: ShareableProduct;
}

export default function ProductDetailCartExperience({
  cartProduct,
  shareProduct,
}: ProductDetailCartExperienceProps) {
  const {
    cartItems,
    isCartOpen,
    step,
    addToCart,
    openCart,
    closeCart,
    incrementItem,
    decrementItem,
    removeFromCart,
    clearCart,
    setStep,
  } = useCheckoutStore();

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingTotal = cartItems.reduce((sum, item) => sum + (item.shippingCost ?? 0) * item.quantity, 0);
  const orderTotal = subtotal + shippingTotal;

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '24px' }}>
        <button
          type="button"
          className="checkout-button"
          onClick={() => {
            addToCart(cartProduct);
            openCart();
          }}
        >
          Agregar al carrito
        </button>
        <ProductShareButton product={shareProduct} variant="detail" />
      </div>

      <aside className={`cart-drawer ${isCartOpen ? 'open' : ''}`} aria-hidden={!isCartOpen}>
        <div className="cart-header">
          <div>
            <p className="eyebrow">Shopping cart</p>
            <h2>Tu selección</h2>
          </div>
          <button type="button" className="icon-button" onClick={closeCart}>
            Cerrar
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Tu carrito aún está vacío.</p>
            <span>Agrega productos para comenzar la compra.</span>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <article key={item.id} className="cart-item">
                  <div>
                    <p>{item.name}</p>
                    <span>{currency.format(item.price)}</span>
                  </div>

                  <div className="cart-controls">
                    <button type="button" onClick={() => decrementItem(item.id)}>
                      -
                    </button>
                    <strong>{item.quantity}</strong>
                    <button type="button" onClick={() => incrementItem(item.id)}>
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Quitar
                  </button>
                </article>
              ))}
            </div>

            <div className="cart-summary">
              <div>
                <span>Subtotal</span>
                <strong>{currency.format(subtotal)}</strong>
              </div>
              <div>
                <span>Envío</span>
                <strong>{shippingTotal > 0 ? currency.format(shippingTotal) : 'Gratis'}</strong>
              </div>

              <button
                type="button"
                className="checkout-button"
                onClick={() => {
                  closeCart();
                  setStep('payment');
                }}
              >
                Continuar al checkout
              </button>
              <button type="button" className="ghost-button" onClick={clearCart}>
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </aside>

      {isCartOpen ? <button type="button" className="cart-backdrop" onClick={closeCart} /> : null}

      <CheckoutPanel
        open={step === 'payment' && cartItems.length > 0}
        totalAmount={orderTotal}
        cartItems={cartItems}
        onClose={() => {
          setStep('cart');
          openCart();
        }}
        onSuccess={() => {
          clearCart();
          closeCart();
          setStep('success');
        }}
      />
    </>
  );
}

