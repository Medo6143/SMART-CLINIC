import type { User } from "../entities/User";
import type { UserRole } from "../value-objects/UserRole";

export interface AuthRepository {
  signInWithEmail(email: string, password: string): Promise<User>;
  signInWithGoogle(): Promise<User>;
  signUpWithEmail(email: string, password: string, displayName: string, role: UserRole): Promise<User>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
  getIdTokenClaims(): Promise<{ role: UserRole; clinicId: string | null } | null>;
  sendPasswordResetEmail(email: string): Promise<void>;
}
