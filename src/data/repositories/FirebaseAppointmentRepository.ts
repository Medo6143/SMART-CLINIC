import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { app } from "@/lib/firebase/config";
import { 
  Appointment, 
  CreateAppointmentInput, 
  AppointmentFilters 
} from "@/domain/entities/Appointment";
import { AppointmentStatus } from "@/domain/value-objects/AppointmentStatus";
import { AppointmentRepository, ApprovalPayload, RejectionPayload } from "@/domain/repositories/AppointmentRepository";
import { Collections } from "@/constants/collections";

/** Payment window in milliseconds (30 minutes) */
const PAYMENT_DEADLINE_MS = 30 * 60 * 1000;

export class FirebaseAppointmentRepository implements AppointmentRepository {
  private db = getFirestore(app);
  private collectionName = Collections.APPOINTMENTS;

  async create(data: CreateAppointmentInput): Promise<string> {
    const docRef = doc(collection(this.db, this.collectionName));
    const isOnlineBooking = data.bookingOrigin === "online";
    const paymentDeadlineAt = isOnlineBooking
      ? new Date(Date.now() + PAYMENT_DEADLINE_MS).toISOString()
      : null;

    // Calculate turnNumber
    const targetDate = data.date instanceof Date ? data.date : new Date(data.date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const qCount = query(
      collection(this.db, this.collectionName),
      where("doctorId", "==", data.doctorId),
      where("date", ">=", Timestamp.fromDate(startOfDay)),
      where("date", "<=", Timestamp.fromDate(endOfDay))
    );
    const existingSnap = await getDocs(qCount);
    const turnNumber = existingSnap.size + 1;

    const appointment: Appointment = {
      ...data,
      id: docRef.id,
      turnNumber,
      // Online bookings start as PENDING until payment; walk-ins go straight to CONFIRMED
      status: isOnlineBooking ? "pending" : "confirmed",
      consultationMode: data.consultationMode ?? "offline",
      paymentStatus: "unpaid",
      paymentId: null,
      paymentDeadlineAt,
      meetLink: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(docRef, {
      ...appointment,
      date: Timestamp.fromDate(data.date),
      approvedAt: null,
      rejectedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return docRef.id;
  }

  async getById(id: string): Promise<Appointment | null> {
    const docRef = doc(this.db, this.collectionName, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return this.mapDocToAppointment(snap.id, snap.data());
  }

  async getByPatient(patientId: string): Promise<Appointment[]> {
    const colRef = collection(this.db, this.collectionName);
    const q = query(
      colRef,
      where("patientId", "==", patientId)
    );
    const snap = await getDocs(q);
    const results = snap.docs.map((d) => this.mapDocToAppointment(d.id, d.data()));
    return results.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getByDoctor(doctorId: string, date?: Date): Promise<Appointment[]> {
    const colRef = collection(this.db, this.collectionName);
    const q = query(
      colRef,
      where("doctorId", "==", doctorId),
      orderBy("date", "asc")
    );
    
    const snap = await getDocs(q);
    let results = snap.docs.map((d) => this.mapDocToAppointment(d.id, d.data()));
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      results = results.filter(a => a.date >= startOfDay && a.date <= endOfDay);
    }
    
    return results;
  }

  async getByClinic(clinicId: string, filters?: AppointmentFilters): Promise<Appointment[]> {
    const colRef = collection(this.db, this.collectionName);
    let q = query(colRef, where("clinicId", "==", clinicId), orderBy("date", "desc"));
    
    if (filters?.status) {
      q = query(colRef, where("clinicId", "==", clinicId), where("status", "==", filters.status), orderBy("date", "desc"));
    }
    if (filters?.doctorId) {
      q = query(colRef, where("clinicId", "==", clinicId), where("doctorId", "==", filters.doctorId), orderBy("date", "desc"));
    }
    
    const snap = await getDocs(q);
    let results = snap.docs.map((d) => this.mapDocToAppointment(d.id, d.data()));

    // Client-side date range filtering
    if (filters?.dateFrom) {
      results = results.filter(a => a.date >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      results = results.filter(a => a.date <= filters.dateTo!);
    }

    return results;
  }

  async updateStatus(id: string, status: AppointmentStatus): Promise<void> {
    const docRef = doc(this.db, this.collectionName, id);
    await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
  }

  async approve(id: string, payload: ApprovalPayload): Promise<void> {
    const docRef = doc(this.db, this.collectionName, id);
    await updateDoc(docRef, {
      status: "confirmed",
      approvedBy: payload.approvedBy,
      approvedAt: Timestamp.fromDate(payload.approvedAt),
      meetLink: payload.meetLink ?? null,
      updatedAt: serverTimestamp(),
    });
  }

  async reject(id: string, payload: RejectionPayload): Promise<void> {
    const docRef = doc(this.db, this.collectionName, id);
    await updateDoc(docRef, {
      status: "rejected",
      rejectedBy: payload.rejectedBy,
      rejectedAt: Timestamp.fromDate(payload.rejectedAt),
      rejectionReason: payload.rejectionReason,
      updatedAt: serverTimestamp(),
    });
  }

  async reschedule(id: string, newDate: Date, slotTime: string, rescheduledBy: string): Promise<string> {
    // Get original appointment
    const original = await this.getById(id);
    if (!original) throw new Error("Appointment not found");

    // Create new appointment
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = original;
    const newId = await this.create({
      ...rest,
      date: newDate,
      slotTime,
      status: "confirmed",
      rescheduledFromId: id,
    } as CreateAppointmentInput);

    // Link original to new
    await updateDoc(doc(this.db, this.collectionName, id), {
      status: "cancelled",
      rescheduledToId: newId,
      updatedAt: serverTimestamp(),
    });

    return newId;
  }

  async update(id: string, data: Partial<Appointment>): Promise<void> {
    const docRef = doc(this.db, this.collectionName, id);
    const updateData: Record<string, unknown> = { ...data, updatedAt: serverTimestamp() };
    if (data.date) {
      updateData.date = Timestamp.fromDate(data.date);
    }
    await updateDoc(docRef, updateData);
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(this.db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  subscribeToQueue(
    doctorId: string,
    callback: (appointments: Appointment[]) => void
  ): () => void {
    const colRef = collection(this.db, this.collectionName);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const q = query(
      colRef,
      where("doctorId", "==", doctorId),
      where("date", ">=", Timestamp.fromDate(today)),
      orderBy("date", "asc")
    );
    
    return onSnapshot(q, (snap) => {
      const appointments = snap.docs.map(d => this.mapDocToAppointment(d.id, d.data()));
      callback(appointments);
    }, () => {});
  }

  subscribeToClinicQueue(
    clinicId: string,
    filters: AppointmentFilters,
    callback: (appointments: Appointment[]) => void
  ): () => void {
    const colRef = collection(this.db, this.collectionName);
    const constraints: Parameters<typeof query>[1][] = [
      where("clinicId", "==", clinicId),
      orderBy("date", "asc"),
    ];
    if (filters.status) {
      constraints.push(where("status", "==", filters.status));
    }
    const q = query(colRef, ...constraints);

    return onSnapshot(q, (snap) => {
      const appointments = snap.docs.map(d => this.mapDocToAppointment(d.id, d.data()));
      callback(appointments);
    }, () => {});
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapDocToAppointment(id: string, data: Record<string, any>): Appointment {
    return {
      ...data,
      id,
      date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
      approvedAt: data.approvedAt instanceof Timestamp ? data.approvedAt.toDate() : data.approvedAt ?? null,
      rejectedAt: data.rejectedAt instanceof Timestamp ? data.rejectedAt.toDate() : data.rejectedAt ?? null,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt ?? Date.now()),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt ?? Date.now()),
    } as Appointment;
  }
}
