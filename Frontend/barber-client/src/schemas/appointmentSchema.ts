import { z } from "zod";

export const appointmentSchema = z.object({
    customer_mode: z.enum(["existing", "new"]),
    customer_id: z.string().optional(),
    full_name: z
        .string()
        .trim()
        .max(200, "El nombre no puede superar los 200 caracteres")
        .optional(),
    phone: z.string().optional(),
    email: z
        .string()
        .trim()
        .refine(
            (value) => value === "" || z.email().safeParse(value).success,
            "Ingresá un email válido"
        )
        .optional(),
    service_id: z.string().uuid("Seleccioná un servicio"),
    appointment_date: z
        .string()
        .min(1, "Seleccioná una fecha")
        .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha no es válida"),
    start_time: z
        .string()
        .min(1, "Seleccioná un horario")
        .regex(/^\d{2}:\d{2}$/, "El horario no es válido"),
    notes: z
        .string()
        .max(500, "Las notas no pueden superar los 500 caracteres")
        .optional(),
}).superRefine((data, context) => {
    if (data.customer_mode === "existing") {
        if (!data.customer_id || !z.uuid().safeParse(data.customer_id).success) {
            context.addIssue({
                code: "custom",
                message: "Seleccioná un cliente",
                path: ["customer_id"],
            });
        }

        return;
    }

    if (!data.full_name) {
        context.addIssue({
            code: "custom",
            message: "Ingresá el nombre completo",
            path: ["full_name"],
        });
    }

    const normalizedPhone = data.phone?.replace(/\D/g, "") ?? "";
    if (normalizedPhone.length < 7 || normalizedPhone.length > 20) {
        context.addIssue({
            code: "custom",
            message: "El teléfono debe contener entre 7 y 20 números",
            path: ["phone"],
        });
    }
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
