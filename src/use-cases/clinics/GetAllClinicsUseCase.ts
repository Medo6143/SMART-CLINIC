import type { ClinicRepository } from "../../domain/repositories/ClinicRepository";
import type { Clinic } from "../../domain/entities/Clinic";

export function createGetAllClinicsUseCase(clinicRepo: ClinicRepository) {
  return async (): Promise<Clinic[]> => {
    return clinicRepo.getAll();
  };
}
