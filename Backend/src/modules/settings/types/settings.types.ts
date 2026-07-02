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

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must use HH:MM format");

export const businessHourSchema = z
  .object({
    day_of_week: z
      .number()
      .int("day_of_week must be an integer")
      .min(0, "day_of_week must be between 0 and 6")
      .max(6, "day_of_week must be between 0 and 6"),
    is_open: z.boolean(),
    start_time: timeSchema.nullable().optional(),
    end_time: timeSchema.nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.is_open) return;

    if (!value.start_time) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["start_time"],
        message: "start_time is required when the day is open",
      });
    }

    if (!value.end_time) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_time"],
        message: "end_time is required when the day is open",
      });
    }

    if (value.start_time && value.end_time && value.start_time >= value.end_time) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_time"],
        message: "end_time must be greater than start_time",
      });
    }
  });

export const updateBusinessHoursSchema = z
  .object({
    hours: z
      .array(businessHourSchema)
      .length(7, "Exactly 7 days must be provided"),
  })
  .superRefine((value, ctx) => {
    const days = new Set<number>();

    value.hours.forEach((hour, index) => {
      if (days.has(hour.day_of_week)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hours", index, "day_of_week"],
          message: "day_of_week cannot be repeated",
        });
      }

      days.add(hour.day_of_week);
    });
  });

export type BusinessHourDto = z.infer<typeof businessHourSchema>;
export type UpdateBusinessHoursDto = z.infer<typeof updateBusinessHoursSchema>;

export interface BusinessHour {
  id: string;
  day_of_week: number;
  is_open: boolean;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  updated_at: string;
}
