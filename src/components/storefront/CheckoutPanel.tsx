'use client';

import { useMemo, useState } from 'react';
import type { CartItem } from '@/lib/store/useCheckoutStore';

const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

type CheckoutFlow = 'PAYMENT_LINK' | 'DIRECT_API';
type DirectMethod = 'NEQUI' | 'BOTON_BANCOLOMBIA' | 'PSE';

interface CheckoutPanelProps {
  open: boolean;
  totalAmount: number;
  cartItems: CartItem[];
  onClose: () => void;
  onSuccess?: () => void;
}

type PseBank = {
  bank_code: string;
  bank_name: string;
};

function getDeviceFingerprint() {
  if (typeof window === 'undefined') {
    return {
      deviceType: 'DESKTOP',
      os: 'Unknown',
      model: 'Unknown',
      browser: 'Unknown',
      javaEnabled: false,
      language: 'es-CO',
      colorDepth: 24,
      screenHeight: 1080,
      screenWidth: 1920,
      timeZoneOffset: 300,
      userAgent: '',
      acceptHeader: 'text/html,application/xhtml+xml',
    };
  }

  const userAgent = window.navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);
  const browser = /Chrome/i.test(userAgent)
    ? 'Chrome'
    : /Firefox/i.test(userAgent)
      ? 'Firefox'
      : /Safari/i.test(userAgent)
        ? 'Safari'
        : 'Unknown';
  const os = /Windows/i.test(userAgent)
    ? 'Windows'
    : /Android/i.test(userAgent)
      ? 'Android'
      : /iPhone|iPad|iPod/i.test(userAgent)
        ? 'iOS'
        : /Mac/i.test(userAgent)
          ? 'macOS'
          : 'Unknown';

  return {
    deviceType: isMobile ? 'MOBILE' : 'DESKTOP',
    os,
    model: window.navigator.platform || 'Unknown',
    browser,
    javaEnabled: typeof window.navigator.javaEnabled === 'function' ? window.navigator.javaEnabled() : false,
    language: window.navigator.language || 'es-CO',
    colorDepth: window.screen.colorDepth || 24,
    screenHeight: window.screen.height || 1080,
    screenWidth: window.screen.width || 1920,
    timeZoneOffset: new Date().getTimezoneOffset(),
    userAgent,
    acceptHeader: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  };
}

