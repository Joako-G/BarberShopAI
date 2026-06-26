import { MessageCircle } from "lucide-react";
import type {
    Appointment,
    AppointmentAction,
    AppointmentStatus,
} from "../../types/appointment";
import { classNames } from "../../utils/classNames";
import styles from "../../pages/AppointmentsPage.module.css";

interface AppointmentsTableProps {
    appointments: Appointment[];
    updatingId: string | null;
    onAction: (appointment: Appointment, action: AppointmentAction) => void;
    onEdit: (appointmentId: string) => void;
}

interface ActionDefinition {
    action: AppointmentAction;
    label: string;
    tone: "primary" | "danger" | "neutral";
}

const statusLabels: Record<AppointmentStatus, string> = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    completed: "Completado",
    cancelled: "Cancelado",
    no_show: "Ausente",
};

const actionsByStatus: Record<AppointmentStatus, readonly ActionDefinition[]> = {
    pending: [
        { action: "confirm", label: "Confirmar", tone: "primary" },
        { action: "cancel", label: "Cancelar", tone: "danger" },
    ],
    confirmed: [
        { action: "complete", label: "Completar", tone: "primary" },
        { action: "no-show", label: "Marcar ausente", tone: "neutral" },
        { action: "cancel", label: "Cancelar", tone: "danger" },
    ],
    completed: [],
    cancelled: [],
    no_show: [],
};

function formatDate(date: string): string {
    const [year, month, day] = date.split("-").map(Number);

    return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(year, month - 1, day));
}

function formatTime(time: string): string {
    return time.slice(0, 5);
}

function formatMessageDate(date: string): string {
    const [year, month, day] = date.split("-").map(Number);

    return new Intl.DateTimeFormat("es-AR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
    }).format(new Date(year, month - 1, day));
}

function getAppointmentCustomer(appointment: Appointment): {
    fullName: string;
    phone: string;
} {
    return {
        fullName: appointment.customer?.full_name ?? appointment.guest_full_name ?? "Cliente pendiente",
        phone: appointment.customer?.phone ?? appointment.guest_phone ?? "Sin teléfono",
    };
}

