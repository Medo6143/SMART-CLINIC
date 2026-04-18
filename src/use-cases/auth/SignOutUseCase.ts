import type { AuthRepository } from "../../domain/repositories/AuthRepository";

export function createSignOutUseCase(authRepo: AuthRepository) {
  return async (): Promise<void> => {
    return authRepo.signOut();
  };
}
