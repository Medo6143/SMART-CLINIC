import type { AppointmentRepository } from "../../domain/repositories/AppointmentRepository";
import { canCancel } from "../../domain/value-objects/AppointmentStatus";
import { AppError, ErrorCodes } from "../../constants/errors";

export function createCancelAppointmentUseCase(appointmentRepo: AppointmentRepository) {
  return async (appointmentId: string): Promise<void> => {
    const appointment = await appointmentRepo.getById(appointmentId);
    if (!appointment) {
      throw new AppError(ErrorCodes.APPOINTMENT_NOT_FOUND, "Appointment not found");
    }
    if (!canCancel(appointment.status)) {
      throw new AppError(ErrorCodes.APPOINTMENT_CANNOT_CANCEL, "Cannot cancel this appointment");
    }
    await appointmentRepo.updateStatus(appointmentId, "cancelled");
  };
}
