import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
    publicBookingSchema,
    type PublicBookingFormData,
} from "../../schemas/publicBookingSchema";
import {
    createPublicAppointment,
    getAvailableSlots,
} from "../../services/appointmentsApi";
import { notifyError, notifySuccess } from "../../services/notifications";
import { getActiveServices } from "../../services/serviceApi";
import type { Appointment } from "../../types/appointment";
import type { Service } from "../../types/service";
import { getBusinessDate } from "../../utils/businessTime";
import { classNames } from "../../utils/classNames";
import {
    DEFAULT_PHONE_COUNTRY_CODE,
    buildInternationalPhone,
    keepDigitsOnly,
    phoneCountryOptions,
    type PhoneCountryCode,
} from "../../utils/phoneInput";
import styles from "../../pages/PublicBookingPage.module.css";
import sharedStyles from "../ui/styles/shared.module.css";

interface PublicBookingFormProps {
    onSuccess: (appointment: Appointment) => void;
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data?.error?.message;

        if (typeof backendMessage === "string") {
            return backendMessage;
        }
    }

    return error instanceof Error ? error.message : fallback;
}

function formatPrice(price: number): string {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
    }).format(price);
}

export function PublicBookingForm({ onSuccess }: PublicBookingFormProps) {
    const [services, setServices] = useState<Service[]>([]);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [servicesLoading, setServicesLoading] = useState(true);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [servicesError, setServicesError] = useState<string | null>(null);
    const [slotsError, setSlotsError] = useState<string | null>(null);
    const [phoneCountryCode, setPhoneCountryCode] = useState<PhoneCountryCode>(
        DEFAULT_PHONE_COUNTRY_CODE
    );

    const {
        control,
        register,
        handleSubmit,
        getValues,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<PublicBookingFormData>({
        resolver: zodResolver(publicBookingSchema),
        defaultValues: {
            full_name: "",
            phone: "",
            email: "",
            service_id: "",
            appointment_date: "",
            start_time: "",
            notes: "",
        },
    });

    const selectedServiceId = useWatch({ control, name: "service_id" });
    const selectedDate = useWatch({ control, name: "appointment_date" });
    const selectedService = useMemo(
        () => services.find((service) => service.id === selectedServiceId),
        [selectedServiceId, services]
    );

    useEffect(() => {
        const loadServices = async () => {
            setServicesLoading(true);
            setServicesError(null);

            try {
                setServices(await getActiveServices());
            } catch (error) {
                setServicesError(
                    getErrorMessage(error, "No pudimos cargar los servicios.")
                );
            } finally {
                setServicesLoading(false);
            }
        };

        void loadServices();
    }, []);

    useEffect(() => {
        let cancelled = false;
        const requestId = window.setTimeout(() => {
            setAvailableSlots([]);
            setSlotsError(null);
            setValue("start_time", "");

            if (!selectedServiceId || !selectedDate) {
                return;
            }

            const loadSlots = async () => {
                setSlotsLoading(true);

                try {
                    const slots = await getAvailableSlots({
                        serviceId: selectedServiceId,
                        date: selectedDate,
                    });

                    if (!cancelled) {
                        setAvailableSlots(slots);
                    }
                } catch (error) {
                    if (!cancelled) {
                        setSlotsError(
                            getErrorMessage(
                                error,
                                "No pudimos consultar los horarios disponibles."
                            )
                        );
                    }
                } finally {
                    if (!cancelled) {
                        setSlotsLoading(false);
                    }
                }
            };

            void loadSlots();
        }, 0);

        return () => {
            cancelled = true;
            window.clearTimeout(requestId);
        };
    }, [selectedDate, selectedServiceId, setValue]);

    const handleBooking = async (data: PublicBookingFormData) => {
        try {
            const appointment = await createPublicAppointment({
                full_name: data.full_name.trim(),
                phone: buildInternationalPhone(phoneCountryCode, data.phone),
                email: data.email.trim() || null,
                service_id: data.service_id,
                appointment_date: data.appointment_date,
                start_time: data.start_time,
                notes: data.notes?.trim() || null,
            });

            notifySuccess({
                title: "Reserva solicitada",
                description: "Tu turno quedó pendiente de confirmación.",
            });
            onSuccess(appointment);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 409) {
                notifyError({
                    title: "Horario no disponible",
                    description: "El horario seleccionado ya no está disponible.",
                });
                setValue("start_time", "");

                try {
                    const slots = await getAvailableSlots({
                        serviceId: getValues("service_id"),
                        date: getValues("appointment_date"),
                    });
                    setAvailableSlots(slots);
                } catch {
                    setAvailableSlots([]);
                }

                return;
            }

            notifyError({
                title: "No pudimos registrar la reserva",
                description: getErrorMessage(
                    error,
                    "No pudimos registrar la reserva. Intentá nuevamente."
                ),
            });
        }
    };

    if (servicesLoading) {
        return (
            <div className={styles["booking-state"]} aria-live="polite">
                <span className={sharedStyles.loadingSpinner} />
                <strong>Preparando la agenda...</strong>
            </div>
        );
    }

    if (servicesError) {
        return (
            <div className={classNames(styles["booking-state"], styles["booking-state--error"])} role="alert">
                <strong>No pudimos abrir la agenda</strong>
                <span>{servicesError}</span>
            </div>
        );
    }

    if (services.length === 0) {
        return (
            <div className={styles["booking-state"]}>
                <strong>No hay servicios disponibles</strong>
                <span>Volvé a intentarlo más tarde.</span>
            </div>
        );
    }

    return (
        <form className={styles["booking-form"]} onSubmit={handleSubmit(handleBooking)}>
            <section className={styles["booking-form__section"]}>
                <header>
                    <span>01</span>
                    <div>
                        <h2>Elegí tu servicio</h2>
                        <p>Seleccioná la experiencia que querés reservar.</p>
                    </div>
                </header>

                <div className={styles["booking-services"]}>
                    {services.map((service) => (
                        <label
                            className={styles["booking-service"]}
                            key={service.id}
                        >
                            <input
                                type="radio"
                                value={service.id}
                                {...register("service_id")}
                            />
                            <span className={styles["booking-service__content"]}>
                                <strong>{service.name}</strong>
                                <small>
                                    {service.duration_minutes} min · {formatPrice(service.price)}
                                </small>
                                {service.description && <em>{service.description}</em>}
                            </span>
                        </label>
                    ))}
                </div>
                {errors.service_id && (
                    <span className={styles["booking-field__error"]}>{errors.service_id.message}</span>
                )}
            </section>

            <section className={styles["booking-form__section"]}>
                <header>
                    <span>02</span>
                    <div>
                        <h2>Fecha y horario</h2>
                        <p>Los horarios se actualizan en tiempo real.</p>
                    </div>
                </header>

                <div className={styles["booking-schedule"]}>
                    <label className={styles["booking-field"]}>
                        <span>Fecha</span>
                        <input
                            min={getBusinessDate()}
                            type="date"
                            {...register("appointment_date")}
                        />
                        {errors.appointment_date && (
                            <em>{errors.appointment_date.message}</em>
                        )}
                    </label>

                    <div className={styles["booking-field"]}>
                        <span>Horario</span>
                        {!selectedServiceId || !selectedDate ? (
                            <div className={styles["booking-slots-placeholder"]}>
                                Elegí servicio y fecha para ver horarios.
                            </div>
                        ) : slotsLoading ? (
                            <div className={styles["booking-slots-placeholder"]}>
                                Consultando horarios...
                            </div>
                        ) : slotsError ? (
                            <div className={classNames(styles["booking-slots-placeholder"], styles["booking-slots-placeholder--error"])}>
                                {slotsError}
                            </div>
                        ) : availableSlots.length === 0 ? (
                            <div className={styles["booking-slots-placeholder"]}>
                                No quedan horarios disponibles para ese día.
                            </div>
                        ) : (
                            <div className={styles["booking-slots"]}>
                                {availableSlots.map((slot) => (
                                    <label key={slot}>
                                        <input
                                            type="radio"
                                            value={slot}
                                            {...register("start_time")}
                                        />
                                        <span>{slot}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                        {errors.start_time && <em>{errors.start_time.message}</em>}
                    </div>
                </div>

                {selectedService && (
                    <div className={styles["booking-summary-line"]}>
                        <span>{selectedService.name}</span>
                        <strong>
                            {selectedService.duration_minutes + selectedService.buffer_minutes} min
                            reservados
                        </strong>
                    </div>
                )}
            </section>

            <section className={styles["booking-form__section"]}>
                <header>
                    <span>03</span>
                    <div>
                        <h2>Tus datos</h2>
                        <p>No necesitás crear una cuenta.</p>
                    </div>
                </header>

                <div className={styles["booking-details"]}>
                    <label className={classNames(styles["booking-field"], styles["booking-field--wide"])}>
                        <span>Nombre completo</span>
                        <input
                            autoComplete="name"
                            placeholder="Ej. Juan Pérez"
                            type="text"
                            {...register("full_name")}
                        />
                        {errors.full_name && <em>{errors.full_name.message}</em>}
                    </label>

                    <label className={styles["booking-field"]}>
                        <span>Teléfono</span>
                        <div className={styles["booking-phone-input"]}>
                            <select
                                aria-label="Código de país"
                                value={phoneCountryCode}
                                onChange={(event) =>
                                    setPhoneCountryCode(event.target.value as PhoneCountryCode)
                                }
                            >
                                {phoneCountryOptions.map((option) => (
                                    <option key={option.code} value={option.code}>
                                        {option.code} {option.label}
                                    </option>
                                ))}
                            </select>
                            <input
                                autoComplete="tel-national"
                                inputMode="numeric"
                                maxLength={15}
                                pattern="[0-9]*"
                                placeholder="2915551234"
                                type="tel"
                                {...register("phone", { onChange: keepDigitsOnly })}
                            />
                        </div>
                        {errors.phone && <em>{errors.phone.message}</em>}
                    </label>

                    <label className={styles["booking-field"]}>
                        <span>Email opcional</span>
                        <input
                            autoComplete="email"
                            placeholder="cliente@email.com"
                            type="email"
                            {...register("email")}
                        />
                        {errors.email && <em>{errors.email.message}</em>}
                    </label>

                    <label className={classNames(styles["booking-field"], styles["booking-field--wide"])}>
                        <span>Notas opcionales</span>
                        <textarea
                            placeholder="Contanos si necesitás que tengamos algo en cuenta"
                            rows={3}
                            {...register("notes")}
                        />
                        {errors.notes && <em>{errors.notes.message}</em>}
                    </label>
                </div>
            </section>

            <footer className={styles["booking-form__footer"]}>
                <p>
                    La reserva quedará pendiente hasta que la barbería la confirme.
                </p>
                <button
                    className={classNames(sharedStyles.button, sharedStyles.buttonPrimary, styles["booking-submit"])}
                    disabled={isSubmitting || slotsLoading}
                    type="submit"
                >
                    {isSubmitting ? "Reservando..." : "Solicitar turno"}
                </button>
            </footer>
        </form>
    );
}
