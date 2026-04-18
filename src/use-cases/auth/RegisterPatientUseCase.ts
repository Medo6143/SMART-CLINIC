import type { AuthRepository } from "../../domain/repositories/AuthRepository";
import type { User } from "../../domain/entities/User";

export interface RegisterPatientInput {
  email: string;
  password: string;
  displayName: string;
}

export function createRegisterPatientUseCase(authRepo: AuthRepository) {
  return async (input: RegisterPatientInput): Promise<User> => {
    return authRepo.signUpWithEmail(input.email, input.password, input.displayName, "patient");
  };
}
