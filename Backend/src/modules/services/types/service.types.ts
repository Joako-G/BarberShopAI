import { z } from "zod";

export const createServiceSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200),

  description: z
    .string()
    .max(1000)
    .nullable()
    .optional(),

  duration_minutes: z
    .number()
    .int()
    .positive("Duration must be a positive integer"),

  buffer_minutes: z
    .number()
    .int()
    .min(0, "Buffer cannot be negative")
    .optional(),

  price: z
    .number()
    .nonnegative("Price cannot be negative"),

  is_active: z
    .boolean()
    .optional()
    .default(true),
});

export const updateServiceSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  duration_minutes: z.number().int().positive().optional(),
  buffer_minutes: z.number().int().min(0).optional(),
  price: z.number().nonnegative().optional(),
  is_active: z.boolean().optional(),
});

export const serviceIdSchema = z.object({
  id: z.string().uuid("Invalid service ID"),
});

export const updateServiceStatusSchema = z.object({
  is_active: z.boolean(),
});

export type CreateServiceDto = z.infer<typeof createServiceSchema>;
export type UpdateServiceDto = z.infer<typeof updateServiceSchema>;

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  buffer_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
}