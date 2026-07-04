import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
    calendarExceptionSchema,
    type CalendarExceptionFormData,
    type CalendarExceptionFormInput,
} from "../../schemas/settingsSchema";
import type { CalendarException, CalendarExceptionType } from "../../types/settings";
import { classNames } from "../../utils/classNames";
import sharedStyles from "../ui/styles/shared.module.css";

interface Props {
    exceptions: CalendarException[];
    onCreate: (data: CalendarExceptionFormData) => Promise<void>;
    onUpdate: (id: string, data: CalendarExceptionFormData) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

const typeLabels: Record<CalendarExceptionType, string> = {
    CLOSED_DAY: "Dia cerrado",
    SPECIAL_HOURS: "Horario especial",
    VACATION: "Vacaciones",
};

const defaultValues: CalendarExceptionFormInput = {
    type: "CLOSED_DAY",
    title: "",
    start_date: "",
    end_date: "",
    special_start_time: null,
    special_end_time: null,
    notes: null,
};

function toFormValues(exception: CalendarException): CalendarExceptionFormInput {
    return {
        type: exception.type,
        title: exception.title,
        start_date: exception.start_date,
        end_date: exception.end_date,
        special_start_time: exception.special_start_time,
        special_end_time: exception.special_end_time,
        notes: exception.notes,
    };
}

function formatDate(value: string): string {
    const [year, month, day] = value.split("-").map(Number);

    return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(year, month - 1, day));
}

