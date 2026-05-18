import crypto from 'node:crypto';
import type { PaymentFlow, PaymentStatus, WebhookProcessingStatus } from '@prisma/client';
import { PaymentProvider } from '@prisma/client';
import { getBoldSettings } from '@/lib/system-settings';

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

interface BoldEnvelope<T> {
  payload?: T;
  errors?: Array<{ code?: string; message?: string }>;
}

export interface BoldLinkPaymentInput {
  referenceId: string;
  totalAmount: number;
  description: string;
  payerEmail?: string;
  callbackUrl?: string;
  imageUrl?: string;
}

export interface BoldLinkPaymentResult {
  paymentLinkId: string;
  paymentLinkUrl: string;
}

export interface BoldDirectIntentInput {
  referenceId: string;
  totalAmount: number;
  description: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  callbackUrl?: string;
}

export interface BoldDirectIntentResult {
  referenceId: string;
  status: string;
  transactionId: string | null;
  raw: JsonValue;
}

export interface BoldDirectAttemptInput {
  referenceId: string;
  payer: {
    personType: 'NATURAL_PERSON' | 'LEGAL_PERSON';
    name: string;
    phone: string;
    email: string;
    documentType: 'CEDULA' | 'CEDULA_EXTRANJERIA' | 'TARJETA_IDENTIDAD' | 'PASAPORTE' | 'NIT';
    documentNumber: string;
    billingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      countryCode: string;
    };
  };
  paymentMethod:
    | { name: 'PSE'; bankCode: string; bankName: string }
    | { name: 'NEQUI' }
    | { name: 'BOTON_BANCOLOMBIA' };
  deviceFingerprint: {
    deviceType: string;
    os: string;
    model: string;
    browser: string;
    javaEnabled: boolean;
    language: string;
    colorDepth: number;
    screenHeight: number;
    screenWidth: number;
    timeZoneOffset: number;
    userAgent?: string;
    acceptHeader?: string;
    ip?: string;
  };
}

export interface BoldDirectAttemptResult {
  transactionId: string;
  status: string;
  redirectUrl: string | null;
  redirectMethod: string | null;
  raw: JsonValue;
}

export interface BoldWebhookPayload extends Record<string, unknown> {
  id?: string;
  type?: string;
  subject?: string;
  time?: number;
  data?: Record<string, unknown> & {
    payment_id?: string;
    payer_email?: string;
    payment_method?: string;
    metadata?: Record<string, unknown> & {
      reference?: string;
    };
    amount?: Record<string, unknown> & {
      total?: number;
      currency?: string;
    };
  };
}

function buildBoldHeaders(identityKey: string) {
  return {
    Authorization: `x-api-key ${identityKey}`,
    'Content-Type': 'application/json',
  };
}

function normalizeBoldErrors(errors?: Array<{ code?: string; message?: string }>) {
  if (!errors || errors.length === 0) {
    return 'Bold devolvió un error sin detalle.';
  }

  return errors.map((error) => error.message || error.code || 'Error desconocido').join(' | ');
}

async function parseBoldResponse<T>(response: Response): Promise<T> {
  const raw = (await response.json()) as BoldEnvelope<T> | T;

  if (!response.ok) {
    if ('errors' in (raw as BoldEnvelope<T>)) {
      throw new Error(normalizeBoldErrors((raw as BoldEnvelope<T>).errors));
    }

    throw new Error('No fue posible completar la operación con Bold.');
  }

  if ('payload' in (raw as BoldEnvelope<T>)) {
    return ((raw as BoldEnvelope<T>).payload ?? raw) as T;
  }

  return raw as T;
}

export async function createBoldPaymentLink(input: BoldLinkPaymentInput): Promise<BoldLinkPaymentResult> {
  const settings = await getBoldSettings();

  if (!settings.identityKey) {
    throw new Error('Falta configurar la llave de identidad de Bold.');
  }

  const endpoint = `${settings.linksBaseUrl.replace(/\/$/, '')}/online/link/v1`;
  const payload = await parseBoldResponse<{ payment_link: string; url: string }>(
    await fetch(endpoint, {
      method: 'POST',
      headers: buildBoldHeaders(settings.identityKey),
      body: JSON.stringify({
        amount_type: 'CLOSE',
        amount: {
          currency: 'COP',
          total_amount: Math.round(input.totalAmount),
        },
        reference: input.referenceId,
        description: input.description,
        callback_url: input.callbackUrl,
        payer_email: input.payerEmail,
        image_url: input.imageUrl,
      }),
    })
  );

  return {
    paymentLinkId: payload.payment_link,
    paymentLinkUrl: payload.url,
  };
}

