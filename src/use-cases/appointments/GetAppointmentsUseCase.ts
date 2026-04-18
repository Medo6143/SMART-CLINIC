import type { AppointmentRepository } from "../../domain/repositories/AppointmentRepository";
import type { Appointment } from "../../domain/entities/Appointment";

export function createGetPatientAppointmentsUseCase(appointmentRepo: AppointmentRepository) {
  return async (patientId: string): Promise<Appointment[]> => {
    return appointmentRepo.getByPatient(patientId);
  };
}

export function createGetDoctorAppointmentsUseCase(appointmentRepo: AppointmentRepository) {
  return async (doctorId: string, date?: Date): Promise<Appointment[]> => {
    return appointmentRepo.getByDoctor(doctorId, date);
  };
}
