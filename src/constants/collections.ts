/**
 * Firestore collection name constants.
 * Single source of truth — prevents typos across all apps.
 */
export const Collections = {
  CLINICS: "clinics",
  USERS: "users",
  APPOINTMENTS: "appointments",
  PAYMENTS: "payments",
  CHAT_ROOMS: "chatRooms",
  MESSAGES: "messages",
  STAFF: "staff",
  FINANCE: "finance",
  PRESCRIPTIONS: "prescriptions",
  MEDICAL_HISTORY: "medicalHistories",
  WORKING_HOURS: "workingHours",
  DOCTOR_SCHEDULES: "doctorSchedules",
  MEET_LINKS: "meetLinks",
} as const;
