import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
    businessHoursSchema,
    type BusinessHoursFormData,
    type BusinessHoursFormInput,
} from "../../schemas/settingsSchema";
import type { BusinessHour } from "../../types/settings";
import { classNames } from "../../utils/classNames";
import sharedStyles from "../ui/styles/shared.module.css";

const DAY_LABELS = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
];

interface Props {
    initialValues: BusinessHour[];
    onSubmit: (data: BusinessHoursFormData) => Promise<void>;
}

function toFormDefaults(hours: BusinessHour[]): BusinessHoursFormInput {
    return {
        hours: [...hours]
            .sort((a, b) => a.day_of_week - b.day_of_week)
            .map((hour) => ({
                day_of_week: hour.day_of_week,
                is_open: hour.is_open,
                start_time: hour.start_time,
                end_time: hour.end_time,
            })),
    };
}

export function BusinessHoursForm({ initialValues, onSubmit }: Props) {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<BusinessHoursFormInput, unknown, BusinessHoursFormData>({
        resolver: zodResolver(businessHoursSchema),
        defaultValues: toFormDefaults(initialValues),
    });

    const hours = watch("hours");

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
                    <h2>Horarios laborales</h2>
                    <span className={sharedStyles.tableSecondary}>
                        Días y rangos usados para calcular los turnos disponibles.
                    </span>
                </div>
            </div>

            <div className={sharedStyles.cardBody}>
                <div className={sharedStyles.tableShell}>
                    <table className={sharedStyles.dataTable}>
                        <thead>
                            <tr>
                                <th>Día</th>
                                <th>Estado</th>
                                <th>Inicio</th>
                                <th>Cierre</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hours.map((hour, index) => {
                                const isOpen = Boolean(hour?.is_open);

                                return (
                                    <tr key={hour.day_of_week}>
                                        <td data-label="Día">
                                            <span className={sharedStyles.tablePrimary}>
                                                {DAY_LABELS[hour.day_of_week]}
                                            </span>
                                            <input
                                                type="hidden"
                                                {...register(`hours.${index}.day_of_week`, {
                                                    valueAsNumber: true,
                                                })}
                                            />
                                            {errors.hours?.[index]?.day_of_week && (
                                                <span className={sharedStyles.formError}>
                                                    {errors.hours[index]?.day_of_week?.message}
                                                </span>
                                            )}
                                        </td>
                                        <td data-label="Estado">
                                            <label className={sharedStyles.tableActions}>
                                                <input
                                                    type="checkbox"
                                                    {...register(`hours.${index}.is_open`)}
                                                />
                                                <span>{isOpen ? "Abierto" : "Cerrado"}</span>
                                            </label>
                                        </td>
                                        <td data-label="Inicio">
                                            <div className={sharedStyles.formField}>
                                                <input
                                                    disabled={!isOpen || isSubmitting}
                                                    type="time"
                                                    {...register(`hours.${index}.start_time`)}
                                                />
                                                {errors.hours?.[index]?.start_time && (
                                                    <span className={sharedStyles.formError}>
                                                        {errors.hours[index]?.start_time?.message}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td data-label="Cierre">
                                            <div className={sharedStyles.formField}>
                                                <input
                                                    disabled={!isOpen || isSubmitting}
                                                    type="time"
                                                    {...register(`hours.${index}.end_time`)}
                                                />
                                                {errors.hours?.[index]?.end_time && (
                                                    <span className={sharedStyles.formError}>
                                                        {errors.hours[index]?.end_time?.message}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {errors.hours?.message && (
                    <span className={sharedStyles.formError}>{errors.hours.message}</span>
                )}

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
                        {isSubmitting ? "Guardando..." : "Guardar horarios"}
                    </button>
                </div>
            </div>
        </form>
    );
}
