import { useState, useEffect } from "react";
import { FirebaseAppointmentRepository } from "@/data/repositories/FirebaseAppointmentRepository";
import { Appointment } from "@/domain/entities/Appointment";

const appointmentRepo = new FirebaseAppointmentRepository();

export function useAppointments(doctorId?: string, patientId?: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    if (doctorId) {
      unsubscribe = appointmentRepo.subscribeToQueue(doctorId, (data) => {
        setAppointments(data);
        setIsLoading(false);
      });
    } else if (patientId) {
      const fetchAppointments = async () => {
        try {
          const data = await appointmentRepo.getByPatient(patientId);
          setAppointments(data);
        } catch (err: any) {
          setError(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchAppointments();
    } else {
      setIsLoading(false);
    }

    return () => unsubscribe();
  }, [doctorId, patientId]);

  const updateStatus = async (id: string, status: any) => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    await appointmentRepo.updateStatus(id, status as any);
  };

  return { appointments, isLoading, error, updateStatus };
}
