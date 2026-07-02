import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
    settingsSchema,
    type SettingsFormData,
    type SettingsFormInput,
} from "../../schemas/settingsSchema";
import type { BusinessSettings } from "../../types/settings";
import { classNames } from "../../utils/classNames";
import sharedStyles from "../ui/styles/shared.module.css";

interface Props {
    initialValues: BusinessSettings;
    onCancel: () => void;
    onSubmit: (data: SettingsFormData) => Promise<void>;
}

function toFormDefaults(settings: BusinessSettings): SettingsFormInput {
    return {
        system_name: settings.system_name,
        business_name: settings.business_name,
        business_type: settings.business_type ?? null,
        description: settings.description ?? null,
        phone: settings.phone ?? null,
        whatsapp: settings.whatsapp ?? null,
        email: settings.email ?? null,
        address: settings.address ?? null,
    };
}

export function GeneralSettingsForm({
    initialValues,
    onCancel,
    onSubmit,
}: Props) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<SettingsFormInput, unknown, SettingsFormData>({
        resolver: zodResolver(settingsSchema),
        defaultValues: toFormDefaults(initialValues),
    });

    useEffect(() => {
        reset(toFormDefaults(initialValues));
    }, [initialValues, reset]);

    return (
        <form
            className={classNames(sharedStyles.card, sharedStyles.formCard)}
            onSubmit={handleSubmit(onSubmit)}
        >
            <div className={sharedStyles.cardHeader}>
                <div>
                    <h2>Configuración general</h2>
                    <span className={sharedStyles.tableSecondary}>
                        Datos visibles y reutilizables en el panel administrativo.
                    </span>
                </div>
            </div>

            <div className={sharedStyles.cardBody}>
                <div className={sharedStyles.formGrid}>
                    <div className={sharedStyles.formField}>
                        <label htmlFor="system_name">Nombre del sistema</label>
                        <input
                            id="system_name"
                            placeholder="Ej. Sistema de Turnos"
                            type="text"
                            {...register("system_name")}
                        />
                        {errors.system_name && (
                            <span className={sharedStyles.formError}>{errors.system_name.message}</span>
                        )}
                    </div>

                    <div className={sharedStyles.formField}>
                        <label htmlFor="business_name">Nombre del negocio</label>
                        <input
                            id="business_name"
                            placeholder="Ej. Barbería El Corte"
                            type="text"
                            {...register("business_name")}
                        />
                        {errors.business_name && (
                            <span className={sharedStyles.formError}>{errors.business_name.message}</span>
                        )}
                    </div>

                    <div className={sharedStyles.formField}>
                        <label htmlFor="business_type">Rubro</label>
                        <input
                            id="business_type"
                            placeholder="Ej. Barbería"
                            type="text"
                            {...register("business_type")}
                        />
                        {errors.business_type && (
                            <span className={sharedStyles.formError}>{errors.business_type.message}</span>
                        )}
                    </div>

                    <div className={sharedStyles.formField}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            placeholder="contacto@negocio.com"
                            type="email"
                            {...register("email")}
                        />
                        {errors.email && (
                            <span className={sharedStyles.formError}>{errors.email.message}</span>
                        )}
                    </div>

                    <div className={sharedStyles.formField}>
                        <label htmlFor="phone">Teléfono</label>
                        <input
                            id="phone"
                            placeholder="3880000000"
                            type="tel"
                            {...register("phone")}
                        />
                        {errors.phone && (
                            <span className={sharedStyles.formError}>{errors.phone.message}</span>
                        )}
                    </div>

                    <div className={sharedStyles.formField}>
                        <label htmlFor="whatsapp">WhatsApp</label>
                        <input
                            id="whatsapp"
                            placeholder="3880000000"
                            type="tel"
                            {...register("whatsapp")}
                        />
                        {errors.whatsapp && (
                            <span className={sharedStyles.formError}>{errors.whatsapp.message}</span>
                        )}
                    </div>

                    <div className={classNames(sharedStyles.formField, sharedStyles.formFieldWide)}>
                        <label htmlFor="address">Dirección</label>
                        <input
                            id="address"
                            placeholder="San Salvador de Jujuy"
                            type="text"
                            {...register("address")}
                        />
                        {errors.address && (
                            <span className={sharedStyles.formError}>{errors.address.message}</span>
                        )}
                    </div>

                    <div className={classNames(sharedStyles.formField, sharedStyles.formFieldWide)}>
                        <label htmlFor="description">Descripción</label>
                        <textarea
                            id="description"
                            placeholder="Descripción breve del negocio o sistema"
                            {...register("description")}
                        />
                        {errors.description && (
                            <span className={sharedStyles.formError}>{errors.description.message}</span>
                        )}
                    </div>
                </div>

                <div className={sharedStyles.formActions}>
                    <button
                        className={classNames(sharedStyles.button, sharedStyles.buttonSecondary)}
                        disabled={isSubmitting}
                        onClick={() => reset(toFormDefaults(initialValues))}
                        type="button"
                    >
                        Cancelar cambios
                    </button>
                    <button
                        className={classNames(sharedStyles.button, sharedStyles.buttonSecondary)}
                        disabled={isSubmitting}
                        onClick={onCancel}
                        type="button"
                    >
                        Volver
                    </button>
                    <button
                        className={classNames(sharedStyles.button, sharedStyles.buttonPrimary)}
                        disabled={isSubmitting || !isDirty}
                        type="submit"
                    >
                        {isSubmitting ? "Guardando…" : "Guardar cambios"}
                    </button>
                </div>
            </div>
        </form>
    );
}
