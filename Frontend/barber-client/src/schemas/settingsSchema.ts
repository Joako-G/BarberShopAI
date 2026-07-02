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
