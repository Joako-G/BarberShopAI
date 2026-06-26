import { z } from "zod";

export const publicBookingSchema = z.object({
    full_name: z
        .string()
        .trim()
        .min(1, "Ingresá tu nombre completo")
        .max(200, "El nombre no puede superar los 200 caracteres"),
    phone: z
        .string()
        .trim()
        .refine((value) => {
            const digits = value.replace(/\D/g, "");
            return digits.length >= 7 && digits.length <= 20;
        }, "El teléfono debe contener entre 7 y 20 números"),
    email: z
        .string()
        .trim()
        .refine(
            (value) => value === "" || z.email().safeParse(value).success,
            "Ingresá un email válido"
        ),
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
});

export type PublicBookingFormData = z.infer<typeof publicBookingSchema>;
