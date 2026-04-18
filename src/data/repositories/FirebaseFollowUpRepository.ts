import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  query,
  where,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { app } from "@/lib/firebase/config";
import type { FollowUp, PatientFollowUpResponse } from "@/domain/entities/FollowUp";

const db = getFirestore(app);
const COL = "followUps";

function mapDoc(id: string, data: Record<string, unknown>): FollowUp {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as Record<string, any>;
  return {
    ...d,
    id,
    sentAt: d.sentAt instanceof Timestamp ? d.sentAt.toDate() : new Date(d.sentAt ?? Date.now()),
    createdAt: d.createdAt instanceof Timestamp ? d.createdAt.toDate() : new Date(d.createdAt ?? Date.now()),
    updatedAt: d.updatedAt instanceof Timestamp ? d.updatedAt.toDate() : new Date(d.updatedAt ?? Date.now()),
    patientResponse: d.patientResponse
      ? {
          ...d.patientResponse,
          respondedAt: d.patientResponse.respondedAt instanceof Timestamp
            ? d.patientResponse.respondedAt.toDate()
            : new Date(d.patientResponse.respondedAt ?? Date.now()),
        }
      : null,
  } as FollowUp;
}

export class FirebaseFollowUpRepository {
  async getById(id: string): Promise<FollowUp | null> {
    const snap = await getDoc(doc(db, COL, id));
    if (!snap.exists()) return null;
    return mapDoc(snap.id, snap.data());
  }

  async getByPatient(patientId: string): Promise<FollowUp[]> {
    const q = query(collection(db, COL), where("patientId", "==", patientId));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => mapDoc(d.id, d.data() as Record<string, unknown>))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async submitPatientResponse(id: string, response: PatientFollowUpResponse): Promise<void> {
    await updateDoc(doc(db, COL, id), {
      patientResponse: {
        ...response,
        respondedAt: Timestamp.fromDate(response.respondedAt),
      },
      status: "responded",
      updatedAt: serverTimestamp(),
    });
  }
}
