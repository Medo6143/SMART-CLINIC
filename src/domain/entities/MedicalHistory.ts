export interface MedicalHistory {
  id: string;
  patientId: string;
  clinicId: string;
  condition: string;
  treatment: string;
  doctorId: string;
  diagnosisDate: Date;
  notes: string | null;
  createdAt: Date;
}
