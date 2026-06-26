import z from "zod";


export const customerSchema = z.object({
    full_name: z
        .string()
        .min(1, "El nombre es requerido")
        .max(30, "El nombre no uede superar los 30 caracteres"),
    phone: z
        .string()
        .min(10, "El numero debe contener por lo menos 10 numeros")
        .max(10, "El numero debe contener por lo menos 10 numeros"),
    email: z
        .string()
})

export type CustomerFormData = z.infer<typeof customerSchema>;