import type { ClinicRepository } from "../../domain/repositories/ClinicRepository";
import type { UpdateClinicInput } from "../../domain/entities/Clinic";

export function createUpdateClinicUseCase(clinicRepo: ClinicRepository) {
  return async (id: string, data: UpdateClinicInput): Promise<void> => {
    return clinicRepo.update(id, data);
  };
}
