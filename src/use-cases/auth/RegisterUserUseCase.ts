import type { AuthRepository } from "../../domain/repositories/AuthRepository";
import type { User } from "../../domain/entities/User";
import type { UserRole } from "../../domain/value-objects/UserRole";

export interface RegisterUserInput {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
}

export function createRegisterUserUseCase(authRepo: AuthRepository) {
  return async (input: RegisterUserInput): Promise<User> => {
    return authRepo.signUpWithEmail(input.email, input.password, input.displayName, input.role);
  };
}
