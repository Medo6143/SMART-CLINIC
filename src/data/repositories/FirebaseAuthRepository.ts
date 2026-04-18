import { auth, db } from "@/lib/firebase/config";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  sendPasswordResetEmail,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import type { AuthRepository } from "@/domain/repositories/AuthRepository";
import type { User } from "@/domain/entities/User";
import type { UserRole } from "@/domain/value-objects/UserRole";
import { Collections } from "@/constants/collections";

export class FirebaseAuthRepository implements AuthRepository {
  private googleProvider = new GoogleAuthProvider();

  async signInWithEmail(email: string, password: string): Promise<User> {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return this.resolveUserProfile(result.user);
  }

  async signInWithGoogle(): Promise<User> {
    const result = await signInWithPopup(auth, this.googleProvider);
    return this.resolveUserProfile(result.user);
  }

  async signUpWithEmail(email: string, password: string, displayName: string, role: UserRole = "patient"): Promise<User> {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    return this.createUserDocument(result.user, displayName, role);
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }


  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;
    return this.resolveUserProfile(firebaseUser);
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await this.resolveUserProfile(firebaseUser);
          callback(user);
        } catch (err) {
          console.error("[Auth] resolveUserProfile failed:", err);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  async getIdTokenClaims(): Promise<{ role: UserRole; clinicId: string | null } | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;
    const token = await firebaseUser.getIdTokenResult();
    return {
      role: (token.claims.role as UserRole) ?? "patient",
      clinicId: (token.claims.clinicId as string) ?? null,
    };
  }

  // ── Private helpers ──────────────────────────────────

  private async resolveUserProfile(firebaseUser: FirebaseUser): Promise<User> {
    const userDocRef = doc(db, Collections.USERS, firebaseUser.uid);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      return this.mapDocToUser(snap.id, snap.data());
    }
    return this.createUserDocument(firebaseUser, firebaseUser.displayName ?? "", "patient");
  }

  private async createUserDocument(firebaseUser: FirebaseUser, displayName: string, role: UserRole): Promise<User> {
    const now = new Date();
    const userData: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? "",
      displayName,
      phone: firebaseUser.phoneNumber ?? null,
      photoURL: firebaseUser.photoURL ?? null,
      role,
      clinicId: null,
      languagePrefs: "en",
      createdAt: now,
      updatedAt: now,
    };

    const userDocRef = doc(db, Collections.USERS, firebaseUser.uid);
    await setDoc(userDocRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return userData;
  }

  private mapDocToUser(uid: string, data: Record<string, unknown>): User {
    return {
      uid,
      email: (data.email as string) ?? "",
      displayName: (data.displayName as string) ?? "",
      phone: (data.phone as string) ?? null,
      photoURL: (data.photoURL as string) ?? null,
      role: (data.role as UserRole) ?? "patient",
      clinicId: (data.clinicId as string) ?? null,
      languagePrefs: (data.languagePrefs as "en" | "ar") ?? "en",
      createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(),
      updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(),
    };
  }
}
