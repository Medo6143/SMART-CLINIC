export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route?: string;
  instructions?: string;
}

export interface VitalSigns {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
}

export interface DiagnosisCode {
  code: string;
  label: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  clinicId: string;
  diagnosis?: string;
  diagnosisCodes?: DiagnosisCode[];
  medications: Medication[];
  vitalSigns?: VitalSigns | null;
  allergies?: string | null;
  patientInstructions?: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt?: Date;
}
