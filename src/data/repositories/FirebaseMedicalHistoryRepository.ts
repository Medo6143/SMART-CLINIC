import {
  getFirestore,
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { app } from "@/lib/firebase/config";
import { MedicalHistory } from "@/domain/entities/MedicalHistory";
import { MedicalHistoryRepository } from "@/domain/repositories/MedicalHistoryRepository";
import { Collections } from "@/constants/collections";

export class FirebaseMedicalHistoryRepository implements MedicalHistoryRepository {
  private db = getFirestore(app);
  private collectionName = Collections.MEDICAL_HISTORY;

  async getByPatient(patientId: string): Promise<MedicalHistory[]> {
    const colRef = collection(this.db, this.collectionName);
    const q = query(
      colRef,
      where("patientId", "==", patientId),
      orderBy("diagnosisDate", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => this.mapDocToRecord(d.id, d.data()));
  }

  async getByPatientAndClinic(patientId: string, clinicId: string): Promise<MedicalHistory[]> {
    const colRef = collection(this.db, this.collectionName);
    const q = query(
      colRef,
      where("patientId", "==", patientId),
      where("clinicId", "==", clinicId),
      orderBy("diagnosisDate", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => this.mapDocToRecord(d.id, d.data()));
  }

  async add(_patientId: string, data: Omit<MedicalHistory, "id" | "createdAt">): Promise<string> {
    const colRef = collection(this.db, this.collectionName);
    const docRef = await addDoc(colRef, {
      ...data,
      diagnosisDate: Timestamp.fromDate(data.diagnosisDate),
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async update(_patientId: string, recordId: string, data: Partial<MedicalHistory>): Promise<void> {
    const docRef = doc(this.db, this.collectionName, recordId);
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const updateData: Record<string, any> = { ...data };
    if (data.diagnosisDate) {
      updateData.diagnosisDate = Timestamp.fromDate(data.diagnosisDate);
    }
    await updateDoc(docRef, updateData);
  }

  async delete(_patientId: string, recordId: string): Promise<void> {
    const docRef = doc(this.db, this.collectionName, recordId);
    await deleteDoc(docRef);
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  private mapDocToRecord(id: string, data: Record<string, any>): MedicalHistory {
    return {
      ...data,
      id,
      diagnosisDate: data.diagnosisDate instanceof Timestamp ? data.diagnosisDate.toDate() : new Date(data.diagnosisDate),
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
    } as MedicalHistory;
  }
}