function buildWhatsAppUrl(appointment: Appointment): string | null {
    const phone = appointment.customer?.phone ?? appointment.guest_phone;
    const normalizedPhone = phone?.replace(/\D/g, "");

    if (!normalizedPhone) return null;

    const customerName =
        appointment.customer?.full_name ?? appointment.guest_full_name ?? "buenas";
    const message = [
        `Hola ${customerName}, te escribimos de BarberShop para confirmar tu turno.`,
        `Servicio: ${appointment.service.name}.`,
        `Fecha: ${formatMessageDate(appointment.appointment_date)}.`,
        `Hora: ${formatTime(appointment.start_time)}.`,
        "¿Nos confirmás si vas a asistir?",
    ].join(" ");

    return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

export function AppointmentsTable({
    appointments,
    updatingId,
    onAction,
    onEdit,
}: AppointmentsTableProps) {
    return (
        <div className={styles["appointments-table-shell"]}>
            <table className={styles["appointments-table"]}>
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Servicio</th>
                        <th>Fecha</th>
                        <th>Horario</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map((appointment) => {
                        const isUpdating = updatingId === appointment.id;
                        const availableActions = actionsByStatus[appointment.status];
                        const appointmentCustomer = getAppointmentCustomer(appointment);
                        const whatsAppUrl =
                            appointment.status === "pending"
                                ? buildWhatsAppUrl(appointment)
                                : null;

                        return (
                            <tr key={appointment.id}>
                                <td data-label="Cliente">
                                    <div className={styles["appointments-table__value"]}>
                                        <strong>{appointmentCustomer.fullName}</strong>
                                        <span>({appointmentCustomer.phone})</span>
                                    </div>
                                </td>
                                <td data-label="Servicio">
                                    <div className={styles["appointments-table__value"]}>
                                        <strong>{appointment.service.name}</strong>
                                        <span>
                                            ({appointment.service.duration_minutes} min +{" "}
                                            {appointment.service.buffer_minutes} min)
                                        </span>
                                    </div>
                                </td>
                                <td data-label="Fecha">
                                    <div className={styles["appointments-table__value"]}>
                                        {formatDate(appointment.appointment_date)}
                                    </div>
                                </td>
                                <td data-label="Horario">
                                    <div className={styles["appointments-table__value"]}>
                                        {formatTime(appointment.start_time)}-{formatTime(appointment.end_time)}
                                    </div>
                                </td>
                                <td data-label="Estado">
                                    <div className={styles["appointments-table__value"]}>
                                        <span className={classNames(styles["appointment-status"], styles[`appointment-status--${appointment.status}`])}>
                                            {statusLabels[appointment.status]}
                                        </span>
                                    </div>
                                </td>
                                <td data-label="Acciones">
                                    {availableActions.length === 0 ? (
                                        <span className={styles["appointments-table__final"]}>Estado final</span>
                                    ) : (
                                        <div className={styles["appointments-actions-cell"]}>
                                            <div className={styles["appointments-actions"]}>
                                                {whatsAppUrl && (
                                                    <a
                                                        aria-label={`Contactar por WhatsApp a ${appointmentCustomer.fullName}`}
                                                        className={classNames(styles["appointment-action"], styles["appointment-action--whatsapp"])}
                                                        href={whatsAppUrl}
                                                        rel="noreferrer"
                                                        target="_blank"
                                                    >
                                                        <MessageCircle aria-hidden="true" size={14} />
                                                        WhatsApp
                                                    </a>
                                                )}
                                                <button
                                                    className={classNames(styles["appointment-action"], styles["appointment-action--edit"])}
                                                    disabled={isUpdating}
                                                    onClick={() => onEdit(appointment.id)}
                                                    type="button"
                                                >
                                                    Editar
                                                </button>
                                                {availableActions.map(({ action, label, tone }) => (
                                                    <button
                                                        className={classNames(styles["appointment-action"], styles[`appointment-action--${tone}`])}
                                                        disabled={isUpdating}
                                                        key={action}
                                                        onClick={() => onAction(appointment, action)}
                                                        type="button"
                                                    >
                                                        {isUpdating ? "Procesando..." : label}
                                                    </button>
                                                ))}
                                            </div>

                                            <details className={styles["appointments-actions-menu"]}>
                                                <summary
                                                    aria-label={`Abrir acciones para ${appointmentCustomer.fullName}`}
                                                    className={styles["appointments-actions-menu__trigger"]}
                                                >
                                                    <span aria-hidden="true">...</span>
                                                </summary>
                                                <div className={styles["appointments-actions-menu__content"]}>
                                                    {whatsAppUrl && (
                                                        <a
                                                            className={classNames(styles["appointments-actions-menu__item"], styles["appointments-actions-menu__item--whatsapp"])}
                                                            href={whatsAppUrl}
                                                            rel="noreferrer"
                                                            target="_blank"
                                                        >
                                                            WhatsApp
                                                        </a>
                                                    )}
                                                    <button
                                                        className={styles["appointments-actions-menu__item"]}
                                                        disabled={isUpdating}
                                                        onClick={() => onEdit(appointment.id)}
                                                        type="button"
                                                    >
                                                        Editar
                                                    </button>
                                                    {availableActions.map(({ action, label, tone }) => (
                                                        <button
                                                            className={classNames(styles["appointments-actions-menu__item"], styles[`appointments-actions-menu__item--${tone}`])}
                                                            disabled={isUpdating}
                                                            key={action}
                                                            onClick={() => onAction(appointment, action)}
                                                            type="button"
                                                        >
                                                            {isUpdating ? "Procesando..." : label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </details>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
