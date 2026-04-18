import { 
  AppointmentRepository 
} from "@/domain/repositories/AppointmentRepository";
import { 
  Appointment 
} from "@/domain/entities/Appointment";

export function createGetDoctorAppointmentsUseCase(repo: AppointmentRepository) {
  return async (doctorId: string, date?: Date): Promise<Appointment[]> => {
    return repo.getByDoctor(doctorId, date);
  };
}

export function createUpdateAppointmentStatusUseCase(repo: AppointmentRepository) {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  return async (id: string, status: any): Promise<void> => {
    return repo.updateStatus(id, status);
  };
}
