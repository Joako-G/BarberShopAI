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
