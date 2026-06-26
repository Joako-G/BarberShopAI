import z from "zod";


export const customerSchema = z.object({
    full_name: z
        .string()
        .min(1, "El nombre es requerido")
        .max(30, "El nombre no uede superar los 30 caracteres"),
    phone: z
        .string()
        .regex(/^\d+$/, "Ingresá solo números")
        .min(7, "El numero debe contener por lo menos 7 numeros")
        .max(15, "El numero no puede superar los 15 numeros"),
    email: z
        .string()
})

export type CustomerFormData = z.infer<typeof customerSchema>;