export default function CheckoutPanel({ open, totalAmount, cartItems, onClose, onSuccess }: CheckoutPanelProps) {
  const [flow, setFlow] = useState<CheckoutFlow>('PAYMENT_LINK');
  const [directMethod, setDirectMethod] = useState<DirectMethod>('NEQUI');
  const [banks, setBanks] = useState<PseBank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    documentType: 'CEDULA',
    documentNumber: '',
    city: '',
    state: '',
    address: '',
    zipCode: '',
    bankCode: '',
    bankName: '',
  });

  const loadPseBanks = async () => {
    if (!open || banks.length > 0 || loadingBanks) {
      return;
    }

    setLoadingBanks(true);
    try {
      const response = await fetch('/api/payments/bold/pse-banks');
      const data = (await response.json()) as { banks?: PseBank[]; error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? 'No fue posible cargar bancos PSE.');
      }

      setBanks(data.banks ?? []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No fue posible cargar bancos PSE.');
    } finally {
      setLoadingBanks(false);
    }
  };

  const summaryText = useMemo(
    () =>
      cartItems
        .map((item) => `${item.name} x${item.quantity}`)
        .join(', '),
    [cartItems]
  );

  if (!open) {
    return null;
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const selectedBank = banks.find((bank) => bank.bank_code === form.bankCode);
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          flow,
          description: summaryText || 'Compra Amantra',
          payerEmail: form.email,
          items: cartItems.map((item) => ({
            productId: item.id,
            name: item.name,
            imageUrl: item.imageUrl,
            price: item.price,
            quantity: item.quantity,
            shippingCost: item.shippingCost ?? 0,
            shippingLabel: item.shippingLabel,
          })),
          customer: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            documentType: form.documentType,
            documentNumber: form.documentNumber,
            city: form.city,
            state: form.state,
            address: form.address,
            zipCode: form.zipCode,
          },
          paymentMethod:
            flow === 'DIRECT_API'
              ? {
                  name: directMethod,
                  bankCode: directMethod === 'PSE' ? form.bankCode : undefined,
                  bankName: directMethod === 'PSE' ? selectedBank?.bank_name ?? form.bankName : undefined,
                }
              : undefined,
          deviceFingerprint: flow === 'DIRECT_API' ? getDeviceFingerprint() : undefined,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        redirectUrl?: string;
        paymentReference?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? 'No fue posible iniciar el pago.');
      }

      if (data.redirectUrl) {
        onSuccess?.();
        window.location.href = data.redirectUrl;
        return;
      }

      setMessage(`Orden creada correctamente. Referencia: ${data.paymentReference ?? 'Amantra'}`);
      onSuccess?.();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No fue posible iniciar el checkout.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="cart-backdrop" onClick={onClose} />
      <aside
        className="cart-drawer open"
        style={{
          width: 'min(560px, calc(100vw - 24px))',
          zIndex: 80,
        }}
      >
        <div className="cart-header">
          <div>
            <p className="eyebrow">Checkout Amantra</p>
            <h2>Finaliza tu pago</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <form onSubmit={submit} style={{ display: 'grid', gap: 16, overflowY: 'auto', paddingRight: 4 }}>
          <div className="service-card" style={{ padding: 18 }}>
            <p className="eyebrow">Resumen</p>
            <h3>{currency.format(totalAmount)}</h3>
            <p>{summaryText || 'Compra Amantra'}</p>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ color: '#D4AF37', fontSize: 13, letterSpacing: '0.08em' }}>Flujo de pago</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className={flow === 'PAYMENT_LINK' ? 'checkout-button' : 'ghost-button'} onClick={() => setFlow('PAYMENT_LINK')}>
                Link externo
              </button>
              <button type="button" className={flow === 'DIRECT_API' ? 'checkout-button' : 'ghost-button'} onClick={() => setFlow('DIRECT_API')}>
                API directa
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            <input placeholder="Nombre completo" value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} className="cart-input" required />
            <input placeholder="Correo" type="email" value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} className="cart-input" required />
            <input placeholder="Teléfono" value={form.phone} onChange={(e) => setForm((c) => ({ ...c, phone: e.target.value }))} className="cart-input" required={flow === 'DIRECT_API'} />
            <input placeholder="Documento" value={form.documentNumber} onChange={(e) => setForm((c) => ({ ...c, documentNumber: e.target.value }))} className="cart-input" required={flow === 'DIRECT_API'} />
            <select value={form.documentType} onChange={(e) => setForm((c) => ({ ...c, documentType: e.target.value }))} className="cart-input">
              <option value="CEDULA">Cédula</option>
              <option value="CEDULA_EXTRANJERIA">Cédula extranjería</option>
              <option value="TARJETA_IDENTIDAD">Tarjeta identidad</option>
              <option value="PASAPORTE">Pasaporte</option>
              <option value="NIT">NIT</option>
            </select>
            <input placeholder="Ciudad" value={form.city} onChange={(e) => setForm((c) => ({ ...c, city: e.target.value }))} className="cart-input" required={flow === 'DIRECT_API'} />
            <input placeholder="Departamento" value={form.state} onChange={(e) => setForm((c) => ({ ...c, state: e.target.value }))} className="cart-input" required={flow === 'DIRECT_API'} />
            <input placeholder="Código postal" value={form.zipCode} onChange={(e) => setForm((c) => ({ ...c, zipCode: e.target.value }))} className="cart-input" />
          </div>

          <input placeholder="Dirección" value={form.address} onChange={(e) => setForm((c) => ({ ...c, address: e.target.value }))} className="cart-input" required={flow === 'DIRECT_API'} />

          {flow === 'DIRECT_API' ? (
            <div style={{ display: 'grid', gap: 12 }}>
              <label style={{ color: '#D4AF37', fontSize: 13, letterSpacing: '0.08em' }}>Método directo</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" className={directMethod === 'NEQUI' ? 'checkout-button' : 'ghost-button'} onClick={() => setDirectMethod('NEQUI')}>
                  Nequi
                </button>
                <button type="button" className={directMethod === 'BOTON_BANCOLOMBIA' ? 'checkout-button' : 'ghost-button'} onClick={() => setDirectMethod('BOTON_BANCOLOMBIA')}>
                  Botón Bancolombia
                </button>
                <button
                  type="button"
                  className={directMethod === 'PSE' ? 'checkout-button' : 'ghost-button'}
                  onClick={() => {
                    setDirectMethod('PSE');
                    void loadPseBanks();
                  }}
                >
                  PSE
                </button>
              </div>

              {directMethod === 'PSE' ? (
                <select
                  value={form.bankCode}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      bankCode: e.target.value,
                      bankName: banks.find((bank) => bank.bank_code === e.target.value)?.bank_name ?? '',
                    }))
                  }
                  className="cart-input"
                  required
                >
                  <option value="">{loadingBanks ? 'Cargando bancos...' : 'Selecciona tu banco'}</option>
                  {banks.map((bank) => (
                    <option key={bank.bank_code} value={bank.bank_code}>
                      {bank.bank_name}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          ) : (
            <p style={{ color: '#BDBDBD', margin: 0, lineHeight: 1.7 }}>
              Link externo recomendado para producción temprana: Amantra crea la orden pendiente y redirige al comprador al checkout seguro de Bold.
            </p>
          )}

          {error ? <div style={{ color: '#ff9e95', fontSize: 14 }}>{error}</div> : null}
          {message ? <div style={{ color: '#9BD4A4', fontSize: 14 }}>{message}</div> : null}

          <button type="submit" className="checkout-button" disabled={submitting}>
            {submitting ? 'Procesando...' : flow === 'PAYMENT_LINK' ? 'Ir a pagar con Bold' : 'Continuar con pago directo'}
          </button>
        </form>
      </aside>
    </>
  );
}
