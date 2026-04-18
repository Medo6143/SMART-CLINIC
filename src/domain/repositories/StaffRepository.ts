import type { Staff } from "../entities/Staff";

export interface StaffRepository {
  getByClinic(clinicId: string): Promise<Staff[]>;
  getById(id: string): Promise<Staff | null>;
  add(data: Omit<Staff, "id" | "createdAt">): Promise<string>;
  update(id: string, data: Partial<Staff>): Promise<void>;
  delete(id: string): Promise<void>;
}
