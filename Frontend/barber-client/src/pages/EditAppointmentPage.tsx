import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppointmentForm } from "../components/appointments/AppointmentForm";
import type { AppointmentFormData } from "../schemas/appointmentSchema";
import {
    getAppointmentById,
    updateAppointment,
} from "../services/appointmentsApi";
import { notifyError, notifySuccess } from "../services/notifications";
import type { Appointment } from "../types/appointment";
import { classNames } from "../utils/classNames";
import styles from "./AppointmentsPage.module.css";

function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data?.error?.message;
        if (typeof backendMessage === "string") return backendMessage;
    }

    return error instanceof Error
        ? error.message
        : "No se pudo procesar el turno.";
}

function getAppointmentCustomerName(appointment: Appointment): string {
    return appointment.customer?.full_name ?? appointment.guest_full_name ?? "Cliente pendiente";
}

export function EditAppointmentPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const requestId = window.setTimeout(() => {
            const loadAppointment = async () => {
                if (!id) {
                    setError("El identificador del turno no es válido.");
                    setLoading(false);
                    return;
                }

                try {
                    const data = await getAppointmentById(id);
                    setAppointment(data);
                } catch (loadError) {
                    setError(getErrorMessage(loadError));
                } finally {
                    setLoading(false);
                }
            };

            void loadAppointment();
        }, 0);

        return () => window.clearTimeout(requestId);
    }, [id]);

    const handleUpdate = async (data: AppointmentFormData) => {
        if (!id) return;

        try {
            await updateAppointment(id, {
                service_id: data.service_id,
                appointment_date: data.appointment_date,
                start_time: data.start_time,
                notes: data.notes?.trim() || null,
            });

            notifySuccess({
                title: "Turno actualizado",
                description: "El turno se actualizó correctamente.",
            });
            navigate("/appointments");
        } catch (updateError) {
            notifyError({
                title: "No se pudieron guardar los cambios",
                description: getErrorMessage(updateError),
            });
        }
    };

    if (loading) {
        return (
            <section className={styles["appointments-page"]}>
                <div className={styles["appointments-state"]}>Cargando turno...</div>
            </section>
        );
    }

    if (!appointment) {
        return (
            <section className={styles["appointments-page"]}>
                <div className={classNames(styles["appointments-notice"], styles["appointments-notice--error"])}>
                    {error ?? "Turno no encontrado."}
                </div>
            </section>
        );
    }

    if (
        appointment.status === "completed" ||
        appointment.status === "cancelled" ||
        appointment.status === "no_show"
    ) {
        return (
            <section className={styles["appointments-page"]}>
                <div className={classNames(styles["appointments-notice"], styles["appointments-notice--error"])}>
                    Los turnos en estado final no pueden editarse.
                </div>
                <button
                    className={classNames(styles["appointments-button"], styles["appointments-button--ghost"])}
                    onClick={() => navigate("/appointments")}
                    type="button"
                >
                    Volver a la agenda
                </button>
            </section>
        );
    }

    return (
        <section className={styles["appointments-page"]}>
            <header className={styles["appointments-form-heading"]}>
                <span className={styles["appointments-eyebrow"]}>Agenda administrativa</span>
                <h1>Editar turno</h1>
                <p>
                    Cliente: <strong>{getAppointmentCustomerName(appointment)}</strong>. El estado
                    se gestiona desde la agenda.
                </p>
            </header>

            <AppointmentForm
                excludeAppointmentId={appointment.id}
                initialValues={{
                    customer_id: appointment.customer_id ?? undefined,
                    full_name: appointment.guest_full_name ?? appointment.customer?.full_name ?? "",
                    phone: appointment.guest_phone ?? appointment.customer?.phone ?? "",
                    email: appointment.guest_email ?? appointment.customer?.email ?? "",
                    service_id: appointment.service_id,
                    appointment_date: appointment.appointment_date,
                    start_time: appointment.start_time.slice(0, 5),
                    notes: appointment.notes ?? "",
                }}
                lockCustomer
                onCancel={() => navigate("/appointments")}
                onSubmit={handleUpdate}
                submitText="Guardar cambios"
            />
        </section>
    );
}
