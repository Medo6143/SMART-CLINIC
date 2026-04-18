import type { AppointmentRepository } from "../../domain/repositories/AppointmentRepository";
import type { PaymentRepository } from "../../domain/repositories/PaymentRepository";
import type { AppointmentPriority, AppointmentType, ConsultationMode } from "../../domain/value-objects/AppointmentStatus";

export interface BookAppointmentInput {
  clinicId: string;
  patientId: string;
  patientName?: string;
  patientPhone?: string;
  doctorId: string;
  doctorName?: string;
  type: AppointmentType;
  consultationMode?: ConsultationMode;
  date: Date;
  slotTime?: string;
  priority: AppointmentPriority;
  amount?: number;
  notes?: string;
}

export interface BookAppointmentResult {
  appointmentId: string;
  paymentUrl: string | null;
}

const PAYMENT_DEADLINE_MS = 30 * 60 * 1000;

export function createBookAppointmentUseCase(
  appointmentRepo: AppointmentRepository,
  paymentRepo: PaymentRepository
) {
  return async (input: BookAppointmentInput): Promise<BookAppointmentResult> => {
    const amount = input.amount ?? 150;
    // This use case is always triggered from the web (online) booking flow
    const paymentDeadlineAt = new Date(Date.now() + PAYMENT_DEADLINE_MS).toISOString();

    const appointmentId = await appointmentRepo.create({
      ...input,
      patientName: input.patientName ?? "",
      patientPhone: input.patientPhone ?? "",
      doctorName: input.doctorName ?? "",
      consultationMode: input.consultationMode ?? (input.type === "online" ? "online" : "offline"),
      status: "pending",
      bookingOrigin: "online",
      meetLink: null,
      paymentId: null,
      paymentStatus: "unpaid",
      paymentMethod: "card",
      amount,
      paymentDeadlineAt,
      notes: input.notes ?? null,
    } as Parameters<typeof appointmentRepo.create>[0]);

    const payment = await paymentRepo.initiatePayment(appointmentId, amount, "EGP");
    return { appointmentId, paymentUrl: payment.paymentUrl };
  };
}
