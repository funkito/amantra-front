import type { PaymentStatus } from '@prisma/client';

export function orderStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: 'Pendiente',
    PAID: 'Pagada',
    PREPARING: 'En preparación',
    SHIPPED: 'Enviada',
    CANCELLED: 'Cancelada',
    COMPLETED: 'Completada',
  };

  return labels[status] ?? status;
}

export function paymentStatusLabel(status: PaymentStatus | string) {
  const labels: Record<string, string> = {
    PENDING: 'Pendiente',
    PROCESSING: 'Procesando',
    APPROVED: 'Aprobado',
    REJECTED: 'Rechazado',
    FAILED: 'Fallido',
    VOIDED: 'Anulado',
    EXPIRED: 'Expirado',
  };

  return labels[status] ?? status;
}
