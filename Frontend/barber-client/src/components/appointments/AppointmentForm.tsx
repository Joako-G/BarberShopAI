import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
    appointmentSchema,
    type AppointmentFormData,
} from "../../schemas/appointmentSchema";
import { getAvailableSlots } from "../../services/appointmentsApi";
import { getCustomers } from "../../services/customerApi";
import { getServices } from "../../services/serviceApi";
import type { Customer } from "../../types/customer";
import type { Service } from "../../types/service";
import { classNames } from "../../utils/classNames";
import appointmentStyles from "../../pages/AppointmentsPage.module.css";
import styles from "./AppointmentForm.module.css";

interface AppointmentFormProps {
    initialValues?: Partial<AppointmentFormData>;
    excludeAppointmentId?: string;
    lockCustomer?: boolean;
    submitText: string;
    onSubmit: (data: AppointmentFormData) => Promise<void>;
    onCancel: () => void;
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

export function AppointmentForm({
    initialValues,
    excludeAppointmentId,
    lockCustomer = false,
    submitText,
    onSubmit,
    onCancel,
}: AppointmentFormProps) {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [optionsLoading, setOptionsLoading] = useState(true);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [optionsError, setOptionsError] = useState<string | null>(null);
    const [slotsError, setSlotsError] = useState<string | null>(null);

    const {
        control,
        register,
        handleSubmit,
        getValues,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<AppointmentFormData>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            customer_mode: "existing",
            customer_id: initialValues?.customer_id ?? "",
            full_name: "",
            phone: "",
            email: "",
            service_id: initialValues?.service_id ?? "",
            appointment_date: initialValues?.appointment_date ?? "",
            start_time: initialValues?.start_time?.slice(0, 5) ?? "",
            notes: initialValues?.notes ?? "",
        },
    });

    const selectedServiceId = useWatch({ control, name: "service_id" });
    const selectedDate = useWatch({ control, name: "appointment_date" });
    const customerMode = useWatch({ control, name: "customer_mode" });

    useEffect(() => {
        const requestId = window.setTimeout(() => {
            const loadOptions = async () => {
                setOptionsLoading(true);
                setOptionsError(null);

                try {
                    const [customerData, serviceData] = await Promise.all([
                        getCustomers(),
                        getServices(),
                    ]);
                    setCustomers(customerData);
                    setServices(serviceData);
                } catch (error) {
                    setOptionsError(
                        getErrorMessage(
                            error,
                            "No se pudieron cargar clientes y servicios."
                        )
                    );
                } finally {
                    setOptionsLoading(false);
                }
            };

            void loadOptions();
        }, 0);

        return () => window.clearTimeout(requestId);
    }, []);

    useEffect(() => {
        if (!selectedServiceId || !selectedDate) {
            return;
        }

        const requestId = window.setTimeout(() => {
            const loadSlots = async () => {
                setSlotsLoading(true);
                setSlotsError(null);

                try {
                    const slots = await getAvailableSlots({
                        serviceId: selectedServiceId,
                        date: selectedDate,
                        excludeAppointmentId,
                    });

                    const currentInitialTime = initialValues?.start_time?.slice(0, 5);
                    const isOriginalSelection =
                        initialValues?.service_id === selectedServiceId &&
                        initialValues?.appointment_date === selectedDate;
                    const slotsWithCurrent =
                        isOriginalSelection &&
                        currentInitialTime &&
                        !slots.includes(currentInitialTime)
                            ? [currentInitialTime, ...slots].sort()
                            : slots;

                    setAvailableSlots(slotsWithCurrent);

                    const currentStartTime = getValues("start_time");

                    if (
                        currentStartTime &&
                        !slotsWithCurrent.includes(currentStartTime)
                    ) {
                        setValue("start_time", "");
                    }
                } catch (error) {
                    setAvailableSlots([]);
                    setSlotsError(
                        getErrorMessage(
                            error,
                            "No se pudieron consultar los horarios disponibles."
                        )
                    );
                } finally {
                    setSlotsLoading(false);
                }
            };

            void loadSlots();
        }, 0);

        return () => window.clearTimeout(requestId);
    }, [
        excludeAppointmentId,
        initialValues?.appointment_date,
        initialValues?.service_id,
        initialValues?.start_time,
        selectedDate,
        selectedServiceId,
        getValues,
        setValue,
    ]);

    const selectableServices = useMemo(
        () =>
            services.filter(
                (service) =>
                    service.is_active || service.id === initialValues?.service_id
            ),
        [initialValues?.service_id, services]
    );

    if (optionsLoading) {
        return (
            <div className={styles["appointment-form-state"]} aria-live="polite">
                Cargando datos del formulario…
            </div>
        );
    }

    if (optionsError) {
        return (
            <div className={classNames(styles["appointment-form-state"], styles["appointment-form-state--error"])} role="alert">
                {optionsError}
            </div>
        );
    }

    return (
        <form className={styles["appointment-form"]} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles["appointment-form__grid"]}>
                {lockCustomer ? (
                    <label className={classNames(styles["appointment-form__field"], styles["appointment-form__field--wide"])}>
                        <span>Cliente</span>
                        <select disabled value={initialValues?.customer_id ?? ""}>
                            {customers.map((customer) => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.full_name} · {customer.phone}
                                </option>
                            ))}
                        </select>
                        <input type="hidden" {...register("customer_mode")} />
                        <input
                            type="hidden"
                            value={initialValues?.customer_id ?? ""}
                            {...register("customer_id")}
                        />
                        <small>El cliente no puede cambiarse después de crear el turno.</small>
                    </label>
                ) : (
                    <fieldset className={classNames(styles["appointment-form__customer"], styles["appointment-form__field--wide"])}>
                        <legend>Cliente</legend>
                        <div className={styles["appointment-form__customer-mode"]}>
                            <label>
                                <input
                                    type="radio"
                                    value="existing"
                                    {...register("customer_mode")}
                                />
                                <span>Cliente registrado</span>
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="new"
                                    {...register("customer_mode")}
                                />
                                <span>Cliente nuevo</span>
                            </label>
                        </div>

                        {customerMode === "existing" ? (
                            <label className={styles["appointment-form__field"]}>
                                <span>Cliente registrado</span>
                                <select {...register("customer_id")}>
                                    <option value="">Seleccionar cliente</option>
                                    {customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.full_name} · {customer.phone}
                                        </option>
                                    ))}
                                </select>
                                {customers.length === 0 && (
                                    <small>
                                        No hay clientes registrados. Elegí “Cliente nuevo” para
                                        continuar.
                                    </small>
                                )}
                                {errors.customer_id && <em>{errors.customer_id.message}</em>}
                            </label>
                        ) : (
                            <div className={styles["appointment-form__new-customer"]}>
                                <label className={styles["appointment-form__field"]}>
                                    <span>Nombre completo</span>
                                    <input
                                        autoComplete="name"
                                        placeholder="Ej. Juan Pérez"
                                        type="text"
                                        {...register("full_name")}
                                    />
                                    {errors.full_name && <em>{errors.full_name.message}</em>}
                                </label>

                                <label className={styles["appointment-form__field"]}>
                                    <span>Teléfono</span>
                                    <input
                                        autoComplete="tel"
                                        inputMode="tel"
                                        placeholder="2915551234"
                                        type="text"
                                        {...register("phone")}
                                    />
                                    {errors.phone && <em>{errors.phone.message}</em>}
                                </label>

                                <label className={styles["appointment-form__field"]}>
                                    <span>Email opcional</span>
                                    <input
                                        autoComplete="email"
                                        placeholder="cliente@email.com"
                                        type="email"
                                        {...register("email")}
                                    />
                                    {errors.email && <em>{errors.email.message}</em>}
                                </label>
                            </div>
                        )}
                    </fieldset>
                )}

                <label className={styles["appointment-form__field"]}>
                    <span>Servicio</span>
                    <select {...register("service_id")}>
                        <option value="">Seleccionar servicio</option>
                        {selectableServices.map((service) => (
                            <option key={service.id} value={service.id}>
                                {service.name} · {service.duration_minutes + service.buffer_minutes} min
                                {!service.is_active ? " · Inactivo" : ""}
                            </option>
                        ))}
                    </select>
                    {selectableServices.length === 0 && (
                        <small>No hay servicios activos disponibles.</small>
                    )}
                    {errors.service_id && <em>{errors.service_id.message}</em>}
                </label>

                <label className={styles["appointment-form__field"]}>
                    <span>Fecha</span>
                    <input type="date" {...register("appointment_date")} />
                    {errors.appointment_date && (
                        <em>{errors.appointment_date.message}</em>
                    )}
                </label>

                <label className={styles["appointment-form__field"]}>
                    <span>Horario</span>
                    <select
                        disabled={
                            !selectedServiceId ||
                            !selectedDate ||
                            slotsLoading ||
                            Boolean(slotsError)
                        }
                        {...register("start_time")}
                    >
                        <option value="">
                            {slotsLoading
                                ? "Consultando horarios…"
                                : "Seleccionar horario"}
                        </option>
                        {availableSlots.map((slot) => (
                            <option key={slot} value={slot}>
                                {slot}
                            </option>
                        ))}
                    </select>
                    {!slotsLoading &&
                        selectedServiceId &&
                        selectedDate &&
                        availableSlots.length === 0 &&
                        !slotsError && (
                            <small>No hay horarios disponibles para esta selección.</small>
                        )}
                    {slotsError && <em>{slotsError}</em>}
                    {errors.start_time && <em>{errors.start_time.message}</em>}
                </label>

                <label className={classNames(styles["appointment-form__field"], styles["appointment-form__field--wide"])}>
                    <span>Notas</span>
                    <textarea
                        placeholder="Información opcional para el turno"
                        rows={4}
                        {...register("notes")}
                    />
                    {errors.notes && <em>{errors.notes.message}</em>}
                </label>
            </div>

            <div className={styles["appointment-form__actions"]}>
                <button
                    className={classNames(appointmentStyles["appointments-button"], appointmentStyles["appointments-button--ghost"])}
                    disabled={isSubmitting}
                    onClick={onCancel}
                    type="button"
                >
                    Cancelar
                </button>
                <button
                    className={classNames(appointmentStyles["appointments-button"], appointmentStyles["appointments-button--primary"])}
                    disabled={isSubmitting || slotsLoading}
                    type="submit"
                >
                    {isSubmitting ? "Guardando…" : submitText}
                </button>
            </div>
        </form>
    );
}
