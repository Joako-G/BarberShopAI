import { z } from "zod";

export const createBarberSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().min(1, "Full name is required").max(200),
  phone: z.string().max(30).nullable().optional(),
});

export type CreateBarberDto = z.infer<typeof createBarberSchema>;

export interface BarberResponse {
  user: {
    id: string;
    email: string;
  };
  profile: {
    id: string;
    full_name: string;
    role: "barber";
    is_active: true;
  };
}