import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { app } from "@/lib/firebase/config";
import { Clinic, CreateClinicInput, UpdateClinicInput } from "@/domain/entities/Clinic";
import { ClinicRepository } from "@/domain/repositories/ClinicRepository";
import { User } from "@/domain/entities/User";
import { Collections } from "@/constants/collections";

export class FirebaseClinicRepository implements ClinicRepository {
  private db = getFirestore(app);
  private collectionName = Collections.CLINICS;

  async getAll(): Promise<Clinic[]> {
    const colRef = collection(this.db, this.collectionName);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    } as Clinic));
  }

  async getById(id: string): Promise<Clinic | null> {
    const docRef = doc(this.db, this.collectionName, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Clinic;
  }

  async create(data: CreateClinicInput): Promise<string> {
    const docRef = doc(collection(this.db, this.collectionName));
    const clinic: Clinic = {
      ...data,
      id: docRef.id,
      isActive: true,
      createdAt: new Date(),
    };
    await setDoc(docRef, clinic);
    return docRef.id;
  }

  async update(id: string, data: UpdateClinicInput): Promise<void> {
    const docRef = doc(this.db, this.collectionName, id);
    await updateDoc(docRef, data);
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(this.db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async getDoctors(clinicId: string): Promise<User[]> {
    const clinicRef = doc(this.db, this.collectionName, clinicId);
    const clinicSnap = await getDoc(clinicRef);
    if (!clinicSnap.exists()) return [];

    const data = clinicSnap.data();
    const drIds = (data.doctorIds || []) as string[];
    if (drIds.length === 0) return [];

    // Fetch each doctor individually (uses Firestore 'get' rule which
    // allows any authenticated user to read doctor profiles)
    const results = await Promise.all(
      drIds.map((id) => getDoc(doc(this.db, "users", id)))
    );
    return results
      .filter((snap) => snap.exists())
      .map((snap) => ({
        uid: snap.id,
        ...(snap.data() as any),
      } as unknown as User))
      .filter((u) => u.role === "doctor");
  }


  async getAvailableSlots(_clinicId: string, _doctorId: string, _date: Date): Promise<string[]> {
    // This would ideally call a cloud function or perform 
    // complex logic with appointments and clinic settings.
    // Placeholder logic:
    return ["09:00", "09:30", "10:00", "10:30"];
  }
}
