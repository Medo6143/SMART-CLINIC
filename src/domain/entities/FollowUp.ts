export type FollowUpStatus = "pending" | "responded" | "analyzing" | "analyzed" | "reviewed" | "closed";
export type MedicationAdherence = "full" | "partial" | "stopped";

export interface PatientFollowUpResponse {
  improvementPercent: number;
  symptomsBetter: boolean;
  symptomsWorse: boolean;
  newSymptoms: string[];
  sideEffects: string[];
  medicationAdherence: MedicationAdherence;
  freeText: string;
  respondedAt: Date;
}

export interface FollowUp {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  doctorId: string;
  doctorName: string;
  clinicId: string;
  specialty: string;
  diagnosis: string;
  symptoms?: string | null;
  status: FollowUpStatus;
  patientResponse?: PatientFollowUpResponse | null;
  doctorReviewed: boolean;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
