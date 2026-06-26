import { useState } from "react";
import { Link } from "react-router-dom";
import { PublicBookingForm } from "../components/booking/PublicBookingForm";
import sharedStyles from "../components/ui/styles/shared.module.css";
import type { Appointment } from "../types/appointment";
import { classNames } from "../utils/classNames";
import styles from "./PublicBookingPage.module.css";

function formatBookingDate(date: string): string {
    return new Intl.DateTimeFormat("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    }).format(new Date(`${date}T12:00:00`));
}

export function PublicBookingPage() {
    const [appointment, setAppointment] = useState<Appointment | null>(null);

    return (
        <main className={styles["booking-page"]}>
            <nav className={styles["booking-nav"]} aria-label="Navegación pública">
                <Link className={styles["booking-brand"]} to="/reservar">
                    <span className={styles["booking-brand-mark"]}>BS</span>
                    <span>
                        <strong>BarberShop</strong>
                        <small>Turnos online</small>
                    </span>
                </Link>
                <Link className={styles["booking-admin-link"]} to="/login">
                    Acceso administrativo
                </Link>
            </nav>

            <section className={styles["booking-hero"]}>
                <div className={styles["booking-hero__copy"]}>
                    <span className={styles["booking-eyebrow"]}>Tu próximo corte, en agenda</span>
                    <h1>Reservá tu turno sin llamadas ni esperas.</h1>
                    <p>
                        Elegí el servicio y el horario que mejor te quede. No necesitás
                        registrarte.
                    </p>
                    <div className={styles["booking-benefits"]} aria-label="Beneficios">
                        <span>Agenda en tiempo real</span>
                        <span>Sin crear cuenta</span>
                        <span>Confirmación del local</span>
                    </div>
                </div>

                <aside className={styles["booking-hero__card"]}>
                    <span>Horarios</span>
                    <strong>Lunes a sábado</strong>
                    <p>09:00 a 18:00</p>
                    <small>Los turnos solicitados quedan pendientes de confirmación.</small>
                </aside>
            </section>

            <section className={styles["booking-workspace"]}>
                {appointment ? (
                    <div className={styles["booking-success"]} role="status">
                        <span className={styles["booking-success__mark"]}>✓</span>
                        <span className={styles["booking-eyebrow"]}>Solicitud recibida</span>
                        <h2>Tu turno quedó pendiente.</h2>
                        <p>
                            Reservaste <strong>{appointment.service.name}</strong> para el{" "}
                            <strong>{formatBookingDate(appointment.appointment_date)}</strong>{" "}
                            a las <strong>{appointment.start_time.slice(0, 5)}</strong>.
                        </p>
                        <div className={styles["booking-success__detail"]}>
                            <span>Cliente</span>
                            <strong>{appointment.customer.full_name}</strong>
                            <span>Estado</span>
                            <strong>Pendiente de confirmación</strong>
                        </div>
                        <button
                            className={classNames(sharedStyles.button, sharedStyles.buttonSecondary)}
                            onClick={() => setAppointment(null)}
                            type="button"
                        >
                            Solicitar otro turno
                        </button>
                    </div>
                ) : (
                    <>
                        <header className={styles["booking-workspace__header"]}>
                            <span className={styles["booking-eyebrow"]}>Reserva online</span>
                            <h2>Armá tu turno</h2>
                            <p>Solo te llevará un minuto.</p>
                        </header>
                        <PublicBookingForm onSuccess={setAppointment} />
                    </>
                )}
            </section>

            <footer className={styles["booking-page__footer"]}>
                <span>BarberShop · Aura</span>
                <span>Reserva simple, atención personal.</span>
            </footer>
        </main>
    );
}
