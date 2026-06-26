import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginDto = z.infer<typeof loginSchema>;

export interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  profile: {
    id: string;
    full_name: string;
    phone: string;
    role: "admin";
    is_active: boolean;
  };
  token: string;
}