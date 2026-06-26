import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppointmentsTable } from "../components/appointments/AppointmentsTable";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useAppointments } from "../hooks/useAppointments";
import { notifyError, notifySuccess } from "../services/notifications";
import type {
    Appointment,
    AppointmentAction,
    AppointmentFilters,
    AppointmentStatus,
} from "../types/appointment";
import { getBusinessDate } from "../utils/businessTime";
import { classNames } from "../utils/classNames";
import styles from "./AppointmentsPage.module.css";

const statusOptions: Array<{ value: AppointmentStatus | ""; label: string }> = [
    { value: "", label: "Todos los estados" },
    { value: "pending", label: "Pendientes" },
    { value: "confirmed", label: "Confirmados" },
    { value: "completed", label: "Completados" },
    { value: "cancelled", label: "Cancelados" },
    { value: "no_show", label: "Ausentes" },
];

const actionLabels: Record<AppointmentAction, string> = {
    confirm: "confirmar",
    cancel: "cancelar",
    complete: "completar",
    "no-show": "marcar como ausente",
};

interface PendingAppointmentAction {
    action: AppointmentAction;
    appointment: Appointment;
}

function cleanFilters(filters: AppointmentFilters): AppointmentFilters {
    return Object.fromEntries(
        Object.entries(filters).filter(
            ([, value]) => value !== "" && value !== undefined
        )
    ) as AppointmentFilters;
}

