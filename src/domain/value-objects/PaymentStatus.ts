export const PaymentStatuses = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export type PaymentStatus = (typeof PaymentStatuses)[keyof typeof PaymentStatuses];

export function isPaymentComplete(status: PaymentStatus): boolean {
  return status === PaymentStatuses.SUCCESS;
}

export function canRefund(status: PaymentStatus): boolean {
  return status === PaymentStatuses.SUCCESS;
}
