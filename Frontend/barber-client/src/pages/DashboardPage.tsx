import { useNavigate } from "react-router-dom";
import { useDashboard } from "../hooks/useDashboard";
import { SETTINGS_FALLBACK, useSettingsStore } from "../store/settingsStore";
import { classNames } from "../utils/classNames";
import sharedStyles from "../components/ui/styles/shared.module.css";
import styles from "./DashboardPage.module.css";

const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    completed: "Completado",
    cancelled: "Cancelado",
    no_show: "Ausente",
};

const statusClasses: Record<string, string> = {
    pending: sharedStyles.statusWarning,
    confirmed: sharedStyles.statusInfo,
    completed: sharedStyles.statusSuccess,
    cancelled: sharedStyles.statusError,
    no_show: sharedStyles.statusNeutral,
};

export function DashboardPage() {
    const { stats, upcomingAppointments, loading, error } = useDashboard();
    const settings = useSettingsStore((state) => state.settings);
    const navigate = useNavigate();

    const systemName = settings?.system_name ?? SETTINGS_FALLBACK.systemName;
    const businessName = settings?.business_name ?? SETTINGS_FALLBACK.businessName;

    if (loading) {
        return (
            <div className={classNames(sharedStyles.card, sharedStyles.loadingState)}>
                <span className={sharedStyles.loadingSpinner} />
                <strong>Preparando tu dashboard…</strong>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className={classNames(sharedStyles.card, sharedStyles.errorState)}>
                <strong>No pudimos cargar el dashboard</strong>
                <span>{error ?? "No hay datos disponibles."}</span>
            </div>
        );
    }

    const metrics = [
        { label: "Turnos de hoy", value: stats.appointmentsToday, meta: "Agenda diaria" },
        { label: "Confirmados", value: stats.confirmedAppointmentsToday, meta: "Listos para atender" },
        { label: "Completados", value: stats.completedAppointmentsToday, meta: "Finalizados hoy" },
        { label: "Clientes", value: stats.customersCount, meta: "Base registrada" },
    ];

    return (
        <section className={sharedStyles.page}>
            <header className={sharedStyles.pageHeader}>
                <div>
                    <span className={sharedStyles.pageEyebrow}>Resumen operativo</span>
                    <h1>{systemName}</h1>
                    <p>Una vista limpia de la jornada y los próximos movimientos de {businessName}.</p>
                </div>
                <button
                    className={classNames(sharedStyles.button, sharedStyles.buttonPrimary)}
                    onClick={() => navigate("/appointments/new")}
                    type="button"
                >
                    + Nuevo turno
                </button>
            </header>

            <div className={styles.grid}>
                {metrics.map((metric) => (
                    <article className={classNames(sharedStyles.card, styles.metricCard)} key={metric.label}>
                        <span className={styles.metricLabel}>{metric.label}</span>
                        <div className={styles.metricValue}>{metric.value}</div>
                        <span className={styles.metricMeta}>{metric.meta}</span>
                    </article>
                ))}

                <section className={classNames(sharedStyles.card, styles.main)}>
                    <div className={sharedStyles.cardHeader}>
                        <div>
                            <h2>Próximos turnos</h2>
                            <span className={sharedStyles.tableSecondary}>La agenda restante para hoy</span>
                        </div>
                        <button
                            className={classNames(sharedStyles.button, sharedStyles.buttonSecondary, sharedStyles.buttonQuiet)}
                            onClick={() => navigate("/appointments")}
                            type="button"
                        >
                            Ver agenda
                        </button>
                    </div>

                    {upcomingAppointments.length === 0 ? (
                        <div className={sharedStyles.emptyState}>
                            <strong>No quedan turnos próximos</strong>
                            <span>La jornada está despejada por ahora.</span>
                        </div>
                    ) : (
                        <div className={sharedStyles.tableShell}>
                            <table className={sharedStyles.dataTable}>
                                <thead>
                                    <tr>
                                        <th>Cliente</th>
                                        <th>Servicio</th>
                                        <th>Horario</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {upcomingAppointments.map((appointment) => (
                                        <tr key={appointment.id}>
                                            <td data-label="Cliente">
                                                <span className={sharedStyles.tablePrimary}>{appointment.customer_name}</span>
                                            </td>
                                            <td data-label="Servicio">{appointment.service_name}</td>
                                            <td data-label="Horario">
                                                <span className={sharedStyles.tableSecondary}>{appointment.start_time.slice(0, 5)}</span>
                                            </td>
                                            <td data-label="Estado">
                                                <span className={classNames(sharedStyles.statusChip, statusClasses[appointment.status] ?? sharedStyles.statusInfo)}>
                                                    {statusLabels[appointment.status] ?? appointment.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <aside className={classNames(sharedStyles.card, styles.side)}>
                    <div className={sharedStyles.cardHeader}>
                        <h2>Accesos rápidos</h2>
                    </div>
                    <div className={styles.quickActions}>
                        <button className={classNames(sharedStyles.button, sharedStyles.buttonPrimary)} onClick={() => navigate("/appointments/new")} type="button">
                            + Programar turno
                        </button>
                        <button className={classNames(sharedStyles.button, sharedStyles.buttonSecondary)} onClick={() => navigate("/customers/new")} type="button">
                            + Registrar cliente
                        </button>
                        <button className={classNames(sharedStyles.button, sharedStyles.buttonSecondary)} onClick={() => navigate("/services/new")} type="button">
                            + Crear servicio
                        </button>
                    </div>
                </aside>
            </div>
        </section>
    );
}
