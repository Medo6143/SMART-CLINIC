/**
 * Application error codes.
 * Use these in error objects for consistent error handling across all apps.
 */
export const ErrorCodes = {
  // Auth
  AUTH_INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  AUTH_USER_NOT_FOUND: "AUTH_USER_NOT_FOUND",
  AUTH_EMAIL_ALREADY_IN_USE: "AUTH_EMAIL_ALREADY_IN_USE",
  AUTH_UNAUTHORIZED: "AUTH_UNAUTHORIZED",
  AUTH_FORBIDDEN: "AUTH_FORBIDDEN",

  // Appointments
  APPOINTMENT_NOT_FOUND: "APPOINTMENT_NOT_FOUND",
  APPOINTMENT_SLOT_TAKEN: "APPOINTMENT_SLOT_TAKEN",
  APPOINTMENT_CANNOT_CANCEL: "APPOINTMENT_CANNOT_CANCEL",

  // Payments
  PAYMENT_INITIATION_FAILED: "PAYMENT_INITIATION_FAILED",
  PAYMENT_NOT_FOUND: "PAYMENT_NOT_FOUND",

  // General
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}
