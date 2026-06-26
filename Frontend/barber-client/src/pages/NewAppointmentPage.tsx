import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppointmentForm } from "../components/appointments/AppointmentForm";
import type { AppointmentFormData } from "../schemas/appointmentSchema";
import { createAdminAppointment } from "../services/appointmentsApi";
import { notifyError, notifySuccess } from "../services/notifications";
import styles from "./AppointmentsPage.module.css";

function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data?.error?.message;
        if (typeof backendMessage === "string") return backendMessage;
    }

    return error instanceof Error
        ? error.message
        : "No se pudo crear el turno.";
}

export function NewAppointmentPage() {
    const navigate = useNavigate();

    const handleCreate = async (data: AppointmentFormData) => {
        try {
            const schedule = {
                service_id: data.service_id,
                appointment_date: data.appointment_date,
                start_time: data.start_time,
                notes: data.notes?.trim() || null,
            };

            if (data.customer_mode === "existing") {
                await createAdminAppointment({
                    ...schedule,
                    customer_mode: "existing",
                    customer_id: data.customer_id!,
                });
            } else {
                await createAdminAppointment({
                    ...schedule,
                    customer_mode: "new",
                    full_name: data.full_name!.trim(),
                    phone: data.phone!,
                    email: data.email?.trim() || null,
                });
            }

            notifySuccess({
                title: "Turno creado",
                description: "El turno confirmado se creó correctamente.",
            });
            navigate("/appointments");
        } catch (createError) {
            notifyError({
                title: "No se pudo crear el turno",
                description: getErrorMessage(createError),
            });
        }
    };

    return (
        <section className={styles["appointments-page"]}>
            <header className={styles["appointments-form-heading"]}>
                <span className={styles["appointments-eyebrow"]}>Agenda administrativa</span>
                <h1>Nuevo turno</h1>
                <p>Los turnos creados desde el panel comienzan confirmados.</p>
            </header>

            <AppointmentForm
                onCancel={() => navigate("/appointments")}
                onSubmit={handleCreate}
                submitText="Crear turno"
            />
        </section>
    );
}