export function CalendarExceptionsManager({
    exceptions,
    onCreate,
    onUpdate,
    onDelete,
}: Props) {
    const [editing, setEditing] = useState<CalendarException | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const sortedExceptions = useMemo(
        () =>
            [...exceptions].sort((a, b) =>
                a.start_date.localeCompare(b.start_date) || a.title.localeCompare(b.title)
            ),
        [exceptions]
    );

    const {
        control,
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<CalendarExceptionFormInput, unknown, CalendarExceptionFormData>({
        resolver: zodResolver(calendarExceptionSchema),
        defaultValues,
    });
    const selectedType = useWatch({ control, name: "type" });
    const startDate = useWatch({ control, name: "start_date" });
    const showSpecialHours = selectedType === "SPECIAL_HOURS";
    const singleDayType = selectedType === "CLOSED_DAY" || selectedType === "SPECIAL_HOURS";

    useEffect(() => {
        if (!singleDayType || !startDate) return;
        setValue("end_date", startDate, { shouldValidate: true });
    }, [singleDayType, setValue, startDate]);

    useEffect(() => {
        if (showSpecialHours) return;
        setValue("special_start_time", null, { shouldValidate: true });
        setValue("special_end_time", null, { shouldValidate: true });
    }, [setValue, showSpecialHours]);

    const handleCancel = () => {
        setEditing(null);
        reset(defaultValues);
    };

    const submit = async (data: CalendarExceptionFormData) => {
        if (editing) {
            await onUpdate(editing.id, data);
        } else {
            await onCreate(data);
        }

        handleCancel();
    };

    const handleDelete = async (exception: CalendarException) => {
        const confirmed = window.confirm(`Eliminar "${exception.title}"?`);

        if (!confirmed) return;

        setDeletingId(exception.id);
        try {
            await onDelete(exception.id);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className={classNames(sharedStyles.card, sharedStyles.formCard)}>
            <div className={sharedStyles.cardHeader}>
                <div>
                    <h2>Calendario</h2>
                    <span className={sharedStyles.tableSecondary}>
                        Excepciones puntuales al horario semanal.
                    </span>
                </div>
            </div>

            <div className={sharedStyles.cardBody}>
                <form onSubmit={handleSubmit(submit)}>
                    <div className={sharedStyles.formGrid}>
                        <div className={sharedStyles.formField}>
                            <label htmlFor="calendar_type">Tipo</label>
                            <select id="calendar_type" {...register("type")}>
                                <option value="CLOSED_DAY">Dia cerrado</option>
                                <option value="SPECIAL_HOURS">Horario especial</option>
                                <option value="VACATION">Vacaciones</option>
                            </select>
                            {errors.type && (
                                <span className={sharedStyles.formError}>{errors.type.message}</span>
                            )}
                        </div>

                        <div className={sharedStyles.formField}>
                            <label htmlFor="calendar_title">Titulo</label>
                            <input id="calendar_title" type="text" {...register("title")} />
                            {errors.title && (
                                <span className={sharedStyles.formError}>{errors.title.message}</span>
                            )}
                        </div>

                        <div className={sharedStyles.formField}>
                            <label htmlFor="calendar_start_date">Fecha inicio</label>
                            <input id="calendar_start_date" type="date" {...register("start_date")} />
                            {errors.start_date && (
                                <span className={sharedStyles.formError}>{errors.start_date.message}</span>
                            )}
                        </div>

                        <div className={sharedStyles.formField}>
                            <label htmlFor="calendar_end_date">Fecha fin</label>
                            <input
                                disabled={singleDayType}
                                id="calendar_end_date"
                                type="date"
                                {...register("end_date")}
                            />
                            {errors.end_date && (
                                <span className={sharedStyles.formError}>{errors.end_date.message}</span>
                            )}
                        </div>

                        {showSpecialHours && (
                            <>
                                <div className={sharedStyles.formField}>
                                    <label htmlFor="calendar_special_start">Hora inicio</label>
                                    <input
                                        id="calendar_special_start"
                                        type="time"
                                        {...register("special_start_time")}
                                    />
                                    {errors.special_start_time && (
                                        <span className={sharedStyles.formError}>
                                            {errors.special_start_time.message}
                                        </span>
                                    )}
                                </div>

                                <div className={sharedStyles.formField}>
                                    <label htmlFor="calendar_special_end">Hora fin</label>
                                    <input
                                        id="calendar_special_end"
                                        type="time"
                                        {...register("special_end_time")}
                                    />
                                    {errors.special_end_time && (
                                        <span className={sharedStyles.formError}>
                                            {errors.special_end_time.message}
                                        </span>
                                    )}
                                </div>
                            </>
                        )}

                        <div className={classNames(sharedStyles.formField, sharedStyles.formFieldWide)}>
                            <label htmlFor="calendar_notes">Notas</label>
                            <textarea id="calendar_notes" rows={3} {...register("notes")} />
                            {errors.notes && (
                                <span className={sharedStyles.formError}>{errors.notes.message}</span>
                            )}
                        </div>
                    </div>

                    <div className={sharedStyles.formActions}>
                        <button
                            className={classNames(sharedStyles.button, sharedStyles.buttonSecondary)}
                            disabled={isSubmitting}
                            onClick={handleCancel}
                            type="button"
                        >
                            Cancelar
                        </button>
                        <button
                            className={classNames(sharedStyles.button, sharedStyles.buttonPrimary)}
                            disabled={isSubmitting}
                            type="submit"
                        >
                            {isSubmitting
                                ? "Guardando..."
                                : editing
                                    ? "Actualizar excepcion"
                                    : "Crear excepcion"}
                        </button>
                    </div>
                </form>

                <div className={sharedStyles.tableShell}>
                    <table className={sharedStyles.dataTable}>
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Titulo</th>
                                <th>Fecha inicio</th>
                                <th>Fecha fin</th>
                                <th>Horario especial</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedExceptions.map((exception) => (
                                <tr key={exception.id}>
                                    <td data-label="Tipo">
                                        <span className={sharedStyles.statusChip}>
                                            {typeLabels[exception.type]}
                                        </span>
                                    </td>
                                    <td data-label="Titulo">
                                        <span className={sharedStyles.tablePrimary}>
                                            {exception.title}
                                        </span>
                                        {exception.notes && (
                                            <span className={sharedStyles.tableSecondary}>
                                                {exception.notes}
                                            </span>
                                        )}
                                    </td>
                                    <td data-label="Fecha inicio">{formatDate(exception.start_date)}</td>
                                    <td data-label="Fecha fin">{formatDate(exception.end_date)}</td>
                                    <td data-label="Horario especial">
                                        {exception.type === "SPECIAL_HOURS"
                                            ? `${exception.special_start_time}-${exception.special_end_time}`
                                            : "-"}
                                    </td>
                                    <td data-label="Acciones">
                                        <div className={sharedStyles.tableActions}>
                                            <button
                                                className={classNames(sharedStyles.button, sharedStyles.buttonSecondary, sharedStyles.buttonQuiet)}
                                                onClick={() => {
                                                    setEditing(exception);
                                                    reset(toFormValues(exception));
                                                }}
                                                type="button"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className={classNames(sharedStyles.button, sharedStyles.buttonDanger, sharedStyles.buttonQuiet)}
                                                disabled={deletingId === exception.id}
                                                onClick={() => void handleDelete(exception)}
                                                type="button"
                                            >
                                                {deletingId === exception.id ? "Eliminando..." : "Eliminar"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {sortedExceptions.length === 0 && (
                    <div className={sharedStyles.emptyState}>
                        <strong>No hay excepciones cargadas</strong>
                        <span>Los horarios disponibles usan la configuracion semanal.</span>
                    </div>
                )}
            </div>
        </div>
    );
}
