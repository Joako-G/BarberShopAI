import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
    appointmentSettingsSchema,
    type AppointmentSettingsFormData,
    type AppointmentSettingsFormInput,
} from "../../schemas/settingsSchema";
import type { AppointmentSettings } from "../../types/settings";
import { classNames } from "../../utils/classNames";
import sharedStyles from "../ui/styles/shared.module.css";

const SLOT_INTERVAL_OPTIONS = [5, 10, 15, 20, 30, 60] as const;
const NOTICE_OPTIONS = [0, 30, 60, 120, 240, 1440] as const;

interface Props {
    initialValues: AppointmentSettings;
    onSubmit: (data: AppointmentSettingsFormData) => Promise<void>;
}

function toFormDefaults(settings: AppointmentSettings): AppointmentSettingsFormInput {
    return {
        slot_interval_minutes: settings.slot_interval_minutes,
        default_buffer_minutes: settings.default_buffer_minutes,
        min_booking_notice_minutes: settings.min_booking_notice_minutes,
        max_booking_days_ahead: settings.max_booking_days_ahead,
        auto_confirm_appointments: settings.auto_confirm_appointments,
        allow_pending_appointments: settings.allow_pending_appointments,
    };
}

export function AppointmentSettingsForm({ initialValues, onSubmit }: Props) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<AppointmentSettingsFormInput, unknown, AppointmentSettingsFormData>({
        resolver: zodResolver(appointmentSettingsSchema),
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
                    <h2>Turnos</h2>
                    <span className={sharedStyles.tableSecondary}>
                        Reglas generales para disponibilidad y reservas públicas.
                    </span>
                </div>
            </div>

            <div className={sharedStyles.cardBody}>
                <div className={sharedStyles.formGrid}>
                    <div className={sharedStyles.formField}>
                        <label htmlFor="slot_interval_minutes">Intervalo de horarios</label>
                        <select
                            id="slot_interval_minutes"
                            {...register("slot_interval_minutes", { valueAsNumber: true })}
                        >
                            {SLOT_INTERVAL_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                    Cada {option} minutos
                                </option>
                            ))}
                        </select>
                        <span className={sharedStyles.formHint}>
                            Define cada cuánto aparecen los turnos disponibles.
                        </span>
                        {errors.slot_interval_minutes && (
                            <span className={sharedStyles.formError}>
                                {errors.slot_interval_minutes.message}
                            </span>
                        )}
                    </div>

                    <div className={sharedStyles.formField}>
                        <label htmlFor="default_buffer_minutes">Buffer global</label>
                        <input
                            id="default_buffer_minutes"
                            min={0}
                            max={120}
                            type="number"
                            {...register("default_buffer_minutes", { valueAsNumber: true })}
                        />
                        <span className={sharedStyles.formHint}>
                            Tiempo extra que se bloquea después de cada turno.
                        </span>
                        {errors.default_buffer_minutes && (
                            <span className={sharedStyles.formError}>
                                {errors.default_buffer_minutes.message}
                            </span>
                        )}
                    </div>

                    <div className={sharedStyles.formField}>
                        <label htmlFor="min_booking_notice_minutes">Anticipación mínima</label>
                        <select
                            id="min_booking_notice_minutes"
                            {...register("min_booking_notice_minutes", { valueAsNumber: true })}
                        >
                            {NOTICE_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                    {option === 0 ? "Sin anticipación" : `${option} minutos`}
                                </option>
                            ))}
                        </select>
                        <span className={sharedStyles.formHint}>
                            Evita reservas demasiado cercanas a la hora actual.
                        </span>
                        {errors.min_booking_notice_minutes && (
                            <span className={sharedStyles.formError}>
                                {errors.min_booking_notice_minutes.message}
                            </span>
                        )}
                    </div>

                    <div className={sharedStyles.formField}>
                        <label htmlFor="max_booking_days_ahead">Días máximos</label>
                        <input
                            id="max_booking_days_ahead"
                            min={1}
                            max={365}
                            type="number"
                            {...register("max_booking_days_ahead", { valueAsNumber: true })}
                        />
                        <span className={sharedStyles.formHint}>
                            Limita hasta cuándo puede reservar un cliente.
                        </span>
                        {errors.max_booking_days_ahead && (
                            <span className={sharedStyles.formError}>
                                {errors.max_booking_days_ahead.message}
                            </span>
                        )}
                    </div>

                    <label className={sharedStyles.formField}>
                        <span>Auto-confirmar reservas públicas</span>
                        <input
                            type="checkbox"
                            {...register("auto_confirm_appointments")}
                        />
                        <span className={sharedStyles.formHint}>
                            Si está activo, las reservas públicas entran confirmadas.
                        </span>
                    </label>

                    <label className={sharedStyles.formField}>
                        <span>Permitir reservas pendientes</span>
                        <input
                            type="checkbox"
                            {...register("allow_pending_appointments")}
                        />
                        <span className={sharedStyles.formHint}>
                            Si está activo y no se auto-confirma, entran pendientes.
                        </span>
                    </label>
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
                        {isSubmitting ? "Guardando..." : "Guardar turnos"}
                    </button>
                </div>
            </div>
        </form>
    );
}
