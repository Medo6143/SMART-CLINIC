import { 
  AppointmentRepository 
} from "@/domain/repositories/AppointmentRepository";
import { 
  Appointment, 
  CreateAppointmentInput 
} from "@/domain/entities/Appointment";

export function createGetPatientAppointmentsUseCase(repo: AppointmentRepository) {
  return async (patientId: string): Promise<Appointment[]> => {
    return repo.getByPatient(patientId);
  };
}

export function createBookAppointmentUseCase(repo: AppointmentRepository) {
  return async (input: CreateAppointmentInput): Promise<string> => {
    return repo.create(input);
  };
}