export async function getBoldPaymentLinkStatus(paymentLinkId: string) {
  const settings = await getBoldSettings();

  if (!settings.identityKey) {
    throw new Error('Falta configurar la llave de identidad de Bold.');
  }

  const endpoint = `${settings.linksBaseUrl.replace(/\/$/, '')}/online/link/v1/${paymentLinkId}`;
  return parseBoldResponse<JsonValue>(
    await fetch(endpoint, {
      headers: buildBoldHeaders(settings.identityKey),
    })
  );
}

export async function getBoldDirectPaymentStatus(referenceId: string) {
  const settings = await getBoldSettings();

  if (!settings.identityKey) {
    throw new Error('Falta configurar la llave de identidad de Bold.');
  }

  const endpoint = `${settings.paymentsBaseUrl.replace(/\/$/, '')}/v1/payment/${referenceId}`;
  return parseBoldResponse<JsonValue>(
    await fetch(endpoint, {
      headers: buildBoldHeaders(settings.identityKey),
    })
  );
}

export async function getBoldPseBanks() {
  const settings = await getBoldSettings();

  if (!settings.identityKey) {
    throw new Error('Falta configurar la llave de identidad de Bold.');
  }

  const endpoint = `${settings.paymentsBaseUrl.replace(/\/$/, '')}/v1/payment/pse/banks`;
  const payload = await parseBoldResponse<{ banks: Array<{ bank_code: string; bank_name: string }> }>(
    await fetch(endpoint, {
      headers: buildBoldHeaders(settings.identityKey),
    })
  );

  return payload.banks;
}

export async function createBoldDirectPaymentIntent(input: BoldDirectIntentInput): Promise<BoldDirectIntentResult> {
  const settings = await getBoldSettings();

  if (!settings.identityKey) {
    throw new Error('Falta configurar la llave de identidad de Bold.');
  }

  // TODO: FASE 2
  // Extender este flujo con payment attempts, fingerprint y métodos de pago completos
  // cuando el checkout frontend capture tarjeta/PSE/Nequi y el negocio complete revisión PCI DSS.
  const endpoint = `${settings.paymentsBaseUrl.replace(/\/$/, '')}/v1/payment-intent`;
  const payload = await parseBoldResponse<
    Record<string, unknown> & {
      reference_id: string;
      status: string;
      bold_transaction_id?: string;
    }
  >(
    await fetch(endpoint, {
      method: 'POST',
      headers: buildBoldHeaders(settings.identityKey),
      body: JSON.stringify({
        reference_id: input.referenceId,
        amount: {
          currency: 'COP',
          total_amount: Math.round(input.totalAmount),
        },
        description: input.description,
        callback_url: input.callbackUrl,
        customer: input.customer,
      }),
    })
  );

  return {
    referenceId: payload.reference_id,
    status: payload.status,
    transactionId: typeof payload.bold_transaction_id === 'string' ? payload.bold_transaction_id : null,
    raw: payload as unknown as JsonValue,
  };
}

