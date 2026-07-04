import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
    appearanceSettingsSchema,
    type AppearanceSettingsFormData,
    type AppearanceSettingsFormInput,
} from "../../schemas/settingsSchema";
import { getAppearanceCssVariables } from "../../store/appearanceStore";
import type { AppearanceSettings } from "../../types/settings";
import { classNames } from "../../utils/classNames";
import sharedStyles from "../ui/styles/shared.module.css";

interface Props {
    initialValues: AppearanceSettings;
    onSubmit: (data: AppearanceSettingsFormData) => Promise<void>;
}

const COLOR_FIELDS = [
    ["primary_color", "Color principal"],
    ["secondary_color", "Color secundario"],
    ["accent_color", "Color de acento"],
    ["background_color", "Color de fondo"],
    ["text_color", "Color de texto"],
] as const;

function toFormDefaults(settings: AppearanceSettings): AppearanceSettingsFormInput {
    return {
        theme_mode: settings.theme_mode,
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        accent_color: settings.accent_color,
        background_color: settings.background_color,
        text_color: settings.text_color,
        border_radius: settings.border_radius,
    };
}

function toPreviewSettings(
    values: AppearanceSettingsFormInput
): AppearanceSettings {
    return {
        id: "preview",
        theme_mode: values.theme_mode,
        primary_color: values.primary_color,
        secondary_color: values.secondary_color,
        accent_color: values.accent_color,
        background_color: values.background_color,
        text_color: values.text_color,
        border_radius: Number(values.border_radius),
        created_at: "",
        updated_at: "",
    };
}

export function AppearanceSettingsForm({ initialValues, onSubmit }: Props) {
    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<AppearanceSettingsFormInput, unknown, AppearanceSettingsFormData>({
        resolver: zodResolver(appearanceSettingsSchema),
        defaultValues: toFormDefaults(initialValues),
    });

    const previewValues = useWatch({ control });
    const previewSettings = toPreviewSettings({
        ...toFormDefaults(initialValues),
        ...previewValues,
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
                    <h2>Apariencia</h2>
                    <span className={sharedStyles.tableSecondary}>
                        Colores y bordes aplicados al panel administrativo.
                    </span>
                </div>
            </div>

            <div className={sharedStyles.cardBody}>
                <div className={sharedStyles.formGrid}>
                    <div className={sharedStyles.formField}>
                        <label htmlFor="theme_mode">Modo visual</label>
                        <select id="theme_mode" {...register("theme_mode")}>
                            <option value="dark">Oscuro</option>
                            <option value="light">Claro</option>
                        </select>
                        {errors.theme_mode && (
                            <span className={sharedStyles.formError}>
                                {errors.theme_mode.message}
                            </span>
                        )}
                    </div>

                    <div className={sharedStyles.formField}>
                        <label htmlFor="border_radius">Radio de bordes</label>
                        <input
                            id="border_radius"
                            max={32}
                            min={0}
                            type="number"
                            {...register("border_radius", { valueAsNumber: true })}
                        />
                        <input
                            aria-label="Ajustar radio de bordes"
                            max={32}
                            min={0}
                            type="range"
                            {...register("border_radius", { valueAsNumber: true })}
                        />
                        {errors.border_radius && (
                            <span className={sharedStyles.formError}>
                                {errors.border_radius.message}
                            </span>
                        )}
                    </div>

                    {COLOR_FIELDS.map(([field, label]) => (
                        <div className={sharedStyles.formField} key={field}>
                            <label htmlFor={field}>{label}</label>
                            <div className={sharedStyles.colorInputGroup}>
                                <input
                                    aria-label={label}
                                    className={sharedStyles.colorSwatchInput}
                                    id={field}
                                    type="color"
                                    {...register(field)}
                                />
                                <input
                                    aria-label={`${label} hexadecimal`}
                                    className={sharedStyles.colorTextInput}
                                    readOnly
                                    type="text"
                                    value={String(previewSettings[field])}
                                />
                            </div>
                            {errors[field] && (
                                <span className={sharedStyles.formError}>
                                    {errors[field]?.message}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                <div
                    className={sharedStyles.appearancePreview}
                    style={getAppearanceCssVariables(previewSettings)}
                >
                    <div className={sharedStyles.appearancePreviewCard}>
                        <span className={sharedStyles.appearancePreviewBadge}>
                            Vista previa
                        </span>
                        <h3>Panel personalizado</h3>
                        <p>
                            Esta tarjeta usa los colores elegidos antes de guardar los cambios.
                        </p>
                        <div className={sharedStyles.appearancePreviewActions}>
                            <button
                                className={classNames(sharedStyles.button, sharedStyles.buttonPrimary)}
                                type="button"
                            >
                                Primario
                            </button>
                            <button
                                className={classNames(sharedStyles.button, sharedStyles.buttonSecondary)}
                                type="button"
                            >
                                Secundario
                            </button>
                        </div>
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
                        className={classNames(sharedStyles.button, sharedStyles.buttonPrimary)}
                        disabled={isSubmitting || !isDirty}
                        type="submit"
                    >
                        {isSubmitting ? "Guardando..." : "Guardar apariencia"}
                    </button>
                </div>
            </div>
        </form>
    );
}
