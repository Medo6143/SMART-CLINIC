import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { app } from "@/lib/firebase/config";
import { Prescription } from "@/domain/entities/Prescription";
import { PrescriptionRepository } from "@/domain/repositories/PrescriptionRepository";

export class FirebasePrescriptionRepository implements PrescriptionRepository {
  private db = getFirestore(app);
  private collectionName = "prescriptions";

  async getById(id: string): Promise<Prescription | null> {
    const docRef = doc(this.db, this.collectionName, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return this.mapDocToPrescription(snap.id, snap.data());
  }

  async getByPatient(patientId: string): Promise<Prescription[]> {
    const colRef = collection(this.db, this.collectionName);
    const q = query(colRef, where("patientId", "==", patientId));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => this.mapDocToPrescription(d.id, d.data()))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getByDoctor(doctorId: string): Promise<Prescription[]> {
    const colRef = collection(this.db, this.collectionName);
    const q = query(colRef, where("doctorId", "==", doctorId));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => this.mapDocToPrescription(d.id, d.data()))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getByClinic(clinicId: string): Promise<Prescription[]> {
    const colRef = collection(this.db, this.collectionName);
    const q = query(colRef, where("clinicId", "==", clinicId));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => this.mapDocToPrescription(d.id, d.data()))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async add(data: Omit<Prescription, "id" | "createdAt">): Promise<string> {
    const colRef = collection(this.db, this.collectionName);
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async update(id: string, data: Partial<Prescription>): Promise<void> {
    const docRef = doc(this.db, this.collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(this.db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  private mapDocToPrescription(id: string, data: Record<string, any>): Prescription {
    return {
      ...data,
      id,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
    } as Prescription;
  }
}
