import { z } from "zod";
import { UserRole } from "../../../shared/types";

export const profileRoles = ["admin", "barber", "client"] as const;

export const createProfileSchema = z.object({
  id: z.string().uuid("Valid user ID is required"),
  full_name: z.string().min(1, "Full name is required").max(200),
  phone: z.string().max(30).nullable().optional(),
  role: z.enum(profileRoles, { required_error: "Role is required" }),
  is_active: z.boolean().optional().default(true),
});

export const updateProfileSchema = z.object({
  full_name: z.string().min(1).max(200).optional(),
  phone: z.string().max(30).nullable().optional(),
  role: z.enum(profileRoles).optional(),
  is_active: z.boolean().optional(),
});

export const profileIdSchema = z.object({
  id: z.string().uuid("Invalid profile ID"),
});

export type CreateProfileDto = z.infer<typeof createProfileSchema>;
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}