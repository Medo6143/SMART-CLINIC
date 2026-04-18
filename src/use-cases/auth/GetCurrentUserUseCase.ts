import type { AuthRepository } from "../../domain/repositories/AuthRepository";
import type { User } from "../../domain/entities/User";

export function createGetCurrentUserUseCase(authRepo: AuthRepository) {
  return async (): Promise<User | null> => {
    return authRepo.getCurrentUser();
  };
}
