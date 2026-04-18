import type { UserRole } from "../value-objects/UserRole";
import type { Language } from "../value-objects/Language";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  phone: string | null;
  photoURL: string | null;
  role: UserRole;
  clinicId: string | null;
  languagePrefs: Language;
  onlineConsultationFee?: number;
  offlineConsultationFee?: number;
  age?: number | null;
  lastOnlineAt?: string | null;
  /** Doctor's specialization/title (e.g., Dermatologist) */
  specialization?: string | null;
  /** Doctor's working hours/shifts for the week */
  shifts?: {
    day: string;
    start: string;
    end: string;
    isOpen: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserInput = Omit<User, "createdAt" | "updatedAt">;
