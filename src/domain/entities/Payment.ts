import type { PaymentStatus } from "../value-objects/PaymentStatus";

export interface Payment {
  id: string;
  appointmentId: string;
  clinicId: string;
  patientId: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: "paymob";
  paymobOrderId: string | null;
  createdAt: Date;
}

export interface DateRange {
  from: Date;
  to: Date;
}
