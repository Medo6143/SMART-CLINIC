import type { AuthRepository } from "../../domain/repositories/AuthRepository";
import type { User } from "../../domain/entities/User";

export function createSignInWithEmailUseCase(authRepo: AuthRepository) {
  return async (email: string, password: string): Promise<User> => {
    return authRepo.signInWithEmail(email, password);
  };
}

export function createSignInWithGoogleUseCase(authRepo: AuthRepository) {
  return async (): Promise<User> => {
    return authRepo.signInWithGoogle();
  };
}
