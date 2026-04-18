import type { Payment, DateRange } from "../entities/Payment";

export interface PaymentRepository {
  initiatePayment(appointmentId: string, amount: number, currency: string): Promise<{ paymentUrl: string }>;
  getByAppointment(appointmentId: string): Promise<Payment | null>;
  getByClinic(clinicId: string, dateRange?: DateRange): Promise<Payment[]>;
  getById(id: string): Promise<Payment | null>;
}
