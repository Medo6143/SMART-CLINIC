import type { AppointmentStatus, AppointmentType, AppointmentPriority, ConsultationMode } from "../value-objects/AppointmentStatus";

export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  patientPhone?: string;
  patientEmail?: string;
  patientAge?: number;
  /** Patient's turn number for the day (1-indexed) */
  turnNumber?: number | null;
  doctorId: string;
  doctorName?: string;
  clinicId: string;
  type: AppointmentType;
  /** online = video call, offline = clinic visit */
  consultationMode: ConsultationMode;
  status: AppointmentStatus;
  priority: AppointmentPriority;
  bookingOrigin: "online" | "offline";
  // Payment
  meetLink: string | null;
  paymentId: string | null;
  paymobOrderId?: string | null;
  paymobTransactionId?: string | null;
  paymentStatus: "unpaid" | "paid" | "partially_paid" | "refunded" | "failed";
  paymentMethod: "card" | "wallet" | "cash";
  amount: number;
  /** ISO string deadline — appointment auto-cancelled if payment not received */
  paymentDeadlineAt: string | null;
  // Approval
  approvedBy?: string | null;
  approvedAt?: Date | null;
  rejectedBy?: string | null;
  rejectedAt?: Date | null;
  rejectionReason?: string | null;
  // Clinical
  symptoms?: string | null;
  hasPreviousVisit?: boolean;
  date: Date;
  slotTime?: string;
  notes: string | null;
  // Rescheduling
  rescheduledFromId?: string | null;
  rescheduledToId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateAppointmentInput = Omit<Appointment, "id" | "createdAt" | "updatedAt">;

export interface AppointmentFilters {
  status?: AppointmentStatus;
  priority?: AppointmentPriority;
  type?: AppointmentType;
  consultationMode?: ConsultationMode;
  dateFrom?: Date;
  dateTo?: Date;
  doctorId?: string;
}
