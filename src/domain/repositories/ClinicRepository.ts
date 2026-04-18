import type { Clinic, CreateClinicInput, UpdateClinicInput } from "../entities/Clinic";
import type { User } from "../entities/User";

export interface ClinicRepository {
  getAll(): Promise<Clinic[]>;
  getById(id: string): Promise<Clinic | null>;
  create(data: CreateClinicInput): Promise<string>;
  update(id: string, data: UpdateClinicInput): Promise<void>;
  delete(id: string): Promise<void>;
  getDoctors(clinicId: string): Promise<User[]>;
  getAvailableSlots(clinicId: string, doctorId: string, date: Date): Promise<string[]>;
}
