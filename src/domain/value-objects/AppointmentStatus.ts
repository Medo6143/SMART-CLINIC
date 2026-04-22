export const AppointmentStatuses = {
  /** Created, awaiting payment within deadline */
  PENDING: "pending",
  /** Legacy alias kept for backwards compat */
  PENDING_PAYMENT: "pending_payment",
  /** Payment received, awaiting clinic manual approval */
  PENDING_APPROVAL: "pending_approval",
  /** Clinic approved — patient/doctor notified */
  CONFIRMED: "confirmed",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  /** Clinic rejected after payment (triggers refund flow) */
  REJECTED: "rejected",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
} as const;

export type AppointmentStatus = (typeof AppointmentStatuses)[keyof typeof AppointmentStatuses];

export const AppointmentTypes = {
  ONLINE: "online",
} as const;

export type AppointmentType = (typeof AppointmentTypes)[keyof typeof AppointmentTypes];

export const AppointmentPriorities = {
  NORMAL: "normal",
  URGENT: "urgent",
  EMERGENCY: "emergency",
} as const;

export type AppointmentPriority = (typeof AppointmentPriorities)[keyof typeof AppointmentPriorities];

export const ConsultationModes = {
  ONLINE: "online",
  OFFLINE: "offline",
} as const;

export type ConsultationMode = (typeof ConsultationModes)[keyof typeof ConsultationModes];

export function isTerminalStatus(status: AppointmentStatus): boolean {
  return (
    status === AppointmentStatuses.COMPLETED ||
    status === AppointmentStatuses.CANCELLED ||
    status === AppointmentStatuses.REJECTED ||
    status === AppointmentStatuses.NO_SHOW
  );
}

export function canCancel(status: AppointmentStatus): boolean {
  return (
    status === AppointmentStatuses.PENDING ||
    status === AppointmentStatuses.PENDING_PAYMENT ||
    status === AppointmentStatuses.PENDING_APPROVAL ||
    status === AppointmentStatuses.CONFIRMED
  );
}

export function isPendingPayment(status: AppointmentStatus): boolean {
  return (
    status === AppointmentStatuses.PENDING ||
    status === AppointmentStatuses.PENDING_PAYMENT
  );
}

export function requiresClinicAction(status: AppointmentStatus): boolean {
  return status === AppointmentStatuses.PENDING_APPROVAL;
}