export async function createBoldDirectPaymentAttempt(input: BoldDirectAttemptInput): Promise<BoldDirectAttemptResult> {
  const settings = await getBoldSettings();

  if (!settings.identityKey) {
    throw new Error('Falta configurar la llave de identidad de Bold.');
  }

  const endpoint = `${settings.paymentsBaseUrl.replace(/\/$/, '')}/v1/payment`;
  const payload = await parseBoldResponse<
    Record<string, unknown> & {
      transaction_id: string;
      status: string;
      next_actions?: {
        redirect_url?: string;
        redirect_method?: string;
      };
    }
  >(
    await fetch(endpoint, {
      method: 'POST',
      headers: buildBoldHeaders(settings.identityKey),
      body: JSON.stringify({
        reference_id: input.referenceId,
        payer: {
          person_type: input.payer.personType,
          name: input.payer.name,
          phone: input.payer.phone,
          email: input.payer.email,
          document_type: input.payer.documentType,
          document_number: input.payer.documentNumber,
          billing_address: {
            street: input.payer.billingAddress.street,
            city: input.payer.billingAddress.city,
            state: input.payer.billingAddress.state,
            zip_code: input.payer.billingAddress.zipCode,
            country_code: input.payer.billingAddress.countryCode,
          },
        },
        payment_method:
          input.paymentMethod.name === 'PSE'
            ? {
                name: 'PSE',
                bank_code: Number(input.paymentMethod.bankCode),
                bank_name: input.paymentMethod.bankName,
              }
            : {
                name: input.paymentMethod.name,
              },
        device_fingerprint: {
          device_type: input.deviceFingerprint.deviceType,
          os: input.deviceFingerprint.os,
          model: input.deviceFingerprint.model,
          browser: input.deviceFingerprint.browser,
          java_enabled: input.deviceFingerprint.javaEnabled,
          language: input.deviceFingerprint.language,
          color_depth: input.deviceFingerprint.colorDepth,
          screen_height: input.deviceFingerprint.screenHeight,
          screen_width: input.deviceFingerprint.screenWidth,
          time_zone_offset: input.deviceFingerprint.timeZoneOffset,
          user_agent: input.deviceFingerprint.userAgent,
          accept_header: input.deviceFingerprint.acceptHeader,
          ip: input.deviceFingerprint.ip,
        },
      }),
    })
  );

  return {
    transactionId: payload.transaction_id,
    status: payload.status,
    redirectUrl:
      payload.next_actions && typeof payload.next_actions.redirect_url === 'string'
        ? payload.next_actions.redirect_url
        : null,
    redirectMethod:
      payload.next_actions && typeof payload.next_actions.redirect_method === 'string'
        ? payload.next_actions.redirect_method
        : null,
    raw: payload as unknown as JsonValue,
  };
}

export function validateBoldWebhookSignature(rawBody: string, signature: string | null, secretKey: string, environment: 'sandbox' | 'production') {
  if (!signature) {
    return false;
  }

  const normalizedSecret = environment === 'sandbox' ? '' : secretKey;
  const encodedBody = Buffer.from(rawBody, 'utf8').toString('base64');
  const digest = crypto.createHmac('sha256', normalizedSecret).update(encodedBody).digest('hex');

  if (digest.length !== signature.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export function buildWebhookIdempotencyKey(payload: BoldWebhookPayload) {
  return [payload.id, payload.type, payload.subject].filter(Boolean).join(':') || crypto.createHash('sha1').update(JSON.stringify(payload)).digest('hex');
}

export function mapBoldEventToPaymentStatus(eventType?: string): PaymentStatus {
  switch (eventType) {
    case 'SALE_APPROVED':
      return 'APPROVED';
    case 'SALE_REJECTED':
      return 'REJECTED';
    case 'VOID_APPROVED':
      return 'VOIDED';
    case 'VOID_REJECTED':
      return 'FAILED';
    default:
      return 'PROCESSING';
  }
}

export function mapBoldRemoteStatus(status?: string): PaymentStatus {
  switch (status) {
    case 'PAID':
    case 'APPROVED':
      return 'APPROVED';
    case 'PROCESSING':
      return 'PROCESSING';
    case 'PENDING':
    case 'ACTIVE':
      return 'PENDING';
    case 'REJECTED':
      return 'REJECTED';
    case 'FAILED':
      return 'FAILED';
    case 'VOIDED':
      return 'VOIDED';
    case 'EXPIRED':
      return 'EXPIRED';
    default:
      return 'PROCESSING';
  }
}

export function mapBoldPaymentStatusToOrderStatus(paymentStatus: PaymentStatus, currentStatus: string) {
  if (paymentStatus === 'APPROVED' && currentStatus === 'PENDING') {
    return 'PAID';
  }

  if (['REJECTED', 'FAILED', 'VOIDED', 'EXPIRED'].includes(paymentStatus) && currentStatus === 'PENDING') {
    return 'CANCELLED';
  }

  return currentStatus;
}

export function inferBoldFlowFromSource(source?: string): PaymentFlow {
  return source?.includes('/links') ? 'PAYMENT_LINK' : 'DIRECT_API';
}

export function extractBoldReference(payload: BoldWebhookPayload) {
  return typeof payload.data?.metadata?.reference === 'string' ? payload.data.metadata.reference : undefined;
}

export function extractBoldTransactionId(payload: BoldWebhookPayload) {
  return typeof payload.subject === 'string' ? payload.subject : typeof payload.data?.payment_id === 'string' ? payload.data.payment_id : undefined;
}

export function normalizeWebhookProcessingStatus(hasError: boolean, invalidSignature = false): WebhookProcessingStatus {
  if (invalidSignature) {
    return 'INVALID_SIGNATURE';
  }

  return hasError ? 'ERROR' : 'PROCESSED';
}

export const BOLD_PROVIDER = PaymentProvider.BOLD;
