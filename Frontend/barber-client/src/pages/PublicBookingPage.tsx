import { useState } from "react";
import {
    CalendarCheck,
    Clock3,
    HelpCircle,
    LockKeyhole,
    MapPin,
    MessageCircle,
    Scissors,
    ShieldCheck,
} from "lucide-react";
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

function getAppointmentCustomerName(appointment: Appointment): string {
    return appointment.customer?.full_name ?? appointment.guest_full_name ?? "Cliente pendiente";
}

export function PublicBookingPage() {
    const [appointment, setAppointment] = useState<Appointment | null>(null);

    return (
        <main className={styles["booking-page"]}>
            <nav className={styles["booking-nav"]} aria-label="Navegacion publica">
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
                    <span className={styles["booking-pill"]}>
                        <Scissors aria-hidden="true" size={16} />
                        Reserva online sin cuenta
                    </span>
                    <h1>Pedi tu turno en BarberShop.</h1>
                    <p>
                        Elegi servicio, fecha y horario disponible. El local confirma tu
                        solicitud para que llegues con todo coordinado.
                    </p>

                    <div className={styles["booking-benefits"]} aria-label="Beneficios">
                        <span>
                            <CalendarCheck aria-hidden="true" size={16} />
                            Horarios disponibles al momento
                        </span>
                        <span>
                            <LockKeyhole aria-hidden="true" size={16} />
                            Sin crear cuenta
                        </span>
                        <span>
                            <ShieldCheck aria-hidden="true" size={16} />
                            Confirmacion directa del local
                        </span>
                    </div>
                </div>

                <aside className={styles["booking-hero__panel"]} aria-label="Datos de la agenda">
                    <div className={styles["booking-hero__panel-header"]}>
                        <Clock3 aria-hidden="true" size={18} />
                        <span>Agenda del local</span>
                    </div>
                    <strong>Lunes a sabado</strong>
                    <p>09:00 a 21:00</p>
                    <small>Tu solicitud queda pendiente hasta que la barberia la confirme.</small>
                </aside>
            </section>

            <section className={styles["booking-flow"]} aria-label="Como funciona">
                <div>
                    <span>1</span>
                    <strong>Elegi servicio</strong>
                    <p>Ves duracion y precio antes de avanzar.</p>
                </div>
                <div>
                    <span>2</span>
                    <strong>Selecciona horario</strong>
                    <p>El desplegable muestra solo turnos disponibles.</p>
                </div>
                <div>
                    <span>3</span>
                    <strong>Espera confirmacion</strong>
                    <p>El local valida la agenda y te responde.</p>
                </div>
            </section>

            <section className={styles["booking-workspace"]} aria-label="Formulario de reserva">
                {appointment ? (
                    <div className={styles["booking-success"]} role="status">
                        <span className={styles["booking-success__mark"]}>
                            <CalendarCheck aria-hidden="true" size={30} />
                        </span>
                        <span className={styles["booking-eyebrow"]}>Solicitud recibida</span>
                        <h2>Tu pedido de turno ya llego.</h2>
                        <p>
                            Reservaste <strong>{appointment.service.name}</strong> para el{" "}
                            <strong>{formatBookingDate(appointment.appointment_date)}</strong>{" "}
                            a las <strong>{appointment.start_time.slice(0, 5)}</strong>. Te van a
                            confirmar desde la barberia.
                        </p>
                        <div className={styles["booking-success__detail"]}>
                            <span>Cliente</span>
                            <strong>{getAppointmentCustomerName(appointment)}</strong>
                            <span>Estado</span>
                            <strong>Pendiente de confirmacion</strong>
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
                            <h2>Arma tu turno</h2>
                            <p>Completa estos datos y deja tu solicitud en agenda.</p>
                        </header>
                        <PublicBookingForm onSuccess={setAppointment} />
                    </>
                )}
            </section>

            <section className={styles["booking-info-grid"]} aria-label="Informacion para reservar">
                <article className={styles["booking-info-card"]}>
                    <ShieldCheck aria-hidden="true" size={22} />
                    <h2>Reserva clara, sin vueltas</h2>
                    <ul>
                        <li>No necesitas crear una cuenta.</li>
                        <li>El pedido queda pendiente de confirmacion.</li>
                        <li>Tus datos se usan solo para coordinar el turno.</li>
                    </ul>
                </article>

                <article className={styles["booking-info-card"]}>
                    <MapPin aria-hidden="true" size={22} />
                    <h2>Ubicacion y contacto</h2>
                    <p>Atencion presencial con agenda de lunes a sabado.</p>
                    <div className={styles["booking-contact-list"]}>
                        <span>
                            <Clock3 aria-hidden="true" size={16} />
                            09:00 a 21:00
                        </span>
                        <span>
                            <MessageCircle aria-hidden="true" size={16} />
                            Confirmacion por el local
                        </span>
                    </div>
                </article>

                <article className={classNames(styles["booking-info-card"], styles["booking-info-card--faq"])}>
                    <HelpCircle aria-hidden="true" size={22} />
                    <h2>Preguntas rapidas</h2>
                    <details>
                        <summary>El turno queda confirmado automaticamente?</summary>
                        <p>No. La barberia revisa la solicitud y confirma el turno.</p>
                    </details>
                    <details>
                        <summary>Necesito registrarme?</summary>
                        <p>No. Solo dejas los datos necesarios para coordinar la reserva.</p>
                    </details>
                    <details>
                        <summary>Puedo cambiar el horario?</summary>
                        <p>Si necesitas modificarlo, contacta al local luego de pedir el turno.</p>
                    </details>
                </article>
            </section>

            <footer className={styles["booking-page__footer"]}>
                <span>BarberShop · Aura</span>
                <span>Reserva simple, atencion personal.</span>
            </footer>
        </main>
    );
}
