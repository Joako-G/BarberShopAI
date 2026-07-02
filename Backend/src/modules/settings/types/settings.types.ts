import { z } from "zod";

const emptyStringToNull = (value: unknown): unknown => {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const optionalTextSchema = (max: number) =>
  z.preprocess(
    emptyStringToNull,
    z.string().max(max).nullable().optional()
  );

export const updateGeneralSettingsSchema = z.object({
  system_name: z
    .string()
    .trim()
    .min(2, "System name must contain at least 2 characters")
    .max(60, "System name cannot exceed 60 characters"),
  business_name: z
    .string()
    .trim()
    .min(2, "Business name must contain at least 2 characters")
    .max(80, "Business name cannot exceed 80 characters"),
  business_type: optionalTextSchema(60),
  description: optionalTextSchema(300),
  phone: optionalTextSchema(30),
  whatsapp: optionalTextSchema(30),
  email: z.preprocess(
    emptyStringToNull,
    z.string().email("Valid email is required").nullable().optional()
  ),
  address: optionalTextSchema(150),
});

export type UpdateGeneralSettingsDto = z.infer<typeof updateGeneralSettingsSchema>;

export interface BusinessSettings {
  id: string;
  system_name: string;
  business_name: string;
  business_type: string | null;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

