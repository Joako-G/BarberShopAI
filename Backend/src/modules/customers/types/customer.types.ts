import { z } from "zod";
import { normalizePhone } from "../utils/phone.utils";

export const customerPhoneSchema = z
  .string()
  .transform(normalizePhone)
  .refine((value) => value.length >= 7 && value.length <= 20, {
    message: "Phone must contain between 7 and 20 digits",
  });

export const createCustomerSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required").max(200),
  phone: customerPhoneSchema,
  email: z.string().email("Valid email is required").nullable().optional(),
});

export const updateCustomerSchema = z.object({
  full_name: z.string().trim().min(1).max(200).optional(),
  phone: customerPhoneSchema.optional(),
  email: z.string().email("Valid email is required").nullable().optional(),
});

export const customerIdSchema = z.object({
  id: z.string().uuid("Invalid customer ID"),
});

export const findByPhoneSchema = z.object({
  phone: customerPhoneSchema,
});

export type CreateCustomerDto = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerDto = z.infer<typeof updateCustomerSchema>;

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  created_at: string;
  updated_at: string | null;
}
