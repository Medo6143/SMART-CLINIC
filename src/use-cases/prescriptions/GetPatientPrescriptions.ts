import { Prescription } from "@/domain/entities/Prescription";
import { PrescriptionRepository } from "@/domain/repositories/PrescriptionRepository";

export const createGetPatientPrescriptionsUseCase = (repo: PrescriptionRepository) => {
  return async (patientId: string): Promise<Prescription[]> => {
    return repo.getByPatient(patientId);
  };
};
