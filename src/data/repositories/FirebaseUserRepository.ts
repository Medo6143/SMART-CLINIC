import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { User } from "@/domain/entities/User";
import { Collections } from "@/constants/collections";

export class FirebaseUserRepository {
  async getById(id: string): Promise<User | null> {
    const docRef = doc(db, Collections.USERS, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return this.mapDocToUser(snap.id, snap.data());
  }

  async getAll(): Promise<User[]> {
    const q = query(collection(db, Collections.USERS));
    const snap = await getDocs(q);
    return snap.docs.map(doc => this.mapDocToUser(doc.id, doc.data()));
  }

  async getByPhone(phone: string): Promise<User | null> {
    const q = query(
      collection(db, Collections.USERS),
      where("phone", "==", phone)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return this.mapDocToUser(doc.id, doc.data());
  }

  async update(uid: string, data: Partial<User>): Promise<void> {
    const docRef = doc(db, Collections.USERS, uid);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  /** Subscribe to real-time updates for a specific user */
  subscribeToUser(uid: string, callback: (user: User | null) => void): () => void {
    const docRef = doc(db, Collections.USERS, uid);
    return onSnapshot(docRef, (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }
      callback(this.mapDocToUser(snap.id, snap.data()));
    }, () => {});
  }

  private mapDocToUser(uid: string, data: any): User {
    return {
      ...data,
      uid,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
    } as User;
  }
}
