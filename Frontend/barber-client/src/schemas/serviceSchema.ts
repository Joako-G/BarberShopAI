import z from "zod";

export const serviceSchema = z.object({
    name:
        z.string()
            .min(1, "El nombre es requerido")
            .max(200, "El nombre no puede superar los 200 caracteres"),

    description: z
        .string()
        .max(1000, "La descripción no puede superar los 1000 caracteres")
        .optional()
        .nullable(),

    price: z
        .number({
            error: "El precio es requerido",
        })
        .nonnegative("El precio no puede ser negativo"),

    duration_minutes: z
        .number({
            error: "La duración es requerida",
        })
        .int("La duración debe ser un número entero")
        .positive("La duración debe ser mayor a 0"),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;