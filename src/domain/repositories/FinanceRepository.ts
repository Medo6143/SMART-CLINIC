import type { Finance, FinanceType } from "../entities/Finance";
import type { DateRange } from "../entities/Payment";

export interface FinanceFilters {
  type?: FinanceType;
  dateRange?: DateRange;
  category?: string;
}

export interface FinanceRepository {
  getByClinic(clinicId: string, filters?: FinanceFilters): Promise<Finance[]>;
  getById(id: string): Promise<Finance | null>;
  add(data: Omit<Finance, "id" | "createdAt">): Promise<string>;
  update(id: string, data: Partial<Finance>): Promise<void>;
  delete(id: string): Promise<void>;
  getTotalByClinic(clinicId: string, type: FinanceType, dateRange?: DateRange): Promise<number>;
}
