import z from "zod";

const emptyToNull = (value: unknown) => {
    if (typeof value !== "string") return value;

    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
};

const optionalText = (max: number, message: string) =>
    z.preprocess(
        emptyToNull,
        z.string().max(max, message).nullable().optional()
    );

export const settingsSchema = z.object({
    system_name: z
        .string()
        .trim()
        .min(2, "El nombre del sistema debe tener al menos 2 caracteres")
        .max(60, "El nombre del sistema no puede superar los 60 caracteres"),
    business_name: z
        .string()
        .trim()
        .min(2, "El nombre del negocio debe tener al menos 2 caracteres")
        .max(80, "El nombre del negocio no puede superar los 80 caracteres"),
    business_type: optionalText(60, "El rubro no puede superar los 60 caracteres"),
    description: optionalText(300, "La descripción no puede superar los 300 caracteres"),
    phone: optionalText(30, "El teléfono no puede superar los 30 caracteres"),
    whatsapp: optionalText(30, "El WhatsApp no puede superar los 30 caracteres"),
    email: z.preprocess(
        emptyToNull,
        z.string().email("Ingresá un email válido").nullable().optional()
    ),
    address: optionalText(150, "La dirección no puede superar los 150 caracteres"),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
export type SettingsFormInput = z.input<typeof settingsSchema>;

const timeSchema = z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Usá el formato HH:MM");

export const businessHourSchema = z
    .object({
        day_of_week: z.number().int().min(0).max(6),
        is_open: z.boolean(),
        start_time: timeSchema.nullable().optional(),
        end_time: timeSchema.nullable().optional(),
    })
    .superRefine((value, ctx) => {
        if (!value.is_open) return;

        if (!value.start_time) {
            ctx.addIssue({
                code: "custom",
                path: ["start_time"],
                message: "Ingresá una hora de inicio",
            });
        }

        if (!value.end_time) {
            ctx.addIssue({
                code: "custom",
                path: ["end_time"],
                message: "Ingresá una hora de cierre",
            });
        }

        if (value.start_time && value.end_time && value.start_time >= value.end_time) {
            ctx.addIssue({
                code: "custom",
                path: ["end_time"],
                message: "El cierre debe ser posterior al inicio",
            });
        }
    });

export const businessHoursSchema = z
    .object({
        hours: z.array(businessHourSchema).length(7, "Deben existir exactamente 7 días"),
    })
    .superRefine((value, ctx) => {
        const days = new Set<number>();

        value.hours.forEach((hour, index) => {
            if (days.has(hour.day_of_week)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["hours", index, "day_of_week"],
                    message: "El día no puede repetirse",
                });
            }

            days.add(hour.day_of_week);
        });
    });

export type BusinessHoursFormData = z.infer<typeof businessHoursSchema>;
export type BusinessHoursFormInput = z.input<typeof businessHoursSchema>;

export const slotIntervalMinutesSchema = z.union([
    z.literal(5),
    z.literal(10),
    z.literal(15),
    z.literal(20),
    z.literal(30),
    z.literal(60),
]);

export const appointmentSettingsSchema = z.object({
    slot_interval_minutes: slotIntervalMinutesSchema,
    default_buffer_minutes: z
        .number()
        .int("El buffer debe ser un número entero")
        .min(0, "El buffer mínimo es 0")
        .max(120, "El buffer máximo es 120"),
    min_booking_notice_minutes: z
        .number()
        .int("La anticipación debe ser un número entero")
        .min(0, "La anticipación mínima es 0")
        .max(10080, "La anticipación máxima es 10080 minutos"),
    max_booking_days_ahead: z
        .number()
        .int("Los días máximos deben ser un número entero")
        .min(1, "Debe permitir al menos 1 día")
        .max(365, "No puede superar 365 días"),
    auto_confirm_appointments: z.boolean(),
    allow_pending_appointments: z.boolean(),
});

export type AppointmentSettingsFormData = z.infer<typeof appointmentSettingsSchema>;
export type AppointmentSettingsFormInput = z.input<typeof appointmentSettingsSchema>;

const hexColorSchema = z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Usá un color hexadecimal válido");

export const appearanceSettingsSchema = z.object({
    theme_mode: z.enum(["dark", "light"]),
    primary_color: hexColorSchema,
    secondary_color: hexColorSchema,
    accent_color: hexColorSchema,
    background_color: hexColorSchema,
    text_color: hexColorSchema,
    border_radius: z
        .number()
        .int("El radio debe ser un número entero")
        .min(0, "El radio mínimo es 0")
        .max(32, "El radio máximo es 32"),
});

export type AppearanceSettingsFormData = z.infer<typeof appearanceSettingsSchema>;
export type AppearanceSettingsFormInput = z.input<typeof appearanceSettingsSchema>;

const dateSchema = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Usa el formato YYYY-MM-DD");

export const calendarExceptionSchema = z
    .object({
        type: z.enum(["CLOSED_DAY", "SPECIAL_HOURS", "VACATION"]),
        title: z
            .string()
            .trim()
            .min(1, "Ingresa un titulo")
            .max(80, "El titulo no puede superar 80 caracteres"),
        start_date: dateSchema,
        end_date: dateSchema,
        special_start_time: timeSchema.nullable().optional(),
        special_end_time: timeSchema.nullable().optional(),
        notes: optionalText(300, "Las notas no pueden superar los 300 caracteres"),
    })
    .superRefine((value, ctx) => {
        if (value.end_date < value.start_date) {
            ctx.addIssue({
                code: "custom",
                path: ["end_date"],
                message: "La fecha fin debe ser igual o posterior al inicio",
            });
        }

        if (value.type === "CLOSED_DAY" && value.end_date !== value.start_date) {
            ctx.addIssue({
                code: "custom",
                path: ["end_date"],
                message: "Un dia cerrado debe usar una sola fecha",
            });
        }

        if (value.type !== "SPECIAL_HOURS") {
            if (value.special_start_time || value.special_end_time) {
                ctx.addIssue({
                    code: "custom",
                    path: ["special_start_time"],
                    message: "Los dias cerrados y vacaciones no deben tener horario especial",
                });
            }

            return;
        }

        if (value.end_date !== value.start_date) {
            ctx.addIssue({
                code: "custom",
                path: ["end_date"],
                message: "Un horario especial debe usar una sola fecha",
            });
        }

        if (!value.special_start_time) {
            ctx.addIssue({
                code: "custom",
                path: ["special_start_time"],
                message: "Ingresa hora de inicio",
            });
        }

        if (!value.special_end_time) {
            ctx.addIssue({
                code: "custom",
                path: ["special_end_time"],
                message: "Ingresa hora de fin",
            });
        }

        if (
            value.special_start_time &&
            value.special_end_time &&
            value.special_start_time >= value.special_end_time
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["special_end_time"],
                message: "La hora fin debe ser posterior al inicio",
            });
        }
    });

export type CalendarExceptionFormData = z.infer<typeof calendarExceptionSchema>;
export type CalendarExceptionFormInput = z.input<typeof calendarExceptionSchema>;
