export const UserRoles = {
  PATIENT: "patient",
  DOCTOR: "doctor",
  ADMIN: "admin",
  SUPER_ADMIN: "superadmin",
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

export function isAdminRole(role: UserRole): boolean {
  return role === UserRoles.ADMIN || role === UserRoles.SUPER_ADMIN;
}

export function canAccessClinic(role: UserRole, userClinicId: string | null, targetClinicId: string): boolean {
  if (role === UserRoles.SUPER_ADMIN) return true;
  return userClinicId === targetClinicId;
}
