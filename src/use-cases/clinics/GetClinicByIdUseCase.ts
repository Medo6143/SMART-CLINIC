import type { ClinicRepository } from "../../domain/repositories/ClinicRepository";
import type { Clinic } from "../../domain/entities/Clinic";
import { AppError, ErrorCodes } from "../../constants/errors";

export function createGetClinicByIdUseCase(clinicRepo: ClinicRepository) {
  return async (id: string): Promise<Clinic> => {
    const clinic = await clinicRepo.getById(id);
    if (!clinic) {
      throw new AppError(ErrorCodes.NOT_FOUND, `Clinic with id ${id} not found`);
    }
    return clinic;
  };
}
