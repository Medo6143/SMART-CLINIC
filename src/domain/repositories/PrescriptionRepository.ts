import type { Prescription } from "../entities/Prescription";

export interface PrescriptionRepository {
  getById(id: string): Promise<Prescription | null>;
  getByPatient(patientId: string): Promise<Prescription[]>;
  getByDoctor(doctorId: string): Promise<Prescription[]>;
  getByClinic(clinicId: string): Promise<Prescription[]>;
  add(data: Omit<Prescription, "id" | "createdAt">): Promise<string>;
  update(id: string, data: Partial<Prescription>): Promise<void>;
  delete(id: string): Promise<void>;
}
