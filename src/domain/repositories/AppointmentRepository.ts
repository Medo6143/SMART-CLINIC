import type { Appointment, CreateAppointmentInput, AppointmentFilters } from "../entities/Appointment";
import type { AppointmentStatus } from "../value-objects/AppointmentStatus";

export interface ApprovalPayload {
  approvedBy: string;
  approvedAt: Date;
  meetLink?: string | null;
}

export interface RejectionPayload {
  rejectedBy: string;
  rejectedAt: Date;
  rejectionReason: string;
}

export interface AppointmentRepository {
  create(data: CreateAppointmentInput): Promise<string>;
  getById(id: string): Promise<Appointment | null>;
  getByPatient(patientId: string): Promise<Appointment[]>;
  getByDoctor(doctorId: string, date?: Date): Promise<Appointment[]>;
  getByClinic(clinicId: string, filters?: AppointmentFilters): Promise<Appointment[]>;
  updateStatus(id: string, status: AppointmentStatus): Promise<void>;
  approve(id: string, payload: ApprovalPayload): Promise<void>;
  reject(id: string, payload: RejectionPayload): Promise<void>;
  reschedule(id: string, newDate: Date, slotTime: string, rescheduledBy: string): Promise<string>;
  update(id: string, data: Partial<Appointment>): Promise<void>;
  delete(id: string): Promise<void>;
  /** Real-time clinic subscription */
  subscribeToClinicAppointments(
    clinicId: string,
    filters: AppointmentFilters,
    callback: (appointments: Appointment[]) => void
  ): () => void;
}
