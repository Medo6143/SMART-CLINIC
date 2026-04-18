export interface ClinicSettings {
  workingHours: {
    [day: string]: { open: string; close: string } | null;
  };
  slotDurationMinutes: number;
  allowOnlineBooking: boolean;
  allowOnlineConsultation: boolean;
  consultationFee: number;
  currency: string;
}

export interface Clinic {
  id: string;
  name: string;
  nameAr: string;
  address: string;
  addressAr: string;
  phone: string;
  logoUrl: string | null;
  settings: ClinicSettings;
  isActive: boolean;
  doctorIds: string[];
  createdAt: Date;
}

export type CreateClinicInput = Omit<Clinic, "id" | "createdAt" | "isActive">;
export type UpdateClinicInput = Partial<Omit<Clinic, "id" | "createdAt">>;
