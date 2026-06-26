export type UserRole = "admin" | "barber" | "client";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}