import { 
  AppointmentRepository 
} from "@/domain/repositories/AppointmentRepository";
import { 
  getFirestore, doc, getDoc 
} from "firebase/firestore";
import { app } from "@/lib/firebase/config";
import { User } from "@/domain/entities/User";

export function createGetDoctorPatientsUseCase(repo: AppointmentRepository) {
  const db = getFirestore(app);

  return async (doctorId: string): Promise<User[]> => {
    const appointments = await repo.getByDoctor(doctorId);
    const patientIds = Array.from(new Set(appointments.map((a) => a.patientId)));
    
    // In a real app, this would be a bulk fetch or a join. 
    // Here we'll fetch them individually for simplicity in Phase 2.
    const patients = await Promise.all(
      patientIds.map(async (pid) => {
        const userDoc = await getDoc(doc(db, "users", pid));
        return {
          uid: pid,
          ...userDoc.data()
        } as User;
      })
    );
    
    return patients.filter(p => !!p.uid);
  };
}
