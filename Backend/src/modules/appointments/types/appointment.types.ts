import { z } from "zod";
import { isValidCalendarDate } from "../../../shared/utils";
import { customerPhoneSchema } from "../../customers/types";

const appointmentDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
  .refine(isValidCalendarDate, "Date must be a valid calendar date");

export const appointmentStatusSchema = z.enum([
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
]);

export const createPublicAppointmentSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required").max(200),
  phone: customerPhoneSchema,
  email: z.preprocess(
    (value) => (value === "" ? null : value),
    z.string().email("Valid email is required").nullable().optional()
  ),
  service_id: z.string().uuid("Invalid service ID"),
  appointment_date: appointmentDateSchema,
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Time must be HH:MM")
    .refine((value) => {
      const [hours, minutes] = value.split(":").map(Number);
      return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
    }, "Time must be a valid 24-hour time"),
  notes: z.string().max(500).nullable().optional(),
});

const adminAppointmentBaseSchema = {
  service_id: z.string().uuid("Invalid service ID"),
  appointment_date: appointmentDateSchema,
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Time must be HH:MM")
    .refine((value) => {
      const [hours, minutes] = value.split(":").map(Number);
      return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
    }, "Time must be a valid 24-hour time"),
  notes: z.preprocess(
    (value) => (value === "" ? null : value),
    z.string().max(500).nullable().optional()
  ),
};

const createAdminAppointmentForExistingCustomerSchema = z
  .object({
    customer_mode: z.literal("existing").optional(),
    customer_id: z.string().uuid("Invalid customer ID"),
    ...adminAppointmentBaseSchema,
  })
  .strict()
  .transform((value) => ({
    ...value,
    customer_mode: "existing" as const,
  }));

const createAdminAppointmentForNewCustomerSchema = z
  .object({
    customer_mode: z.literal("new"),
    full_name: z.string().trim().min(1, "Full name is required").max(200),
    phone: customerPhoneSchema,
    email: z.preprocess(
      (value) => (value === "" ? null : value),
      z.string().email("Valid email is required").nullable().optional()
    ),
    ...adminAppointmentBaseSchema,
  })
  .strict();

export const createAdminAppointmentSchema = z.union([
  createAdminAppointmentForExistingCustomerSchema,
  createAdminAppointmentForNewCustomerSchema,
]);

export const updateAppointmentSchema = z
  .object({
    service_id: z.string().uuid("Invalid service ID").optional(),
    appointment_date: appointmentDateSchema.optional(),
    start_time: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Time must be HH:MM")
      .refine((value) => {
        const [hours, minutes] = value.split(":").map(Number);
        return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
      }, "Time must be a valid 24-hour time")
      .optional(),
    notes: z.preprocess(
      (value) => (value === "" ? null : value),
      z.string().max(500).nullable().optional()
    ),
  })
  .strict()
  .refine(
    (value) =>
      value.service_id !== undefined ||
      value.appointment_date !== undefined ||
      value.start_time !== undefined ||
      value.notes !== undefined,
    "At least one editable field is required"
  );

export const appointmentIdSchema = z.object({
  id: z.string().uuid("Invalid appointment ID"),
});

export const listAppointmentsQuerySchema = z.object({
  date: z.preprocess(
    (value) => (value === "" ? undefined : value),
    appointmentDateSchema.optional()
  ),
  status: z.preprocess(
    (value) => (value === "" ? undefined : value),
    appointmentStatusSchema.optional()
  ),
  customer: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().trim().min(1).max(200).optional()
  ),
});

export const availableSlotsQuerySchema = z.object({
  serviceId: z.string().uuid("Invalid service ID"),
  date: appointmentDateSchema,
  excludeAppointmentId: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().uuid("Invalid appointment ID").optional()
  ),
});

export type AvailableSlotsQuery = z.infer<typeof availableSlotsQuerySchema>;

export type CreatePublicAppointmentDto = z.infer<typeof createPublicAppointmentSchema>;

export type CreateAdminAppointmentDto = z.infer<typeof createAdminAppointmentSchema>;

export type UpdateAppointmentDto = z.infer<typeof updateAppointmentSchema>;

export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;

export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>;

export interface Appointment {
  id: string;
  customer_id: string;
  barber_id: string | null;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface AppointmentWithDetails extends Appointment {
  customer: {
    id: string;
    full_name: string;
    phone: string;
    email: string | null;
  };
  service: {
    id: string;
    name: string;
    description: string | null;
    duration_minutes: number;
    buffer_minutes: number;
    price: number;
    is_active: boolean;
  };
}
