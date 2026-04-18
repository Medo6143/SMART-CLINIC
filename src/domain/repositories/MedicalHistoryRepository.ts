import type { MedicalHistory } from "../entities/MedicalHistory";

export interface MedicalHistoryRepository {
  getByPatient(patientId: string): Promise<MedicalHistory[]>;
  getByPatientAndClinic(patientId: string, clinicId: string): Promise<MedicalHistory[]>;
  add(patientId: string, data: Omit<MedicalHistory, "id" | "createdAt">): Promise<string>;
  update(patientId: string, recordId: string, data: Partial<MedicalHistory>): Promise<void>;
  delete(patientId: string, recordId: string): Promise<void>;
}