export function AppointmentsPage() {
    const navigate = useNavigate();
    const initialFilters: AppointmentFilters = { date: getBusinessDate() };
    const {
        appointments,
        filters,
        loading,
        error,
        updatingId,
        applyFilters,
        reload,
        updateStatus,
    } = useAppointments(initialFilters);
    const [draftFilters, setDraftFilters] = useState<AppointmentFilters>(initialFilters);
    const [pendingAction, setPendingAction] =
        useState<PendingAppointmentAction | null>(null);

    const summary = useMemo(
        () => ({
            total: appointments.length,
            pending: appointments.filter(({ status }) => status === "pending").length,
            confirmed: appointments.filter(({ status }) => status === "confirmed").length,
        }),
        [appointments]
    );

    const handleSubmitFilters = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        applyFilters(cleanFilters(draftFilters));
    };

    const handleClearFilters = () => {
        setDraftFilters({});
        applyFilters({});
    };

    const handleAction = (
        appointment: Appointment,
        action: AppointmentAction
    ) => {
        setPendingAction({ appointment, action });
    };

    const confirmAppointmentAction = async () => {
        if (!pendingAction) return;

        const result = await updateStatus(
            pendingAction.appointment.id,
            pendingAction.action
        );

        if (result.success) {
            notifySuccess({
                title: "Turno actualizado",
                description: "El estado del turno se actualizó correctamente.",
            });
            setPendingAction(null);
            return;
        }

        notifyError({
            title: "No se pudo actualizar el turno",
            description: result.errorMessage,
        });
    };

    return (
        <section className={styles["appointments-page"]}>
            <ConfirmDialog
                confirmText="Confirmar"
                description={
                    pendingAction
                        ? `Esta acción va a ${actionLabels[pendingAction.action]} el turno de ${pendingAction.appointment.customer.full_name}.`
                        : "Confirmá la acción sobre el turno seleccionado."
                }
                loading={pendingAction !== null && updatingId === pendingAction.appointment.id}
                open={pendingAction !== null}
                title="Confirmar cambio de turno"
                onConfirm={() => void confirmAppointmentAction()}
                onOpenChange={(open) => {
                    if (!open) setPendingAction(null);
                }}
            />

            <header className={styles["appointments-hero"]}>
                <div>
                    <span className={styles["appointments-eyebrow"]}>Agenda administrativa</span>
                    <h1>Turnos</h1>
                    <p>
                        Revisá la jornada, encontrá clientes y avanzá cada turno hasta su
                        estado final.
                    </p>
                </div>

                <div className={styles["appointments-hero__aside"]}>
                    <button
                        className={classNames(
                            styles["appointments-button"],
                            styles["appointments-button--primary"],
                            styles["appointments-new-button"]
                        )}
                        onClick={() => navigate("/appointments/new")}
                        type="button"
                    >
                        Nuevo turno
                    </button>
                    <div className={styles["appointments-summary"]} aria-label="Resumen de turnos visibles">
                        <article>
                            <span>Total</span>
                            <strong>{summary.total}</strong>
                        </article>
                        <article>
                            <span>Pendientes</span>
                            <strong>{summary.pending}</strong>
                        </article>
                        <article>
                            <span>Confirmados</span>
                            <strong>{summary.confirmed}</strong>
                        </article>
                    </div>
                </div>
            </header>

            <form className={styles["appointments-filters"]} onSubmit={handleSubmitFilters}>
                <label>
                    <span>Fecha</span>
                    <input
                        type="date"
                        value={draftFilters.date ?? ""}
                        onChange={(event) =>
                            setDraftFilters((current) => ({
                                ...current,
                                date: event.target.value || undefined,
                            }))
                        }
                    />
                </label>

                <label>
                    <span>Estado</span>
                    <select
                        value={draftFilters.status ?? ""}
                        onChange={(event) =>
                            setDraftFilters((current) => ({
                                ...current,
                                status: (event.target.value || undefined) as
                                    | AppointmentStatus
                                    | undefined,
                            }))
                        }
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className={styles["appointments-filters__customer"]}>
                    <span>Cliente</span>
                    <input
                        type="search"
                        placeholder="Nombre o teléfono"
                        value={draftFilters.customer ?? ""}
                        onChange={(event) =>
                            setDraftFilters((current) => ({
                                ...current,
                                customer: event.target.value || undefined,
                            }))
                        }
                    />
                </label>

                <div className={styles["appointments-filters__actions"]}>
                    <button
                        className={classNames(
                            styles["appointments-button"],
                            styles["appointments-button--primary"]
                        )}
                        type="submit"
                    >
                        Aplicar filtros
                    </button>
                    <button
                        className={classNames(
                            styles["appointments-button"],
                            styles["appointments-button--ghost"]
                        )}
                        onClick={handleClearFilters}
                        type="button"
                    >
                        Limpiar
                    </button>
                </div>
            </form>

            {error && (
                <div
                    className={classNames(
                        styles["appointments-notice"],
                        styles["appointments-notice--error"]
                    )}
                    role="alert"
                >
                    <span>{error}</span>
                    <button onClick={() => void reload()} type="button">
                        Reintentar
                    </button>
                </div>
            )}

            <div className={styles["appointments-results-heading"]}>
                <div>
                    <h2>Agenda</h2>
                    <p>
                        {filters.date
                            ? `Mostrando turnos del ${filters.date.split("-").reverse().join("/")}`
                            : "Mostrando turnos de todas las fechas"}
                    </p>
                </div>
                {!loading && <span>{appointments.length} resultados</span>}
            </div>

            {loading ? (
                <div className={styles["appointments-state"]} aria-live="polite">
                    <span className={styles["appointments-loader"]} />
                    <strong>Cargando agenda...</strong>
                    <p>Estamos buscando los turnos que coinciden con los filtros.</p>
                </div>
            ) : appointments.length === 0 ? (
                <div className={styles["appointments-state"]}>
                    <span className={styles["appointments-state__mark"]}>0</span>
                    <strong>No hay turnos para mostrar</strong>
                    <p>Probá con otra fecha, estado o búsqueda de cliente.</p>
                </div>
            ) : (
                <AppointmentsTable
                    appointments={appointments}
                    onAction={handleAction}
                    onEdit={(appointmentId) =>
                        navigate(`/appointments/${appointmentId}/edit`)
                    }
                    updatingId={updatingId}
                />
            )}
        </section>
    );
}
