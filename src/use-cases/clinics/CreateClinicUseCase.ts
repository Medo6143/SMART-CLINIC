import type { ClinicRepository } from "../../domain/repositories/ClinicRepository";
import type { CreateClinicInput } from "../../domain/entities/Clinic";

export function createCreateClinicUseCase(clinicRepo: ClinicRepository) {
  return async (data: CreateClinicInput): Promise<string> => {
    return clinicRepo.create(data);
  };
}
