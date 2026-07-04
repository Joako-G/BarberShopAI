import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ServicesTable } from "../components/services/ServicesTable";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import sharedStyles from "../components/ui/styles/shared.module.css";
import { notifyError, notifySuccess } from "../services/notifications";
import { getServices, toggleState } from "../services/serviceApi";
import { getAppointmentSettings } from "../services/settingsApi";
import type { Service } from "../types/service";
import { classNames } from "../utils/classNames";

interface PendingServiceToggle {
    id: string;
    isActive: boolean;
    serviceName: string;
}

export function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [defaultBufferMinutes, setDefaultBufferMinutes] = useState(0);
    const [pendingToggle, setPendingToggle] = useState<PendingServiceToggle | null>(null);
    const [updatingService, setUpdatingService] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const requestId = window.setTimeout(() => {
            const loadServices = async () => {
                try {
                    const [servicesData, appointmentSettings] = await Promise.all([
                        getServices(),
                        getAppointmentSettings(),
                    ]);

                    setServices(servicesData);
                    setDefaultBufferMinutes(appointmentSettings.default_buffer_minutes);
                } catch {
                    setError("No se pudieron cargar los servicios.");
                } finally {
                    setLoading(false);
                }
            };

            void loadServices();
        }, 0);

        return () => window.clearTimeout(requestId);
    }, []);

    const handleToggleService = (
        id: string,
        isActive: boolean,
        serviceName: string
    ) => {
        setPendingToggle({ id, isActive, serviceName });
    };

    const confirmToggleService = async () => {
        if (!pendingToggle) return;

        setError(null);
        setUpdatingService(true);

        try {
            const updatedService = await toggleState(
                pendingToggle.id,
                pendingToggle.isActive
            );
            setServices((current) =>
                current.map((service) =>
                    service.id === pendingToggle.id ? updatedService : service
                )
            );
            notifySuccess({
                title: "Servicio actualizado",
                description: "El estado del servicio se actualizó correctamente.",
            });
            setPendingToggle(null);
        } catch {
            notifyError({
                title: "No se pudo actualizar el servicio",
                description: "Intentá nuevamente en unos segundos.",
            });
        } finally {
            setUpdatingService(false);
        }
    };

    return (
        <section className={sharedStyles.page}>
            <ConfirmDialog
                confirmText={pendingToggle?.isActive ? "Activar" : "Desactivar"}
                description={`Esta acción ${pendingToggle?.isActive ? "activará" : "desactivará"} el servicio "${pendingToggle?.serviceName ?? ""}".`}
                loading={updatingService}
                open={pendingToggle !== null}
                title="Confirmar cambio de estado"
                onConfirm={() => void confirmToggleService()}
                onOpenChange={(open) => {
                    if (!open) setPendingToggle(null);
                }}
            />

            <header className={sharedStyles.pageHeader}>
                <div>
                    <span className={sharedStyles.pageEyebrow}>Catálogo</span>
                    <h1>Servicios</h1>
                    <p>Definí una oferta clara con tiempos y precios siempre visibles.</p>
                </div>
                <button
                    className={classNames(sharedStyles.button, sharedStyles.buttonPrimary)}
                    onClick={() => navigate("/services/new")}
                    type="button"
                >
                    + Nuevo servicio
                </button>
            </header>

            {error && (
                <div className={classNames(sharedStyles.notice, sharedStyles.noticeError)}>
                    {error}
                </div>
            )}

            <section className={sharedStyles.card}>
                <div className={sharedStyles.cardHeader}>
                    <div>
                        <h2>Catálogo de servicios</h2>
                        <span className={sharedStyles.tableSecondary}>
                            {services.filter((service) => service.is_active).length} activos
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className={sharedStyles.loadingState}>
                        <span className={sharedStyles.loadingSpinner} />
                        <strong>Cargando servicios...</strong>
                    </div>
                ) : services.length === 0 ? (
                    <div className={sharedStyles.emptyState}>
                        <strong>No hay servicios registrados</strong>
                        <span>Creá el primero para habilitar las reservas.</span>
                    </div>
                ) : (
                    <ServicesTable
                        services={services}
                        defaultBufferMinutes={defaultBufferMinutes}
                        handleEditService={(id) => navigate(`/services/${id}/edit`)}
                        handleToggleService={handleToggleService}
                    />
                )}
            </section>
        </section>
    );
}
